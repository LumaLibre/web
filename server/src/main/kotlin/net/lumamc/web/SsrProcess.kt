package net.lumamc.web

import org.slf4j.LoggerFactory
import java.nio.file.Files
import java.nio.file.Path
import java.lang.ProcessBuilder.Redirect
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread
import kotlin.system.exitProcess

class SsrProcess private constructor(private val launcher: Path) {

    companion object {
        private const val DEFAULT_BACKEND_PORT = 7071
        private val logger = LoggerFactory.getLogger(SsrProcess::class.java)

        fun findPackagedLauncher(): SsrProcess? {
            val serverDirectory = Util.getDataFolderPath()
            val launcher = listOf(
                serverDirectory.resolve("client/start.mjs"),
                serverDirectory.resolve("../client/start.mjs").normalize()
            ).firstOrNull(Files::isRegularFile)

            return launcher?.let(::SsrProcess)
        }
    }

    private var process: Process? = null
    @Volatile
    private var stopping = false

    val backendPort: Int = System.getenv("LUMA_BACKEND_PORT")?.toIntOrNull()
        ?: DEFAULT_BACKEND_PORT

    fun start(publicPort: Int) {
        require(publicPort != backendPort) {
            "The public SSR port and private Javalin port must be different (both were $publicPort)."
        }

        val processBuilder = ProcessBuilder(
            System.getenv("NODE_BIN") ?: "node",
            launcher.fileName.toString()
        )
            .directory(launcher.parent.toFile())
            .redirectOutput(Redirect.INHERIT)
            .redirectError(Redirect.INHERIT)
            .apply {
                environment()["PORT"] = publicPort.toString()
                environment()["HOST"] = System.getenv("HOST") ?: "0.0.0.0"
                environment()["LUMA_BACKEND_ORIGIN"] = "http://127.0.0.1:$backendPort"
            }

        process = try {
            processBuilder.start()
        } catch (exception: Exception) {
            throw IllegalStateException(
                "Could not start the React SSR process. Node.js 20+ must be installed and available as 'node' " + "(or set NODE_BIN).",
                exception
            )
        }

        logger.info("Started React SSR on port {} with Javalin on 127.0.0.1:{}.", publicPort, backendPort)

        thread(name = "ssr-process-monitor", isDaemon = false) {
            val exitCode = process?.waitFor() ?: return@thread
            if (!stopping) {
                logger.error("React SSR exited unexpectedly with code {}. Stopping the JVM for restart.", exitCode)
                exitProcess(if (exitCode == 0) 1 else exitCode)
            }
        }
    }

    fun stop() {
        stopping = true
        process?.let { child ->
            if (!child.isAlive) {
                return
            }
            child.destroy()
            if (!child.waitFor(5, TimeUnit.SECONDS)) {
                child.destroyForcibly()
            }
        }
    }
}
