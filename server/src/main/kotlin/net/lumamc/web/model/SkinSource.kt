package net.lumamc.web.model

import com.google.gson.JsonObject
import java.io.IOException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

internal object SkinSource {
    fun bedrockXuid(identity: String): String? {
        val value = identity.trim()
        if (value.matches(Regex("[0-9]{16,20}"))) {
            return value.toULongOrNull()?.takeIf { it > 0u }?.toString()
        }
        val uuid = value.replace("-", "")
        if (uuid.matches(Regex("0{16}[a-fA-F0-9]{16}"))) {
            return uuid.takeLast(16).toULong(16).takeIf { it > 0u }?.toString()
        }
        return null
    }

    fun textureUrl(identity: String, fetchJson: (String) -> JsonObject): String {
        val value = identity.trim()
        require(value.isNotEmpty() && value.length <= 128)
        val xuid = bedrockXuid(value) ?: if (value.startsWith(".")) {
            val gamertag = value.removePrefix(".").replace('_', ' ').trim()
            require(gamertag.isNotEmpty())
            val account = fetchJson("https://api.geysermc.org/v2/xbox/xuid/${encode(gamertag)}")
            account.get("xuid")?.takeIf { it.isJsonPrimitive }?.asString
                ?.toULongOrNull()?.takeIf { it > 0u }?.toString()
                ?: throw IOException("Bedrock account not found")
        } else null
        if (xuid == null) return "https://minotar.net/download/${encode(value)}"
        val skin = fetchJson("https://api.geysermc.org/v2/skin/$xuid")
        val texture = skin.get("texture_id")?.takeIf { it.isJsonPrimitive }?.asString
        if (texture == null || !texture.matches(Regex("[a-fA-F0-9]{32,64}"))) {
            throw IOException("Bedrock skin is not available from Geyser")
        }
        return "https://textures.minecraft.net/texture/$texture"
    }

    fun cacheKey(identity: String): String {
        val normalized = identity.trim().lowercase()
        return "skin-v2-" + MessageDigest.getInstance("SHA-256")
            .digest(normalized.toByteArray(StandardCharsets.UTF_8)).joinToString("") { "%02x".format(it) }
    }

    private fun encode(value: String) = URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20")
}
