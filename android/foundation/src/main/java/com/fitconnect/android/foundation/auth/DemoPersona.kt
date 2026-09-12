package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole

/**
 * Deterministic LOCAL_DEMO seed identities for local auth emails.
 *
 * Never shown as "login as Athlete / Coach" UI. Capabilities are entitlements
 * resolved after email/password authentication (same path as any user).
 * Password for all: password1
 */
enum class DemoPersona(
    val displayName: String,
    val email: String,
    val role: UserRole,
    val tagline: String,
    /** LOCAL_DEMO capabilities — EDUARDO proves dual Athlete+Coach without second login. */
    val capabilities: Set<UserRole> = setOf(role),
) {
    INES(
        displayName = "Inês",
        email = "ines@fitconnect.demo",
        role = UserRole.ATHLETE,
        tagline = "Athlete · running focus",
    ),
    MARINA(
        displayName = "Marina",
        email = "marina@fitconnect.demo",
        role = UserRole.ATHLETE,
        tagline = "Multi-sport · run · cycle · swim",
    ),
    TOMAS(
        displayName = "Tomás",
        email = "tomas@fitconnect.demo",
        role = UserRole.COACH,
        tagline = "Coach · endurance",
    ),
    EDUARDO(
        displayName = "Eduardo",
        email = "eduardo@fitconnect.demo",
        role = UserRole.ATHLETE,
        tagline = "Athlete + Coach · unified identity",
        capabilities = setOf(UserRole.ATHLETE, UserRole.COACH),
    ),
    ADMIN(
        displayName = "Admin",
        email = "admin@fitconnect.demo",
        role = UserRole.ATHLETE, // never elevate ADMIN from client demo
        tagline = "LOCAL_DEMO operator (athlete shell)",
    );

    companion object {
        const val DEMO_PASSWORD = "password1"
        const val MODE_LABEL = "LOCAL_DEMO"

        fun fromEmail(email: String): DemoPersona? =
            entries.firstOrNull { it.email.equals(email.trim(), ignoreCase = true) }

        /** Legacy aliases still accepted in LOCAL_DEMO. */
        fun resolveRole(email: String, allowCoachElevation: Boolean): UserRole {
            fromEmail(email)?.let { return it.role }
            if (allowCoachElevation && (
                    email.contains("coach", ignoreCase = true) ||
                        email.contains("tomas", ignoreCase = true)
                    )
            ) {
                return UserRole.COACH
            }
            return UserRole.ATHLETE
        }
    }
}
