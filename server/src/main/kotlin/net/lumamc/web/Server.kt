package net.lumamc.web

import io.javalin.Javalin
import io.javalin.http.staticfiles.Location
import io.javalin.json.JsonMapper
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.model.ModelManager
import net.lumamc.web.model.RenderOptions
import net.lumamc.web.model.SkinCache
import net.lumamc.web.model.SkinRenderer
import net.lumamc.web.news.NewsManager
import net.lumamc.web.news.NewsPageMetadata
import net.lumamc.web.store.CheckoutLimits
import net.lumamc.web.store.StoreInventory
import net.lumamc.web.store.TebexSignature
import com.google.gson.JsonParser
import java.awt.Color
import java.io.ByteArrayOutputStream
import java.io.File
import java.lang.reflect.Type
import javax.imageio.ImageIO

class Server {

    companion object {
        private const val DISCORD_INVITE = "https://discord.com/invite/zMKEAhHHac"

        val INSTANCE = Server()
    }

    private lateinit var internalServer: Javalin
    private lateinit var inventory: StoreInventory

    private val gsonMapper = object : JsonMapper {
        private val gson = Util.GSON

        override fun <T : Any> fromJsonString(json: String, targetType: Type): T =
            gson.fromJson(json, targetType)

        override fun toJsonString(obj: Any, type: Type) =
            gson.toJson(obj)

    }

    fun initServer() {
        val cfg = ConfigManager.config
        inventory = StoreInventory(cfg, Util.getDataFolderPath(), cfg.storeWebhookSecret)
        internalServer = Javalin.create { config ->
            config.bundledPlugins.enableCors { cors ->
                cors.addRule {
                    it.anyHost()
                }
            }
            config.jsonMapper(gsonMapper)
            config.staticFiles.add(cfg.staticFilesDirectory, Location.EXTERNAL)
        }
        internalServer
            // Handle discord redirects here instead of in the frontend
            .get("/chat") { ctx -> ctx.redirect(DISCORD_INVITE) }
            .get("/discord") { ctx -> ctx.redirect(DISCORD_INVITE) }
            .get("/news/{id}") { ctx ->
                val post = NewsManager.getNewsPost(ctx.pathParam("id"))
                val index = File(cfg.staticFilesDirectory, "index.html")
                if (post == null || !index.isFile) {
                    ctx.status(404)
                } else {
                    ctx.header("Cache-Control", "no-cache")
                    ctx.contentType("text/html; charset=utf-8")
                    ctx.result(NewsPageMetadata.render(index.readText(), post))
                }
            }
            .get("/api/store/package-limits") { ctx ->
                ctx.header("Cache-Control", "no-store")
                ctx.json(inventory.snapshot())
            }
            .post("/api/store/webhooks/tebex") { ctx ->
                ctx.header("Cache-Control", "no-store")
                if (inventory.webhookSecret.isBlank()) {
                    ctx.status(503).json(mapOf("message" to "Webhook is not configured"))
                    return@post
                }
                val body = ctx.bodyAsBytes()
                if (body.size > 256 * 1024) {
                    ctx.status(413)
                    return@post
                }
                if (!TebexSignature.verify(body, ctx.header("X-Signature"), inventory.webhookSecret)) {
                    ctx.status(401)
                    return@post
                }
                val event = try { JsonParser.parseString(body.toString(Charsets.UTF_8)).asJsonObject }
                catch (_: Exception) { ctx.status(400); return@post }
                if (event.get("type")?.takeIf { it.isJsonPrimitive }?.asString == "validation.webhook") {
                    val id = event.get("id")?.takeIf { it.isJsonPrimitive }?.asString
                    if (id.isNullOrBlank() || id.length > 160) ctx.status(400)
                    else ctx.json(mapOf("id" to id))
                    return@post
                }
                try {
                    inventory.accept(event)
                    ctx.status(204)
                } catch (_: IllegalArgumentException) {
                    ctx.status(400).json(mapOf("message" to "Invalid payment event"))
                } catch (_: Exception) {
                    // No 2xx acknowledgment until the payment is safely on disk.
                    ctx.status(503).json(mapOf("message" to "Inventory event could not be saved"))
                }
            }
            .get("/api/store/baskets/{ident}/limits") { ctx ->
                ctx.header("Cache-Control", "no-store")
                val ident = ctx.pathParam("ident")
                if (!CheckoutLimits.validIdent(ident)) {
                    ctx.status(400).json(mapOf("message" to "Invalid basket identifier"))
                    return@get
                }
                try {
                    ctx.json(CheckoutLimits.fetch(ident))
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                    ctx.status(503).json(mapOf("message" to "Package limits are temporarily unavailable"))
                } catch (e: Exception) {
                    ctx.status(502).json(mapOf("message" to "Package limits are temporarily unavailable"))
                }
            }
            .get("/api/news/summaries") { ctx ->
                val limit = ctx.queryParam("limit")?.toIntOrNull()
                ctx.json(NewsManager.getNewsPostSummaries(limit))
            }
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
            // Render a skin onto a model and return a png
            .get("/api/render/{pose}/{name}") { ctx ->
                val model = ModelManager.getModel(ctx.pathParam("pose"))
                if (model == null) {
                    ctx.status(404)
                    return@get
                }

                val skin = try {
                    SkinCache.getSkin(ctx.pathParam("name"))
                } catch (e: Exception) {
                    ctx.status(404)
                    return@get
                }

                val options = RenderOptions()
                ctx.queryParam("width")?.toIntOrNull()?.let { options.width = it }
                ctx.queryParam("height")?.toIntOrNull()?.let { options.height = it }
                ctx.queryParam("yaw")?.toDoubleOrNull()?.let { options.yaw = it }
                ctx.queryParam("pitch")?.toDoubleOrNull()?.let { options.pitch = it }
                ctx.queryParam("scale")?.toDoubleOrNull()?.let { options.scale = it }
                ctx.queryParam("supersample")?.toIntOrNull()?.let { options.supersample = it }
                ctx.queryParam("alphacutoff")?.toIntOrNull()?.let { options.alphaCutoff = it }
                ctx.queryParam("background")?.let { options.background = Color.decode(it) }
                ctx.queryParam("trim")?.toBooleanStrictOrNull()?.let { options.trim = it }
                ctx.queryParam("padding")?.toIntOrNull()?.let { options.trimPadding = it }

                val image = SkinRenderer(model).render(skin, options)

                val output = ByteArrayOutputStream()
                ImageIO.write(image, "png", output)
                ctx.contentType("image/png")
                ctx.result(output.toByteArray())
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
        inventory.start()
    }

    fun stopServer() {
        inventory.close()
        internalServer.stop()
    }

    fun importStockHistory(): Int = inventory.importHistory(Util.getDataFolderPath().resolve("stock-history.json"))

    fun refreshStoreInventory(): String = inventory.refresh()
}
