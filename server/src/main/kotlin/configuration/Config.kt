package net.lumamc.web.configuration

import eu.okaeri.configs.OkaeriConfig
import eu.okaeri.configs.annotation.Comment
import net.lumamc.web.Util
import java.nio.file.Path

class Config : OkaeriConfig() {

    @Comment("Host to start Javalin on")
    var host = "localhost"

    @Comment("Port to start Javalin on")
    var port = 7070

    @Comment("Path to the directory containing static files")
    var staticFilesDirectory: String = "~/static"
        get() {
            val asString = field.replaceFirst("~", Util.getDataFolderPath().toString())
            val asPath = Path.of(asString)
            if (!asPath.toFile().exists()) {
                asPath.toFile().mkdirs()
            }
            return asString
        }

    var discordNewsChannelId: Long = -1
    var embedsOnly: Boolean = true
    var defaultAuthor = "Jsinco"
}