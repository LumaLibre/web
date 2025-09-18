package net.lumamc.web.discord

import net.dv8tion.jda.api.entities.MessageEmbed
import net.lumamc.web.Util
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.configuration.sector.NewsArticle
import java.time.LocalDate
import java.time.ZoneOffset
import kotlin.io.path.absolute
import kotlin.io.path.absolutePathString

class DiscordLinkNewsArticle(
    vararg val embeds: MessageEmbed
) {

    companion object {
        const val ALLOWED_ID_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+"
        private val authorRegex = fun (author: String): Regex {
            return Regex("(?i)(^|[^A-Za-z0-9])${author}([^A-Za-z0-9]|\$)")
        }
    }

    constructor(embed: MessageEmbed) : this(embeds = arrayOf(embed))
    constructor(embeds: Collection<MessageEmbed>) : this(embeds = embeds.toTypedArray())


    init {
        require(embeds.isNotEmpty()) { "At least one embed must be provided." }
    }


    fun getId(): String {
        val rawTitle = embed().title?.lowercase() ?: generateRandChars()

        // Regex: capture title part and date part (m/d or mm/dd)
        val regex = Regex("""^(.*?)-\s*(\d{1,2})/(\d{1,2})""")

        val match = regex.find(rawTitle)
        val (titlePart, month, day) = if (match != null) {
            Triple(match.groupValues[1].trim(), match.groupValues[2], match.groupValues[3])
        } else {
            Triple(rawTitle, "1", "1") // fallback if no date found
        }

        val year = (embed().timestamp?.year ?: LocalDate.now().year) % 100
        val formattedDate = "$month.$day.$year"

        // Replace spaces with hyphens in the title part
        val title = titlePart.replace(" ", "-")

        val baseId = "$title-$formattedDate"

        // verify id characters
        return if (baseId.all { it in ALLOWED_ID_CHARACTERS || it == '.' }) {
            baseId
        } else {
            val safeTitle = title.filter { it in ALLOWED_ID_CHARACTERS }.ifEmpty { generateRandChars() }
            "$safeTitle-$formattedDate"
        }
    }



    fun getTimeStamp(): Long {
        return embed().timestamp?.toLocalDateTime()?.toInstant(ZoneOffset.UTC)?.toEpochMilli() ?: System.currentTimeMillis()
    }


    fun author(): String {
        return embed().author?.name ?: embed().description?.let { scanForConfigAuthors(it) } ?: "Unknown"
    }

    fun message(): String {
        val stringBuilder = StringBuilder()
        embeds.forEachIndexed { index, embed ->
            if (index > 0) stringBuilder.append("\n\n")
            embed.description?.let { stringBuilder.append(it) }
        }
        return stringBuilder.toString().ifEmpty { "No content provided." }
    }

    fun toNewsArticle(): NewsArticle {
        val newsArticle = NewsArticle()
        newsArticle.title = embed().title ?: "Untitled News Post"
        newsArticle.thumbnail = embed().image?.url ?: ""
        newsArticle.author = author()
        newsArticle.timestamp = getTimeStamp()
        newsArticle.contentPath = saveContent()
        return newsArticle
    }


    private fun saveContent(): String {
        val dataFolder = Util.getDataFolderPath().resolve("news")
        val asFile = dataFolder.toFile()
        val id = getId()
        if (!asFile.exists()) {
            asFile.mkdirs()
        }
        println(dataFolder.absolutePathString())
        val contentFile = dataFolder.resolve("$id.md").toFile()
        println(contentFile.absolutePath)
        if (!contentFile.exists()) {
            contentFile.createNewFile()
        }
        contentFile.writeText(message())
        println("Saved $id content to ${contentFile.absolutePath}")
        return contentFile.absolutePath
    }

    private fun scanForConfigAuthors(msg: String): String? {
        val authorMap = ConfigManager.config.authors

        for ((key, value) in authorMap) {
           buildList { add(key); add(value) }.forEach {
               val regex = authorRegex(it)
               if (regex.containsMatchIn(msg))
                   return key
           }
        }
        return null
    }

    private fun generateRandChars(): String {
        return (1..6)
            .map { ALLOWED_ID_CHARACTERS.random() }
            .joinToString("")
    }

    private fun embed(): MessageEmbed {
        // get first embed with a title
        return embeds.first { it.title != null }
    }

}