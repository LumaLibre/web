package net.lumamc.web.news

import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter
import net.lumamc.web.Util
import net.lumamc.web.configuration.sector.NewsArticle
import java.nio.file.Path

class NewsPost(
    val id: String,
    val title: String,
    val thumbnail: String,
    val author: String,
    val timestamp: Long,
    val content: String
) {

    companion object {

        fun fromNewsArticle(id: String, newsArticle: NewsArticle): NewsPost {
            val content = Path.of(newsArticle.contentPath).toFile()
            if (!content.exists()) {
                // create directory if it doesn't exist
                content.parentFile.mkdirs()
                content.createNewFile()
                content.writeText("# ${newsArticle.title}\n\nThis article is currently empty.")
            }

            return NewsPost(
                id,
                newsArticle.title,
                newsArticle.thumbnail,
                newsArticle.author,
                newsArticle.timestamp!!,
                content.readText()
            )
        }
    }

    fun toJson(): String {
        return Util.GSON.toJson(this)
    }


    override fun toString(): String {
        return this.toJson()
    }


    class NewsPostTypeAdapter : TypeAdapter<NewsPost>() {
        override fun write(out: JsonWriter, value: NewsPost) {
            out.beginObject()
            out.name("id").value(value.id)
            out.name("title").value(value.title)
            out.name("thumbnail").value(value.thumbnail)
            out.name("author").value(value.author)
            out.name("timestamp").value(value.timestamp)
            out.name("content").value(value.content)
            out.endObject()
        }

        override fun read(comingIn: JsonReader): NewsPost {
            var id = "NULL"
            var title = "NULL"
            var thumbnail = "NULL"
            var author = "NULL"
            var timestamp = 0L
            var content = "NULL"

            comingIn.beginObject()
            while (comingIn.hasNext()) {
                when (comingIn.nextName()) {
                    "id" -> id = comingIn.nextString()
                    "title" -> title = comingIn.nextString()
                    "thumbnail" -> thumbnail = comingIn.nextString()
                    "author" -> author = comingIn.nextString()
                    "timestamp" -> timestamp = comingIn.nextLong()
                    "content" -> content = comingIn.nextString()
                }
            }
            comingIn.endObject()

            return NewsPost(id, title, thumbnail, author, timestamp, content)
        }

    }
}