package com.fitconnect.shared.recognition

/**
 * Automatic workout detection architecture.
 *
 * Production confirmation is **not** claimed. Emulator / LOCAL_DEMO may inject
 * candidates. States stay POSSIBLE_* until a tested classifier exists.
 */
enum class ActivityRecognitionState {
    UNKNOWN,
    POSSIBLE_WALK,
    POSSIBLE_RUN,
    POSSIBLE_CYCLE,
    CONFIRMED,
}

enum class ActivityRecognitionVerdict {
    ARCHITECTURE_ONLY,
    TEST_FIXTURE,
    PRODUCTION_UNVERIFIED,
}

data class ActivityRecognitionSample(
    val timestampEpochMs: Long,
    val speedMps: Double?,
    val stepsPerMinute: Double?,
    val injectedHint: String? = null,
)

class ActivityRecognitionEngine {
    var state: ActivityRecognitionState = ActivityRecognitionState.UNKNOWN
        private set
    var verdict: ActivityRecognitionVerdict = ActivityRecognitionVerdict.ARCHITECTURE_ONLY
        private set
    var confirmed: Boolean = false
        private set

    fun reset() {
        state = ActivityRecognitionState.UNKNOWN
        verdict = ActivityRecognitionVerdict.ARCHITECTURE_ONLY
        confirmed = false
    }

    /**
     * Heuristic candidate only. Does not promote to CONFIRMED unless [forceConfirmForTest]
     * is used from a fixture. Never treat this as a production detector.
     */
    fun ingest(sample: ActivityRecognitionSample): ActivityRecognitionState {
        val hint = sample.injectedHint?.lowercase()
        state = when {
            hint == "walk" -> ActivityRecognitionState.POSSIBLE_WALK
            hint == "run" -> ActivityRecognitionState.POSSIBLE_RUN
            hint == "cycle" || hint == "cycling" -> ActivityRecognitionState.POSSIBLE_CYCLE
            (sample.speedMps ?: 0.0) in 1.2..2.2 -> ActivityRecognitionState.POSSIBLE_WALK
            (sample.speedMps ?: 0.0) in 2.2..4.8 -> ActivityRecognitionState.POSSIBLE_RUN
            (sample.speedMps ?: 0.0) >= 4.8 -> ActivityRecognitionState.POSSIBLE_CYCLE
            else -> ActivityRecognitionState.UNKNOWN
        }
        verdict = if (hint != null) {
            ActivityRecognitionVerdict.TEST_FIXTURE
        } else {
            ActivityRecognitionVerdict.PRODUCTION_UNVERIFIED
        }
        return state
    }

    fun forceConfirmForTest() {
        if (state == ActivityRecognitionState.UNKNOWN) return
        state = ActivityRecognitionState.CONFIRMED
        confirmed = true
        verdict = ActivityRecognitionVerdict.TEST_FIXTURE
    }
}
