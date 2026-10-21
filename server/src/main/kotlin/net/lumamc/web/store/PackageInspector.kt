package net.lumamc.web.store

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration
import java.time.Instant

class InspectionFailure(val status: Int, val detail: String) : RuntimeException("Tebex inspection returned HTTP $status")

interface InspectionApi {
    fun packages(): List<Long>
    fun requiresDiscordId(id: Long): Boolean
    fun createBasket(): String
    fun add(ident: String, id: Long, variables: Map<String, String>)
    fun remove(ident: String, id: Long)
    fun limits(ident: String): Map<String, CheckoutLimits.Limits>
}

class TebexInspectionApi(private val token: String, private val username: String) : InspectionApi {
    private val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()
    private val gson = Gson()
    init { require(token.matches(Regex("[A-Za-z0-9-]+")) && username.isNotBlank()) }
    private val account = "https://headless.tebex.io/api/accounts/$token"

    private fun request(url: String, body: Any? = null): JsonObject {
        val builder = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(15))
            .header("Accept", "application/json").header("User-Agent", "LumaStore-Inventory/1.0")
        if (body == null) builder.GET() else builder.header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(body)))
        val response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() !in 200..299) {
            val detail = runCatching {
                val error = JsonParser.parseString(response.body()).asJsonObject
                listOf("title", "detail", "message").mapNotNull { error.get(it)?.takeIf { v -> v.isJsonPrimitive }?.asString }.joinToString(" ")
            }.getOrDefault("")
            throw InspectionFailure(response.statusCode(), detail)
        }
        return if (response.body().isBlank()) JsonObject() else JsonParser.parseString(response.body()).asJsonObject
    }

    override fun packages() = discoverPackages { path -> request("$account$path") }

    override fun requiresDiscordId(id: Long): Boolean {
        require(id > 0)
        // The catalogue may omit options; individual package details include them.
        return requiresDiscordId(request("$account/packages/$id").getAsJsonObject("data"))
    }

    companion object {
        internal fun discoverPackages(fetch: (String) -> JsonObject): List<Long> {
            val catalog = fetch("/packages").getAsJsonArray("data")
            // The dedicated offers category can be omitted from navigation.
            val offers = try {
                fetch("/categories/lto?includePackages=1").getAsJsonObject("data")
                    .get("packages")?.takeIf { it.isJsonArray }?.asJsonArray
            } catch (e: InspectionFailure) {
                if (e.status != 404 && !(e.status == 422 && e.detail.contains("Category not found", ignoreCase = true))) throw e
                null // Not created/published yet; keep inspecting the regular catalogue.
            }
            return (catalog.toList() + (offers?.toList() ?: emptyList()))
                .map { it.asJsonObject.get("id").asLong }.filter { it > 0 }.distinct()
        }

        internal fun requiresDiscordId(pkg: JsonObject): Boolean =
            pkg.get("options")?.takeIf { it.isJsonArray }?.asJsonArray?.any { entry ->
                val option = entry.asJsonObject
                option.get("required")?.asBoolean == true &&
                    (option.get("type")?.asString == "discord_id" || option.get("name")?.asString == "discord_id")
            } == true
    }

    override fun createBasket(): String = request("$account/baskets", mapOf(
        "username" to username, "complete_url" to "https://lumamc.net/store/complete",
        "cancel_url" to "https://lumamc.net/store", "custom" to mapOf("purpose" to "server-limit-inspection")
    )).getAsJsonObject("data").get("ident").asString.also { require(CheckoutLimits.validIdent(it)) }

    override fun add(ident: String, id: Long, variables: Map<String, String>) {
        require(CheckoutLimits.validIdent(ident) && id > 0)
        request("https://headless.tebex.io/api/baskets/$ident/packages", mapOf(
            "package_id" to id, "quantity" to 1, "variable_data" to variables))
    }

    override fun remove(ident: String, id: Long) {
        require(CheckoutLimits.validIdent(ident) && id > 0)
        request("https://headless.tebex.io/api/baskets/$ident/packages/remove", mapOf("package_id" to id))
    }

    override fun limits(ident: String) = CheckoutLimits.fetch(ident, fresh = true)
}

/** One fresh private basket per run. Public HTTP requests cannot trigger this.
 * Journal cleanup before every add, including ambiguous network failures. */
class PackageInspector(
    private val api: InspectionApi,
    private val journal: Path,
    private val publish: (Map<String, CheckoutLimits.Limits>) -> Unit,
    private val soldOut: (Long) -> Unit,
    private val report: (Long, String) -> Unit,
    private val clock: () -> Long = { Instant.now().epochSecond }
) {
    fun run(only: List<Long> = emptyList(), variables: Map<String, Map<String, String>> = emptyMap()) {
        cleanup()
        val ids = api.packages().filter { only.isEmpty() || it in only }.take(500)
        if (ids.isEmpty()) return
        var basket: String? = null
        for (id in ids) {
            if (Thread.currentThread().isInterrupted) return
            var added = false
            try {
                // Skip Discord-gated packages even when inspection variables are configured.
                if (api.requiresDiscordId(id)) continue
                val ident = basket ?: api.createBasket().also { basket = it }
                writeStockFile(journal, Gson().toJson(mapOf("basket" to ident, "package" to id)))
                api.add(ident, id, variables[id.toString()] ?: emptyMap())
                added = true
                val value = api.limits(ident)[id.toString()]
                if (value != null) publish(mapOf(id.toString() to value.copy(observedAt = clock(), globalSoldOutUntil = 0)))
                else report(id, "No limit metadata returned")
            } catch (e: InspectionFailure) {
                if (e.status == 429 || e.status >= 500) throw e
                if (isGlobalSoldOut(e.detail)) soldOut(id)
                else report(id, "HTTP ${e.status}; package may need options, authentication, or an eligible inspection account")
                if (!added) Files.deleteIfExists(journal)
            } finally {
                cleanup()
            }
        }
    }

    private fun cleanup() {
        if (!Files.exists(journal)) return
        val pending = JsonParser.parseString(Files.readString(journal)).asJsonObject
        val ident = pending.get("basket").asString
        val id = pending.get("package").asLong
        require(CheckoutLimits.validIdent(ident) && id > 0)
        try { api.remove(ident, id) }
        catch (e: InspectionFailure) {
            if (e.status != 404) throw e
        }
        Files.deleteIfExists(journal)
    }

    companion object {
        fun isGlobalSoldOut(message: String): Boolean =
            !Regex("rate.?limit|too many requests", RegexOption.IGNORE_CASE).containsMatchIn(message) &&
            (Regex("sold out|out of stock", RegexOption.IGNORE_CASE).containsMatchIn(message) ||
                (Regex("global.{0,40}limit|limit.{0,40}global", RegexOption.IGNORE_CASE).containsMatchIn(message) &&
                    Regex("reached|exceeded|exhausted", RegexOption.IGNORE_CASE).containsMatchIn(message)))
    }
}
