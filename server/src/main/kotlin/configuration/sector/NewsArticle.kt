package net.lumamc.web.configuration.sector

import eu.okaeri.configs.OkaeriConfig
import net.lumamc.web.Util

class NewsArticle : OkaeriConfig() {
    var title: String = "Article Title"
    var thumbnail: String = "https://raw.githubusercontent.com/LumaLibre/artwork/refs/heads/master/backgrounds/playground-d3.png"
    var author: String = "Fielle"
    var timestamp: Long? = System.currentTimeMillis()
        get() {
            // If the key is left empty, set the value to the current time and save it
            if (field == null) {
                field = System.currentTimeMillis()
                this.save()
            }
            return field
        }
    var contentPath: String = "~/news/article.md"
        get() {
            val value = Util.getDataFolderPath().toString()
            return field.replaceFirst("~", value)
        }
}