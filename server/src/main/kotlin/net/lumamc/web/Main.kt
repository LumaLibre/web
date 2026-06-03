package net.lumamc.web

import net.dv8tion.jda.api.JDABuilder
import net.dv8tion.jda.api.requests.GatewayIntent
import net.dv8tion.jda.api.utils.ChunkingFilter
import net.dv8tion.jda.api.utils.MemberCachePolicy
import net.lumamc.web.console.ConsoleCommandManager
import net.lumamc.web.discord.MessageListener


fun main() {
    Server.INSTANCE.initServer()
    ConsoleCommandManager.INSTANCE.start()


    val token = System.getProperty("bot.token") ?: System.getenv("BOT_TOKEN") ?: return run {
        println("No bot token provided. Can't start JDA.")
    }
    val jda = JDABuilder.createDefault(token)
        .enableIntents(
            GatewayIntent.GUILD_MESSAGES,
            GatewayIntent.MESSAGE_CONTENT,
            GatewayIntent.GUILD_MEMBERS,
            GatewayIntent.GUILD_WEBHOOKS,
            GatewayIntent.GUILD_MESSAGE_TYPING,
            GatewayIntent.DIRECT_MESSAGE_TYPING
        )
        .setChunkingFilter(ChunkingFilter.ALL)
        .setMemberCachePolicy(MemberCachePolicy.ALL)
        .setAutoReconnect(true)
        .build();

    try {
        jda.awaitReady()
        jda.addEventListener(MessageListener())
        println("JDA started successfully.")
    } catch (e: InterruptedException) {
        println("JDA startup interrupted.")
    }
}