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
        dependsOn(":webapp:npmBuild")
        dependsOn(":webserver:build")

        val sharedOutputDir = file("${projectDir}/output")
        sharedOutputDir.mkdirs()
        doLast {
            val webappOutputDir = file("webapp/dist")
            copy {
                from(webappOutputDir)
                into("$sharedOutputDir/webapp")
            }
            val webserverOutputDir = file("webserver/build/libs")
            copy {
                from(webserverOutputDir)
                into("$sharedOutputDir/webserver")
            }
        }

        finalizedBy(pterodactylDeploy)
    }

    pterodactylDeploy {
        url = System.getenv("PTERO_URL") ?: return@pterodactylDeploy
        apiKey = System.getenv("PTERO_TOKEN")
        serverId = System.getenv("PTERO_SERVER")

        clearRunway {
            removeRemoteDirectories = mutableListOf("webapp")
        }

        dropIn {
            uploadDirectories = mutableListOf(Path.of("output/webapp"))
            uploadFiles = mutableListOf(file("output/webserver/webserver.jar"))
            deployCommands = mutableListOf("reload")
        }
    }
}
