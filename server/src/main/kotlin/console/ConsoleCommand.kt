package net.lumamc.web.console

import org.slf4j.Logger

interface ConsoleCommand {
    fun name(): String

    fun execute(args: List<String>, logger: Logger)
}