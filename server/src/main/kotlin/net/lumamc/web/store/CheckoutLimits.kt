package net.lumamc.web.store

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import net.lumamc.web.Util
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

object CheckoutLimits {
    data class Limit(val limit: Int, val timestamp: Long)
    data class Limits(val global: Limit?, val user: Limit?)
    private data class Cached(val expiresAt: Long, val limits: Map<String, Limits>)
    private val cache = ConcurrentHashMap<String, Cached>()
    private val catalog by lazy { KnownPackageLimits(Util.getDataFolderPath().resolve("package-limits.json")) }
    private val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()

    fun validIdent(ident: String) = ident.matches(Regex("[A-Za-z0-9-]{10,128}"))

    fun knownLimits(): Map<String, Limits> = catalog.read()

    fun fetch(ident: String): Map<String, Limits> {
        require(validIdent(ident))
        val now = System.currentTimeMillis()
        cache[ident]?.takeIf { it.expiresAt > now }?.let { return it.limits }
        val request = HttpRequest.newBuilder(URI.create("https://checkout.tebex.io/api/baskets/$ident"))
            .timeout(Duration.ofSeconds(10))
            .header("Accept", "application/json")
            .header("User-Agent", "LumaStore-LimitInspection/1.0")
            .GET().build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        check(response.statusCode() == 200) { "Checkout limits unavailable" }
        val limits = parse(JsonParser.parseString(response.body()).asJsonObject)
        catalog.observe(limits)
        cache.entries.removeIf { it.value.expiresAt <= now }
        if (cache.size < 256) cache[ident] = Cached(now + 30_000, limits)
        return limits
    }

    fun parse(basket: JsonObject): Map<String, Limits> {
        val result = mutableMapOf<String, Limits>()
        val rows = basket.get("rows")?.takeIf { it.isJsonArray }?.asJsonArray ?: return result
        for (element in rows) {
            if (!element.isJsonObject) continue
            val row = element.asJsonObject
            val id = row.get("package")?.takeIf { it.isJsonPrimitive }?.asString
                ?.toLongOrNull()?.takeIf { it > 0 } ?: continue
            val meta = row.get("meta")?.takeIf { it.isJsonObject }?.asJsonObject ?: continue
            val limits = meta.get("limits")?.takeIf { it.isJsonObject }?.asJsonObject ?: continue
            result[id.toString()] = Limits(readLimit(limits, "global"), readLimit(limits, "user"))
        }
        return result
    }

    private fun readLimit(limits: JsonObject, key: String): Limit? {
        val value = limits.get(key)?.takeIf { it.isJsonObject }?.asJsonObject ?: return null
        val enabled = value.get("enabled")?.takeIf { it.isJsonPrimitive }?.asJsonPrimitive
        if (enabled == null || !enabled.isBoolean || !enabled.asBoolean) return null
        val count = value.get("limit")?.takeIf { it.isJsonPrimitive }?.asString
            ?.toIntOrNull()?.takeIf { it > 0 } ?: return null
        val timestamp = value.get("timestamp")?.takeIf { it.isJsonPrimitive }?.asString?.toLongOrNull() ?: 0
        return Limit(count, timestamp)
    }
}
