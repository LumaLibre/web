package net.lumamc.web

import io.javalin.Javalin
import io.javalin.http.staticfiles.Location
import io.javalin.json.JsonMapper
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.news.NewsManager
import java.io.File
import java.lang.reflect.Type

class Server {

    companion object {
        private const val DISCORD_INVITE = "https://discord.com/invite/zMKEAhHHac"

        val INSTANCE = Server()
    }

    private lateinit var internalServer: Javalin

    private val gsonMapper = object : JsonMapper {
        private val gson = Util.GSON

        override fun <T : Any> fromJsonString(json: String, targetType: Type): T =
            gson.fromJson(json, targetType)

        override fun toJsonString(obj: Any, type: Type) =
            gson.toJson(obj)

    }

    fun initServer() {
        val cfg = ConfigManager.config
        internalServer = Javalin.create { config ->
            config.bundledPlugins.enableCors { cors ->
                cors.addRule {
                    it.anyHost()
                }
            }
            config.jsonMapper(gsonMapper)
            config.staticFiles.add(cfg.staticFilesDirectory, Location.EXTERNAL)
        }
            // Handle discord redirects here instead of in the frontend
            .get("/chat") { ctx -> ctx.redirect(DISCORD_INVITE) }
            .get("/discord") { ctx -> ctx.redirect(DISCORD_INVITE) }
            .get("/api/news/{id}") { ctx ->
                val id = ctx.pathParam("id")
                val newsPost = NewsManager.getNewsPost(id)
                if (newsPost != null) {
                    ctx.json(newsPost)
                } else {
                    ctx.status(404)
                }
            }
            .get("/api/news") { ctx ->
                ctx.json(NewsManager.getNewsPosts())
            }
            // Fallback: if no static file is found and it's not an API call, serve index.html
            .error(404) { ctx ->
                // Only handle non-API requests
                if (!ctx.path().startsWith("/api")) {
                    val indexFile = File(cfg.staticFilesDirectory, "index.html")
                    if (indexFile.exists()) {
                        ctx.contentType("text/html")
                        ctx.result(indexFile.readText())
                    } else {
                        ctx.result("index.html not found")
                    }
                }
            }
            .start(cfg.host, cfg.port)

    }

    fun stopServer() {
        internalServer.stop()
    }
}