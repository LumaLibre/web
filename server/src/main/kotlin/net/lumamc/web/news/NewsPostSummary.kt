package net.lumamc.web.news

data class NewsPostSummary(
    val id: String,
    val title: String,
    val thumbnail: String,
    val author: String,
    val timestamp: Long,
    val excerpt: String,
    val unlisted: Boolean
) {
    companion object {
        private const val MAX_EXCERPT_LENGTH = 400

        fun fromNewsPost(post: NewsPost): NewsPostSummary {
            val cleaned = post.content
                .replace(Regex("<a?:[\\w-]+:\\d+>"), "✨")
                .replace(Regex("!\\[([^]]*)]\\([^)]+\\)"), "$1")
                .replace(Regex("\\[([^]]+)]\\([^)]+\\)"), "$1")
                .replace(Regex("https?://\\S+"), "")
                .replace(Regex("[`*_>#~]"), "")
                .replace(Regex(":\\w+:"), "")
                .replace(Regex("\\s+"), " ")
                .trim()

            val excerpt = if (cleaned.length <= MAX_EXCERPT_LENGTH) {
                cleaned
            } else {
                cleaned.take(MAX_EXCERPT_LENGTH).trimEnd() + "…"
            }

            return NewsPostSummary(
                post.id,
                post.title,
                post.thumbnail,
                post.author,
                post.timestamp,
                excerpt,
                post.unlisted
            )
        }
    }
}
