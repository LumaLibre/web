package net.lumamc.web.news

import net.lumamc.web.PageMetadata
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object NewsPageMetadata {
    private const val ORIGIN = "https://lumamc.net"
    private const val DEFAULT_IMAGE = "https://raw.githubusercontent.com/LumaLibre/artwork/refs/heads/master/backgrounds/playground-d3.png"
    fun render(template: String, post: NewsPost): String {
        val displayTitle = post.title.replace(Regex("\\s*[-–—]\\s*\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?\\s*$"), "").trim()
        val pageTitle = "$displayTitle • LumaMC"
        val description = description(post)
        val image = imageUrl(post.thumbnail)
        val url = "$ORIGIN/news/${URLEncoder.encode(post.id, StandardCharsets.UTF_8).replace("+", "%20")}"
        return PageMetadata(pageTitle, description, url, image, null, "article").render(template)
    }

    internal fun description(post: NewsPost): String {
        val content = post.content
            .replace(Regex("<(script|style)\\b[^>]*>[\\s\\S]*?</\\1\\s*>", RegexOption.IGNORE_CASE), " ")
            .replace(Regex("<[^>]*>"), " ")
        val text = NewsPostSummary.excerpt(content)
            .replace(Regex("\\s+"), " ").trim()
            .ifBlank { "Read ${post.title} on LumaMC." }
        return if (text.codePointCount(0, text.length) <= 200) text
            else text.substring(0, text.offsetByCodePoints(0, 199)).trimEnd() + "…"
    }

    private fun imageUrl(thumbnail: String): String = runCatching {
        URI("$ORIGIN/").resolve(thumbnail.trim()).takeIf {
            thumbnail.isNotBlank() && it.scheme in setOf("https", "http") && !it.host.isNullOrBlank()
        }?.toASCIIString()
    }.getOrNull() ?: DEFAULT_IMAGE

}
