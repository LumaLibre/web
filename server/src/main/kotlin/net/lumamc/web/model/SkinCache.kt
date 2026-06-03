package net.lumamc.web.model

import net.lumamc.web.Util
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.File
import java.io.IOException
import java.net.URI
import javax.imageio.ImageIO

object SkinCache {

    // TODO: config
    private const val MAX_ENTRIES = 60
    private const val DOWNLOAD_URL = "https://minotar.net/download/"

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
            if (file.exists()) {
                file.setLastModified(System.currentTimeMillis())
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
        val url = URI.create(DOWNLOAD_URL + idOrName).toURL()
        url.openStream().use { stream ->
            return stream.readBytes()
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
        val key = idOrName.lowercase().filter { it.isLetterOrDigit() || it == '_' || it == '-' }
        return File(cacheDir, "$key.png")
    }
}