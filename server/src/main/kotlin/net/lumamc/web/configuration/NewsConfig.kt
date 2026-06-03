package net.lumamc.web.configuration

import eu.okaeri.configs.OkaeriConfig
import net.lumamc.web.configuration.sector.NewsArticle

class NewsConfig : OkaeriConfig() {
    var news: MutableMap<String, NewsArticle> = mutableMapOf("article-title" to NewsArticle())
}