package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole

/**
 * Deterministic LOCAL_DEMO personas. Never production credentials.
 * Password for all: password1
 */
enum class DemoPersona(
    val displayName: String,
    val email: String,
    val role: UserRole,
    val tagline: String,
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
