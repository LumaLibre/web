package net.lumamc.web.configuration

import eu.okaeri.configs.OkaeriConfig
import eu.okaeri.configs.serdes.standard.StandardSerdes
import eu.okaeri.configs.yaml.snakeyaml.YamlSnakeYamlConfigurer
import net.lumamc.web.Util
import eu.okaeri.configs.ConfigManager as OkaeriConfigManager


object ConfigManager {

    val config: Config
    val newsConfig: NewsConfig

    init {
        this.config = create(Config::class.java, "config.yml")
        this.newsConfig = create(NewsConfig::class.java, "news.yml")
    }

    fun <T : OkaeriConfig> create(clazz: Class<T>, fileName: String): T {
        return OkaeriConfigManager.create(clazz) { it: OkaeriConfig ->
            it.withConfigurer(YamlSnakeYamlConfigurer(), StandardSerdes())
            it.withRemoveOrphans(false)
            it.withBindFile(Util.getDataFolderPath().resolve(fileName))
            it.saveDefaults()
            it.load(true)
        }
    }
}