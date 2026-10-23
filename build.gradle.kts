import java.nio.file.Path
import java.util.zip.ZipFile
import java.util.concurrent.TimeUnit
import com.mattmalec.pterodactyl4j.UtilizationState
import com.mattmalec.pterodactyl4j.PteroBuilder

plugins {
    java
    kotlin("jvm") version "2.0.21"
    id("com.gradleup.shadow") version "8.3.5"
    id("dev.jsinco.pterodactyldeploy") version "1.14-SNAPSHOT"
}


allprojects {

    group = "net.lumamc.web"
    version = "1.0-SNAPSHOT"

}

repositories {
    mavenCentral()
}

tasks {

    val validateDeploymentConfig by registering {
        doLast {
            val missing = listOf("PTERO_TOKEN", "PTERO_URL", "PTERO_SERVER")
                .filter { System.getenv(it).isNullOrBlank() }
            if (missing.isNotEmpty()) {
                throw GradleException("Cannot deploy: configure ${missing.joinToString()} in the publishing environment.")
            }
        }
    }

    clean {
        doLast {
            file("output").deleteRecursively()
        }
    }

    jar {
        enabled = false
    }

    build {
        mustRunAfter(validateDeploymentConfig)
        dependsOn(":client:yarnBuild")
        dependsOn(":server:build")

        val sharedOutputDir = file("${projectDir}/output")
        sharedOutputDir.mkdirs()
        doLast {
            val clientOutputDir = file("client/dist")
            copy {
                from(clientOutputDir)
                into("$sharedOutputDir/client")
            }
            val serverOutputDir = file("server/build/libs")
            copy {
                from(serverOutputDir)
                into("$sharedOutputDir/server")
            }
        }

    }

    val verifyDeploymentArtifacts by registering {
        dependsOn(build)
        doLast {
            val artifact = file("output/server/server.jar")
            if (!file("output/client/index.html").isFile) {
                throw GradleException("Missing index.html")
            }
            ZipFile(artifact).use { jar ->
                val classes = fileTree("server/build/classes/kotlin/main") {
                    include("**/*.class")
                }.files.map { it.relativeTo(file("server/build/classes/kotlin/main")).invariantSeparatorsPath }
                val required = classes + listOf(
                    "net/lumamc/web/MainKt.class",
                    "net/lumamc/web/store/TebexSignature.class"
                )
                val missing = required.filter { jar.getEntry(it) == null }
                if (missing.isNotEmpty()) {
                    throw GradleException("Server JAR is missing compiled classes: ${missing.joinToString()}")
                }
                logger.lifecycle("Verified deployment JAR ({} compiled classes).", classes.size)
            }
        }
    }

    pterodactylDeploy {
        dependsOn(validateDeploymentConfig, verifyDeploymentArtifacts)
        apiKey = System.getenv("PTERO_TOKEN")
        url = System.getenv("PTERO_URL")
        serverId = System.getenv("PTERO_SERVER")

        doFirst {
            val client = PteroBuilder.createClient(url!!, apiKey!!)
            val server = client.retrieveServerByIdentifier(serverId!!).execute()
            if (server.retrieveUtilization().execute().state != UtilizationState.OFFLINE) {
                logger.lifecycle("Stopping server before replacing deployment files...")
                server.stop().execute()
            }
            val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(120)
            while (server.retrieveUtilization().execute().state != UtilizationState.OFFLINE) {
                if (System.nanoTime() >= deadline) {
                    throw GradleException("Server did not stop within 120 seconds.")
                }
                Thread.sleep(1000)
            }
            logger.lifecycle("Uploading deployment.")
        }

        clearRunway {
            removeRemoteDirectories = mutableListOf("client")
        }

        dropIn {
            uploadDirectories = mutableListOf(Path.of("output/client"))
            uploadFiles = mutableListOf(file("output/server/server.jar"))
        }

        doLast {
            logger.lifecycle("Done.")
            pteroClient!!.retrieveServerByIdentifier(serverId!!).execute().start().execute()
        }
    }
}
