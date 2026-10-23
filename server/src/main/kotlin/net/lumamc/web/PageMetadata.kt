package net.lumamc.web

/** Has to be here, React can't do this */
data class PageMetadata(
    val title: String,
    val description: String,
    val url: String,
    val image: String? = null,
    val imageAlt: String = title,
    val type: String = "website"
) {
    fun render(template: String): String {
        val tags = buildString {
            appendLine("<title>${escape(title)}</title>")
            appendLine("<link rel=\"canonical\" href=\"${escape(url)}\">")
            fun tag(attribute: String, key: String, value: String) {
                appendLine("<meta $attribute=\"$key\" content=\"${escape(value)}\">")
            }
            tag("name", "description", description)
            tag("property", "og:type", type)
            tag("property", "og:title", title)
            tag("property", "og:description", description)
            tag("property", "og:url", url)
            tag("name", "twitter:card", if (image == null) "summary" else "summary_large_image")
            tag("name", "twitter:title", title)
            tag("name", "twitter:description", description)
            if (image != null) {
                tag("property", "og:image", image)
                tag("property", "og:image:alt", imageAlt)
                tag("name", "twitter:image", image)
                tag("name", "twitter:image:alt", imageAlt)
            }
        }
        return head.replace(template) { match ->
            val withoutDefaults = canonical.replace(titleTag.replace(match.groupValues[2], ""), "")
            val cleaned = meta.replace(withoutDefaults) { tag ->
                val key = metaKey.find(tag.value)?.groupValues?.get(1)?.lowercase()
                if (key in keys || key?.startsWith("og:image:") == true) "" else tag.value
            }
            match.groupValues[1] + cleaned + tags + match.groupValues[3]
        }
    }

    companion object {
        private val head = Regex("(<head\\b[^>]*>)([\\s\\S]*?)(</head\\s*>)", RegexOption.IGNORE_CASE)
        private val titleTag = Regex("<title\\b[^>]*>[\\s\\S]*?</title\\s*>", RegexOption.IGNORE_CASE)
        private val meta = Regex("<meta\\b[^>]*>", RegexOption.IGNORE_CASE)
        private val metaKey = Regex("(?:name|property)\\s*=\\s*['\"]([^'\"]+)['\"]", RegexOption.IGNORE_CASE)
        private val canonical = Regex("<link\\b[^>]*\\brel\\s*=\\s*['\"]canonical['\"][^>]*>", RegexOption.IGNORE_CASE)
        private val keys = setOf("description", "og:title", "og:description", "og:image", "og:url",
            "og:type", "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt")

        fun forPath(path: String): PageMetadata? = when (path.trimEnd('/')) {
            "/rules" -> PageMetadata("Rules • LumaMC",
                "Here are Luma's rules! Players are encouraged to read and stay up-to-date with our rules to avoid any issues within gameplay or communication between players!",
                "https://lumamc.net/rules")
            "/vote" -> PageMetadata("Vote • LumaMC",
                "Help more players discover our community, earn in-game rewards, and browse Luma's top voters for this month.",
                "https://lumamc.net/vote")
            "/store" -> PageMetadata("Store • LumaMC",
                "Visit our digital store and support the development and expansion of LumaMC!",
                "https://lumamc.net/store", "https://lumamc.net/StoreCover.webp")
            "/news" -> PageMetadata("News • LumaMC",
                "Browse the latest news and updates from LumaMC!",
                "https://lumamc.net/news")
            else -> null
        }

        private fun escape(value: String) = value.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;")
    }
}
