package net.lumamc.web.console.commands

import net.lumamc.web.console.ConsoleCommand
import org.slf4j.Logger
import kotlin.system.exitProcess

class RestartCommand : ConsoleCommand {
    override fun name(): String {
        return "restart"
    }

    override fun execute(args: List<String>, logger: Logger) {
        logger.info("Restarting server...")
        exitProcess(1)
    }
}