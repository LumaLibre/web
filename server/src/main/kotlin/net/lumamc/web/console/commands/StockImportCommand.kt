package net.lumamc.web.console.commands

import net.lumamc.web.Server
import net.lumamc.web.console.ConsoleCommand
import org.slf4j.Logger

/** Local server console only; never exposed as a client-callable HTTP endpoint. */
class StockImportCommand : ConsoleCommand {
    override fun name() = "stock-import"
    override fun execute(args: List<String>, logger: Logger) {
        try { logger.info("Imported {} inventory records from stock-history.json", Server.INSTANCE.importStockHistory()) }
        catch (e: Exception) { logger.error("Stock history import failed ({}). Already imported transactions are safe to replay.", e.javaClass.simpleName) }
    }
}
