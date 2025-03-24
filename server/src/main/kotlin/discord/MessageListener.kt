package net.lumamc.web.discord

import net.dv8tion.jda.api.events.message.MessageReceivedEvent
import net.dv8tion.jda.api.hooks.ListenerAdapter
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.news.NewsPost

class MessageListener : ListenerAdapter() {

    override fun onMessageReceived(event: MessageReceivedEvent) {
        // super messy TODO: cleanup
        val config = ConfigManager.config
        val id = config.discordNewsChannelId.takeIf { it > 0 } ?: return
        if (event.channel.idLong != id) return

        val jda = event.jda

        var title: String = "No title"
        var author: String = config.defaultAuthor
        var thumbnailUrl: String? = null
        val fullMessage = StringBuilder()

        if (config.embedsOnly) {
            val embeds = event.message.embeds
            if (embeds.isEmpty()) return

            val parent = embeds[0]
            title = parent.title ?: title
            author = parent.author?.name ?: author
            thumbnailUrl = parent.thumbnail?.url

            embeds.forEachIndexed { index, embed ->
                fullMessage.append(embed.description)
                if (index < embeds.size - 1) {
                    fullMessage.append("\n\n")
                }
            }
        } else {
            fullMessage.append(event.message.contentRaw)
        }

        val newsPost = NewsPost(
            id = generateId(title),
            title = title,
            thumbnail = thumbnailUrl ?: "",
            author = author,
            timestamp = System.currentTimeMillis(),
            content = fullMessage.toString()
        )
    }


    fun generateId(title: String): String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        val randStr = (1..4)
            .map { allowedChars.random() }
            .joinToString("")
        return title.lowercase()
            .replace("/", "-")
            .replace(":", "-")
            .replace("?", "-")
            .replace("\\", "-")
            .replace(" ", "-") + "-" + randStr
    }
}