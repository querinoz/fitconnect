package com.fitconnect.android.sports.domain

/**
 * Stable sport identifier. New sports are added by registering definitions —
 * not by changing application core. Prefer [SportsRegistry] for discovery.
 */
@JvmInline
value class SportId(val value: String) {
    init {
        require(value.isNotBlank()) { "SportId cannot be blank" }
    }

    companion object {
        fun of(raw: String): SportId = SportId(raw.trim().lowercase().replace(' ', '_'))

        /** Convenience constants for well-known sports — definitions live in the catalog. */
        val STRENGTH = of("strength")
        val RUNNING = of("running")
        val CYCLING = of("cycling")
        val SWIMMING = of("swimming")
        val FOOTBALL = of("football")
        val BASKETBALL = of("basketball")
        val TENNIS = of("tennis")
        val PADEL = of("padel")
        val MARTIAL_ARTS = of("martial_arts")
        val CROSSFIT = of("crossfit")
        val HYROX = of("hyrox")
        val GENERAL_FITNESS = of("general_fitness")
        val TRIATHLON = of("triathlon")
        val GYM = of("gym")
        val OTHER = of("other")

        /** Zenith V8.5 athlete TRAIN core set — catalog remains extensible beyond this. */
        val TRAIN_CORE: List<SportId> = listOf(
            STRENGTH,
            RUNNING,
            CYCLING,
            SWIMMING,
            FOOTBALL,
            BASKETBALL,
            TENNIS,
            PADEL,
            MARTIAL_ARTS,
            CROSSFIT,
            HYROX,
            GENERAL_FITNESS,
        )
    }
}
