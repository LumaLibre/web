package net.lumamc.web.console.commands

import net.lumamc.web.Server
import net.lumamc.web.configuration.ConfigManager
import net.lumamc.web.console.ConsoleCommand
import org.slf4j.Logger

class ReloadCommand : ConsoleCommand {
    override fun name(): String {
        return "reload"
    }

    override fun execute(args: List<String>, logger: Logger) {
        ConfigManager.config.load()
        ConfigManager.newsConfig.load()

        val server = Server.INSTANCE
        server.stopServer()
        server.initServer()

        logger.info("Reloaded configuration & restarted server.")
    }
}