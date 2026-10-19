package net.lumamc.web.store

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import org.slf4j.LoggerFactory
import java.nio.file.AtomicMoveNotSupportedException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption.ATOMIC_MOVE
import java.nio.file.StandardCopyOption.REPLACE_EXISTING

class KnownPackageLimits(private val file: Path) {
    private val logger = LoggerFactory.getLogger(KnownPackageLimits::class.java)
    private val gson = GsonBuilder().setPrettyPrinting().create()
    private val entries = mutableMapOf<String, CheckoutLimits.Limits>()
    private var dirty = false

    init {
        if (Files.exists(file)) {
            try {
                val root = JsonParser.parseString(Files.readString(file)).asJsonObject
                require(root.get("version")?.asInt == 1) { "Unsupported limits file version" }
                val packages = root.getAsJsonObject("packages")
                for ((id, element) in packages.entrySet()) {
                    if (!validId(id) || !element.isJsonObject || entries.size >= 4096) continue
                    val value = element.asJsonObject
                    val limits = CheckoutLimits.Limits(readLimit(value, "global"), readLimit(value, "user"))
                    if (limits.global != null || limits.user != null) entries[id] = limits
                }
            } catch (e: Exception) {
                entries.clear()
                logger.warn("Could not load configured package limits from {}. Limits will be learned from baskets.", file, e)
            }
        }
    }

    @Synchronized
    fun observe(limits: Map<String, CheckoutLimits.Limits>) {
        for ((id, value) in limits) {
            if (!validId(id)) continue
            val normalized = CheckoutLimits.Limits(normalize(value.global), normalize(value.user))
            if (normalized.global == null && normalized.user == null) {
                if (entries.remove(id) != null) dirty = true
            } else if (entries[id] != normalized && (entries.containsKey(id) || entries.size < 4096)) {
                entries[id] = normalized
                dirty = true
            }
        }
        if (dirty) save()
    }

    @Synchronized
    fun read(): Map<String, CheckoutLimits.Limits> = entries.toMap()

    private fun save() {
        var temporary: Path? = null
        try {
            val target = file.toAbsolutePath()
            Files.createDirectories(target.parent)
            temporary = Files.createTempFile(target.parent, "package-limits-", ".tmp")
            Files.writeString(temporary, gson.toJson(mapOf("version" to 1, "packages" to entries)))
            try {
                Files.move(temporary, target, ATOMIC_MOVE, REPLACE_EXISTING)
            } catch (_: AtomicMoveNotSupportedException) {
                Files.move(temporary, target, REPLACE_EXISTING)
            }
            dirty = false
        } catch (e: Exception) {
            // Keep serving the latest values and retry saving on the next observation.
            logger.warn("Could not save configured package limits to {}. They may be lost on restart.", file, e)
        } finally {
            temporary?.let {
                try { Files.deleteIfExists(it) } catch (_: Exception) { }
            }
        }
    }

    private fun validId(id: String) = id.toLongOrNull()?.let { it > 0 } == true

    private fun normalize(limit: CheckoutLimits.Limit?) = limit?.takeIf { it.limit > 0 }?.copy(timestamp = 0)

    private fun readLimit(value: JsonObject, name: String): CheckoutLimits.Limit? {
        val limit = value.get(name)?.takeIf { it.isJsonObject }?.asJsonObject
            ?.get("limit")?.takeIf { it.isJsonPrimitive }?.asString
            ?.toIntOrNull()?.takeIf { it > 0 } ?: return null
        return CheckoutLimits.Limit(limit, 0)
    }
}
