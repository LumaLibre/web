package net.lumamc.web.news

import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.configuration.NewsConfig
import net.lumamc.web.configuration.sector.NewsArticle

object NewsManager {

    private val newsConfig: NewsConfig = ConfigManager.newsConfig

    fun getNewsArticle(id: String): NewsArticle? {
        return newsConfig.news[id]
    }

    fun getNewsPost(id: String): NewsPost? {
        return newsConfig.news[id]?.let { NewsPost.fromNewsArticle(id, it) }
    }

    fun getNewsArticles(): Map<String, NewsArticle> {
        return newsConfig.news
    }

    fun getNewsPosts(): Map<String, NewsPost> {
        return newsConfig.news.mapValues { NewsPost.fromNewsArticle(it.key, it.value) }
    }

    // Adding news articles programmatically

    fun addNewsArticle(id: String, newsArticle: NewsArticle) {
        newsConfig.news[id] = newsArticle
        newsConfig.save()
    }

    fun removeNewsArticle(id: String) {
        newsConfig.news.remove(id)
        newsConfig.save()
    }
}