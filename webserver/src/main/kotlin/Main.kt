package net.lumamc.web

import net.lumamc.web.console.ConsoleCommandManager

fun main() {
    Server.INSTANCE.initServer()
    ConsoleCommandManager.INSTANCE.start()
}