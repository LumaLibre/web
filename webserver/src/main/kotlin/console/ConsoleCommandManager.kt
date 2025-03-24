package net.lumamc.web.console

import net.lumamc.web.console.commands.ReloadCommand
import net.lumamc.web.console.commands.RestartCommand
import net.lumamc.web.console.commands.StopCommand
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.Scanner


class ConsoleCommandManager private constructor() {

    private val logger: Logger = LoggerFactory.getLogger(ConsoleCommandManager::class.java)

    private val commands = mutableMapOf<String, ConsoleCommand>()

    companion object {
        val INSTANCE: ConsoleCommandManager = ConsoleCommandManager()
    }

    init {
        registerCommand(HelpCommand())
        registerCommand(StopCommand())
        registerCommand(RestartCommand())
        registerCommand(ReloadCommand())
    }

    fun registerCommand(command: ConsoleCommand): ConsoleCommandManager {
        commands[command.name().lowercase()] = command
        return this
    }

    fun start() {
        val thread = Thread {
            val scanner = Scanner(System.`in`)
            while (true) {
                val input = try {
                    scanner.nextLine()
                } catch (e: NoSuchElementException) {
                    logger.info("Console input closed. Exiting...")
                    break
                }

                if (input.isEmpty()) {
                    continue
                }

                val args = input.split(" ")
                val command = commands[args[0].lowercase()]
                if (command != null) {
                    command.execute(args.drop(1), logger)
                } else {
                    logger.info("Command not found. Type 'help' for a list of commands.")
                }
            }
        }
        thread.name = "cmd-thread"
        thread.start()
    }

    class HelpCommand : ConsoleCommand {
        override fun name(): String = "help"

        override fun execute(args: List<String>, logger: Logger) {
            logger.info("Available commands:")
            INSTANCE.commands.keys.forEach { logger.info(it) }
        }
    }
}
