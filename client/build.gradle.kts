import com.github.gradle.node.yarn.task.YarnTask

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

    register<YarnTask>("yarnInstall") {
        args.set(arrayListOf("install", "--frozen-lockfile"))
    }

    register<YarnTask>("yarnBuild") {
        args.set(arrayListOf("run", "build"))
    }

    register<YarnTask>("yarnDev") {
        args.set(arrayListOf("run", "dev"))
    }

    register<YarnTask>("yarnLint") {
        args.set(arrayListOf("run", "lint"))
    }

}
