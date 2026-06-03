package net.lumamc.web.model

import net.lumamc.web.Util
import java.util.concurrent.ConcurrentHashMap

object ModelManager {

    private val models = ConcurrentHashMap<String, BlockbenchModel>()
    // FIXME: lazy loaded
    private val dataFolder = Util.getDataFolderPath().resolve("models")

    init {
        if (!dataFolder.toFile().exists()) {
            dataFolder.toFile().mkdirs()
        }
    }

    fun getModel(pose: String): BlockbenchModel? {
        val key = pose.lowercase().filter { it.isLetterOrDigit() || it == '_' }
        val cached = models[key]
        if (cached != null) {
            return cached
        }

        val file = dataFolder.resolve("$key.bbmodel").toFile()
        if (!file.exists()) {
            return null
        }

        val model = BlockbenchModel.load(file.toPath())
        models[key] = model
        return model
    }
}