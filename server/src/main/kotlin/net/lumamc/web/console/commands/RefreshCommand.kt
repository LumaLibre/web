package net.lumamc.web.console.commands

import net.lumamc.web.Server
import net.lumamc.web.console.ConsoleCommand
import org.slf4j.Logger
class RefreshCommand : ConsoleCommand {
    override fun name() = "refresh"

    override fun execute(args: List<String>, logger: Logger) {
        logger.info(Server.INSTANCE.refreshStoreInventory())
    }
}
