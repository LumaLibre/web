import java.nio.file.Path

plugins {
    java
    kotlin("jvm") version "2.0.21"
    id("com.gradleup.shadow") version "8.3.5"
    id("dev.jsinco.pterodactyldeploy") version "1.14-SNAPSHOT"
}


allprojects {

    group = "net.lumamc.web"
    version = "1.0-SNAPSHOT"

    apply(plugin = "dev.jsinco.pterodactyldeploy")
}

repositories {
    mavenCentral()
}

tasks {

    clean {
        doLast {
            file("output").deleteRecursively()
        }
    }

    jar {
        enabled = false
    }

    build {
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

    pterodactylDeploy {
        url = System.getenv("PTERO_URL") ?: return@pterodactylDeploy
        apiKey = System.getenv("PTERO_TOKEN")
        serverId = System.getenv("PTERO_SERVER")

        clearRunway {
            removeRemoteDirectories = mutableListOf("client")
        }

        dropIn {
            uploadDirectories = mutableListOf(Path.of("output/client"))
            uploadFiles = mutableListOf(file("output/server/server.jar"))
            deployCommands = mutableListOf("reload")
        }
    }
}
