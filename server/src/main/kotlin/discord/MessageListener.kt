package net.lumamc.web.discord

import net.dv8tion.jda.api.events.message.MessageReceivedEvent
import net.dv8tion.jda.api.hooks.ListenerAdapter
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.news.NewsManager

class MessageListener : ListenerAdapter() {

    override fun onMessageReceived(event: MessageReceivedEvent) {
        val config = ConfigManager.config
        val id = config.discordNewsChannelId.takeIf { it > 0 } ?: return
        if (event.channel.idLong != id) return

        val embeds = event.message.embeds
        if (embeds.isEmpty()) return

        val discordLinkNewsArticle = DiscordLinkNewsArticle(embeds)
        NewsManager.addNewsArticle(
            discordLinkNewsArticle.getId(),
            discordLinkNewsArticle.toNewsArticle()
        )
    }
}