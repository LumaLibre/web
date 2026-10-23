package net.lumamc.web.news

import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/** Article previews must be in the initial HTML, not added only after React loads. */
object NewsPageMetadata {
    private const val ORIGIN = "https://lumamc.net"
    private const val DEFAULT_IMAGE = "https://raw.githubusercontent.com/LumaLibre/artwork/refs/heads/master/backgrounds/playground-d3.png"
    private val head = Regex("(<head\\b[^>]*>)([\\s\\S]*?)(</head\\s*>)", RegexOption.IGNORE_CASE)
    private val title = Regex("<title\\b[^>]*>[\\s\\S]*?</title\\s*>", RegexOption.IGNORE_CASE)
    private val meta = Regex("<meta\\b[^>]*>", RegexOption.IGNORE_CASE)
    private val metaKey = Regex("(?:name|property)\\s*=\\s*['\"]([^'\"]+)['\"]", RegexOption.IGNORE_CASE)
    private val canonical = Regex("<link\\b[^>]*\\brel\\s*=\\s*['\"]canonical['\"][^>]*>", RegexOption.IGNORE_CASE)
    private val keys = setOf("description", "og:title", "og:description", "og:image", "og:image:alt", "og:url",
        "og:type", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt")

    fun render(template: String, post: NewsPost): String {
        val displayTitle = post.title.replace(Regex("\\s*[-–—]\\s*\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?\\s*$"), "").trim()
        val pageTitle = "$displayTitle • LumaMC"
        val description = description(post)
        val image = imageUrl(post.thumbnail)
        val url = "$ORIGIN/news/${URLEncoder.encode(post.id, StandardCharsets.UTF_8).replace("+", "%20")}"
        val tags = buildString {
            appendLine("<title>${escape(pageTitle)}</title>")
            appendLine("<link rel=\"canonical\" href=\"${escape(url)}\">")
            fun tag(attribute: String, key: String, value: String) {
                appendLine("<meta $attribute=\"$key\" content=\"${escape(value)}\">")
            }
            tag("name", "description", description)
            tag("property", "og:type", "article")
            tag("property", "og:title", pageTitle)
            tag("property", "og:description", description)
            tag("property", "og:url", url)
            tag("property", "og:image", image)
            tag("property", "og:image:alt", displayTitle)
            tag("name", "twitter:card", "summary_large_image")
            tag("name", "twitter:title", pageTitle)
            tag("name", "twitter:description", description)
            tag("name", "twitter:image", image)
            tag("name", "twitter:image:alt", displayTitle)
        }
        return head.replace(template) { match ->
            val withoutDefaults = canonical.replace(title.replace(match.groupValues[2], ""), "")
            val cleaned = meta.replace(withoutDefaults) { tag ->
                if (metaKey.find(tag.value)?.groupValues?.get(1)?.lowercase() in keys) "" else tag.value
            }
            match.groupValues[1] + cleaned + tags + match.groupValues[3]
        }
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

    private fun escape(value: String) = value.replace("&", "&amp;").replace("<", "&lt;")
        .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;")
}
