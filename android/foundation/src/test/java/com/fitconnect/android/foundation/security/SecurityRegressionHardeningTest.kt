package com.fitconnect.android.foundation.security

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Static security regression — scans android sources for forbidden patterns.
 * Does not claim production Firebase/FCM PASS.
 */
class SecurityRegressionHardeningTest {
    private fun androidRoot(): File {
        val cwd = File(".").canonicalFile
        val candidates = listOf(
            cwd,
            cwd.parentFile,
            File(cwd, "android"),
            File(cwd.parentFile, "android"),
        )
        return candidates.firstOrNull { root ->
            File(root, "app/build.gradle.kts").isFile &&
                File(root, "foundation").isDirectory
        } ?: error("Could not locate android/ root from $cwd")
    }

    private fun walkKotlinMain(root: File = androidRoot()): Sequence<File> =
        root.walkTopDown()
            .filter { it.isFile && it.extension == "kt" }
            .filter { path ->
                val p = path.path.replace('\\', '/')
                "/src/main/" in p && "/src/test/" !in p && "/androidTest/" !in p
            }

    @Test
    fun noHardcodedStripeLiveSecretInAndroidSources() {
        val hits = mutableListOf<String>()
        walkKotlinMain().forEach { f ->
            f.readLines().forEachIndexed { i, line ->
                if (line.contains("sk_live_") || line.contains("rk_live_")) {
                    hits += "${f.path}:${i + 1}"
                }
            }
        }
        // Also scan XML / properties under main
        androidRoot().walkTopDown()
            .filter { it.isFile && it.extension in listOf("xml", "properties") }
            .filter { "/src/main/" in it.path.replace('\\', '/') }
            .forEach { f ->
                f.readLines().forEachIndexed { i, line ->
                    if (line.contains("sk_live_") || line.contains("rk_live_")) {
                        hits += "${f.path}:${i + 1}"
                    }
                }
            }
        assertTrue("Stripe live secrets in source: $hits", hits.isEmpty())
    }

    @Test
    fun noHardcodedPrivateKeyOrClientSecretLiterals() {
        val forbidden = listOf(
            Regex("""client_secret\s*=\s*["'][^"']{8,}["']""", RegexOption.IGNORE_CASE),
            Regex("""-----BEGIN (RSA |EC )?PRIVATE KEY-----"""),
            Regex("""AIza[0-9A-Za-z_-]{20,}"""), // Google API key shape in source
        )
        val hits = mutableListOf<String>()
        walkKotlinMain().forEach { f ->
            // Allow policy redaction lists that mention the token names as strings.
            if (f.name == "HealthDataPolicy.kt") return@forEach
            f.readLines().forEachIndexed { i, line ->
                if (forbidden.any { it.containsMatchIn(line) }) {
                    hits += "${f.path}:${i + 1}:$line"
                }
            }
        }
        assertTrue("Hardcoded secret-like literals: $hits", hits.isEmpty())
    }

    @Test
    fun noPasswordOrTokenLogPatternsInFoundation() {
        val root = File("src/main/java")
        if (!root.exists()) return
        val forbidden = listOf(
            Regex("""Log\.[dviwe]\([^)]*token""", RegexOption.IGNORE_CASE),
            Regex("""logger\.[diwe]\([^)]*password""", RegexOption.IGNORE_CASE),
        )
        val hits = mutableListOf<String>()
        root.walkTopDown().filter { it.extension == "kt" }.forEach { f ->
            f.readLines().forEachIndexed { i, line ->
                if (forbidden.any { it.containsMatchIn(line) } &&
                    !line.contains("redact", ignoreCase = true)
                ) {
                    hits += "${f.name}:${i + 1}:$line"
                }
            }
        }
        assertTrue("Suspicious token/password logs: $hits", hits.size < 3)
    }

