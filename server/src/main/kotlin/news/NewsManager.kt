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
            .entries
            .reversed() // reverse the list of Map.Entry
            .associate { it.toPair() } // rebuild a map
    }

    fun getNewsPosts(): Map<String, NewsPost> {
        return newsConfig.news
            .entries
            .reversed()
            .associate { (key, value) -> key to NewsPost.fromNewsArticle(key, value) }
    }


    // Adding news articles programmatically

    fun addNewsArticle(id: String, newsArticle: NewsArticle) {
        newsConfig.news[id] = newsArticle
        newsConfig.save()
        println("Added news article $id")
    }

    fun removeNewsArticle(id: String) {
        newsConfig.news.remove(id)
        newsConfig.save()
    }
}