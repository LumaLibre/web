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

    @Comment("Server-side Tebex package discovery using private baskets.")
    var storeInspectionEnabled = true
    @Comment("Tebex webhook signing secret")
    var storeWebhookSecret = ""
    var storeInspectionUsername = "MHF_Steve"
    var storePublicToken = "thl1-b56d66035505068200ecc30aad8c3e5f417c08e4" // non-sensitive
    @Comment("Seconds between private discovery runs, min 300")
    var storeInspectionIntervalSeconds: Long = 600
    @Comment("Optional package IDs to inspect, leave empty means all public packages.")
    var storeInspectionPackageIds: List<Long> = emptyList()
    @Comment("Required option values for inspection, keyed by package ID")
    var storeInspectionVariables: MutableMap<String, MutableMap<String, String>> = mutableMapOf()
    var storeRefundRestoresPackageIds: List<Long> = emptyList()
    var storeHistoryCompleteSince = ""
    var authors: Map<String, String> = mapOf(
        "Jsinco" to "J",
        "Kataray" to "Kat",
        "Fielle" to "Fi"
    )
}
