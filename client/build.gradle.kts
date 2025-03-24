import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    version = "22.13.1"
    yarnVersion = "1.22.22"
    download = true
}

tasks {

    //    "dev": "vite",
    //    "build": "tsc -b && vite build",
    //    "lint": "eslint .",
    //    "preview": "vite preview"

    register<NpmTask>("yarnBuild") {
        args.set(arrayListOf("run", "build"))
    }

    register<NpmTask>("yarnDev") {
        args.set(arrayListOf("run", "dev"))
    }

    register<NpmTask>("yarnLint") {
        args.set(arrayListOf("run", "lint"))
    }

    register<NpmTask>("yarnPreview") {
        args.set(arrayListOf("run", "preview"))
    }
}