    @Test
    fun releaseBuildType_neverEnablesAllowLocalAuth() {
        val appGradle = File(androidRoot(), "app/build.gradle.kts")
        assertTrue(appGradle.isFile)
        val text = appGradle.readText()
        val releaseBlock = Regex(
            """release\s*\{([\s\S]*?)\n\s*\}""",
        ).findAll(text)
            .map { it.groupValues[1] }
            .firstOrNull { it.contains("ALLOW_LOCAL_AUTH") }
            ?: error("release buildType with ALLOW_LOCAL_AUTH not found")
        assertFalse(
            "release must set ALLOW_LOCAL_AUTH=false",
            releaseBlock.contains("""ALLOW_LOCAL_AUTH", "true""""),
        )
        assertTrue(
            "release must set ALLOW_LOCAL_AUTH=false",
            releaseBlock.contains("""ALLOW_LOCAL_AUTH", "false""""),
        )
    }

    @Test
    fun allowLocalAuth_neverTrueWithoutDebugGate_inAppMain() {
        val hits = mutableListOf<String>()
        walkKotlinMain().forEach { f ->
            f.readLines().forEachIndexed { i, line ->
                val trimmed = line.trim()
                // Bare true assignment is forbidden; DEBUG && ALLOW_LOCAL_AUTH is OK.
                if (Regex("""allowLocalAuth\s*=\s*true\b""").containsMatchIn(trimmed) &&
                    !trimmed.contains("BuildConfig") &&
                    !trimmed.contains("config.allowLocalAuth") &&
                    !trimmed.contains("isDebuggable")
                ) {
                    hits += "${f.path}:${i + 1}:$line"
                }
            }
        }
        assertTrue("allowLocalAuth=true without build gate: $hits", hits.isEmpty())
    }

    @Test
    fun noEmailAsCanonicalUserIdInAuthPaths() {
        val emailAsId = listOf(
            Regex("""AuthUser\s*\(\s*id\s*=\s*email\b"""),
            Regex("""AuthUser\s*\(\s*id\s*=\s*credentials\.email"""),
            Regex("""userId\s*=\s*email\b"""),
            Regex("""userId\s*=\s*credentials\.email"""),
            Regex("""id\s*=\s*email\.trim"""),
            Regex("""id\s*=\s*email!!"""),
        )
        val hits = mutableListOf<String>()
        walkKotlinMain().forEach { f ->
            // Demo persona catalogs may store emails as labels — ban only identity assignment shapes.
            if (f.path.replace('\\', '/').contains("/ascend/demo/")) return@forEach
            f.readLines().forEachIndexed { i, line ->
                if (emailAsId.any { it.containsMatchIn(line) }) {
                    hits += "${f.path}:${i + 1}:$line"
                }
            }
        }
        assertTrue("email-as-id in auth/session paths: $hits", hits.isEmpty())
    }

    @Test
    fun localAuthPersistUser_usesUuidNotEmail() {
        val file = File(
            androidRoot(),
            "foundation/src/main/java/com/fitconnect/android/foundation/auth/LocalAuthRepository.kt",
        )
        assertTrue(file.isFile)
        val text = file.readText()
        assertTrue(
            "persistUser must mint UUID ids",
            text.contains("val id = UUID.randomUUID().toString()"),
        )
        assertFalse(
            "persistUser must not assign email as id",
            Regex("""val id\s*=\s*email""").containsMatchIn(text),
        )
        assertTrue(
            "allowLocalAuth must default fail-closed (false)",
            Regex("""allowLocalAuth:\s*Boolean\s*=\s*false""").containsMatchIn(text),
        )
    }

    @Test
    fun noAcknowledgingOfflineExecutor_localAckBan() {
        val hits = mutableListOf<String>()
        walkKotlinMain().forEach { f ->
            f.readLines().forEachIndexed { i, line ->
                if (line.contains("AcknowledgingOfflineExecutor")) {
                    hits += "${f.path}:${i + 1}"
                }
            }
        }
        assertTrue("AcknowledgingOfflineExecutor is localAck — forbidden: $hits", hits.isEmpty())
    }

    @Test
    fun productionConfigGate_flagsLocalAuth() {
        val findings = com.fitconnect.android.foundation.config.ProductionConfigGate.validate(
            com.fitconnect.android.foundation.config.AppConfig(
                environment = com.fitconnect.android.foundation.config.AppEnvironment.PRODUCTION,
                apiBaseUrl = "https://fitconnect-phi.vercel.app",
                supabaseUrl = "https://xyz.supabase.co",
                supabaseAnonKey = "anon",
                isDebuggable = false,
                allowLocalAuth = true,
                fcmConfigured = true,
                firebaseAuthConfigured = true,
            ),
            enforce = true,
        )
        assertTrue(findings.any { it.code == "LOCAL_AUTH" })
    }

    @Test
    fun firebaseUidIsCanonicalIdentity_sessionAthleteIdPresent() {
        val athleteId = File(
            androidRoot(),
            "athlete/src/main/java/com/fitconnect/android/athlete/data/SessionAthleteId.kt",
        )
        assertTrue("SessionAthleteId.kt missing", athleteId.isFile)
        val text = athleteId.readText()
        assertTrue(text.contains("canonicalAthleteId"))
        assertTrue(text.contains("snap.userId"))
        assertFalse(text.contains("email"))
    }
}
