pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "fitconnect-android"

include(":app")
include(":wear")
include(":shared")
include(":ascend")
include(":core-capture")
include(":core:fitness")
include(":design")
include(":design-ui")
include(":foundation")
include(":sports")
include(":geo")
include(":telemetry")
include(":community")
include(":ai")
include(":athlete")
include(":coach")
