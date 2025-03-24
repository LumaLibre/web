package net.lumamc.web

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import net.lumamc.web.news.NewsPost
import net.lumamc.web.news.NewsPost.NewsPostTypeAdapter
import java.io.File
import java.nio.file.Path

object Util {

    val GSON: Gson = GsonBuilder()
        .setPrettyPrinting()
        .registerTypeAdapter(NewsPost::class.java, NewsPostTypeAdapter())
        .create()

    fun getDataFolderPath(): Path {
        val path: String = this.javaClass.protectionDomain.codeSource.location.path
        val jarFile = File(path)
        val value: Path = jarFile.parentFile.toPath()
        val asFile = value.toFile()
        if (!asFile.exists()) {
            asFile.mkdirs()
        }
        return asFile.toPath()
    }
}