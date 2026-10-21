package net.lumamc.web.model

import net.lumamc.web.Util
import com.google.gson.JsonParser
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.File
import java.io.IOException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import javax.imageio.ImageIO

object SkinCache {

    // TODO: config
    private const val MAX_ENTRIES = 60
    private const val CACHE_TTL_MS = 60 * 60 * 1000L
    private val client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()

    private val cacheDir: File = Util.getDataFolderPath().resolve("cache").toFile()
    private val lock = Any()

    init {
        if (!cacheDir.exists()) {
            cacheDir.mkdirs()
        }
    }

    fun getSkin(idOrName: String): BufferedImage {
        val file = fileFor(idOrName)

        synchronized(lock) {
            if (file.exists() && System.currentTimeMillis() - file.lastModified() in 0 until CACHE_TTL_MS) {
                val cached = ImageIO.read(file)
                if (cached != null) {
                    return cached
                }
                // The file was somehow unreadable, fall through and refetch.
            }
        }

        val bytes = download(idOrName)
        val image = ImageIO.read(ByteArrayInputStream(bytes))
            ?: throw IOException("Could not decode skin for $idOrName")

        synchronized(lock) {
            file.writeBytes(bytes)
            file.setLastModified(System.currentTimeMillis())
            evictOldest()
        }

        return image
    }

    private fun download(idOrName: String): ByteArray {
        val url = SkinSource.textureUrl(idOrName) { endpoint ->
            JsonParser.parseString(downloadUrl(endpoint, 64 * 1024).toString(Charsets.UTF_8)).asJsonObject
        }
        return downloadUrl(url, 2 * 1024 * 1024)
    }

    private fun downloadUrl(url: String, maxBytes: Int): ByteArray {
        val request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(15)).GET().build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofInputStream())
        response.body().use { stream ->
            if (response.statusCode() != 200) throw IOException("Skin service returned HTTP ${response.statusCode()}")
            val bytes = stream.readNBytes(maxBytes + 1)
            if (bytes.size > maxBytes) throw IOException("Skin response exceeds size limit")
            return bytes
        }
    }

    private fun evictOldest() {
        val files = cacheDir.listFiles { f -> f.isFile && f.extension == "png" } ?: return
        if (files.size <= MAX_ENTRIES) {
            return
        }

        val sorted = files.sortedBy { it.lastModified() }
        val removeCount = files.size - MAX_ENTRIES
        for (i in 0 until removeCount) {
            sorted[i].delete()
        }
    }

    private fun fileFor(idOrName: String): File {
        val key = SkinSource.cacheKey(idOrName)
        return File(cacheDir, "$key.png")
    }
}
