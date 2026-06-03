package net.lumamc.web.console.commands

import net.lumamc.web.console.ConsoleCommand
import org.slf4j.Logger
import kotlin.system.exitProcess

class StopCommand : ConsoleCommand {
    override fun name(): String {
        return "stop"
    }

    override fun execute(args: List<String>, logger: Logger) {
        logger.info("Stopping server...")
        exitProcess(0)
    }
}