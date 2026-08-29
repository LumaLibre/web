package net.lumamc.web

import net.dv8tion.jda.api.JDABuilder
import net.dv8tion.jda.api.requests.GatewayIntent
import net.dv8tion.jda.api.utils.ChunkingFilter
import net.dv8tion.jda.api.utils.MemberCachePolicy
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.console.ConsoleCommandManager
import net.lumamc.web.discord.MessageListener


fun main() {
    val ssrProcess = SsrProcess.findPackagedLauncher()
    val configuredPort = ConfigManager.config.port
    val publicPort = System.getenv("PORT")?.toIntOrNull()
        ?: System.getenv("SERVER_PORT")?.toIntOrNull()
        ?: configuredPort

    if (ssrProcess != null) {
        Server.INSTANCE.initServer("127.0.0.1", ssrProcess.backendPort)
        try {
            ssrProcess.start(publicPort)
        } catch (exception: Exception) {
            Server.INSTANCE.stopServer()
            throw exception
        }
    } else {
        Server.INSTANCE.initServer()
    }

    Runtime.getRuntime().addShutdownHook(Thread {
        ssrProcess?.stop()
        Server.INSTANCE.stopServer()
    })

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
