import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    version = "22.13.1"
    npmVersion = "10.9.2"
    download = true
}

tasks {

    //    "dev": "vite",
    //    "build": "tsc -b && vite build",
    //    "lint": "eslint .",
    //    "preview": "vite preview"

    register<NpmTask>("npmBuild") {
        args.set(arrayListOf("run", "build"))
    }

    register<NpmTask>("npmDev") {
        args.set(arrayListOf("run", "dev"))
    }

    register<NpmTask>("npmLint") {
        args.set(arrayListOf("run", "lint"))
    }

    register<NpmTask>("npmPreview") {
        args.set(arrayListOf("run", "preview"))
    }
}