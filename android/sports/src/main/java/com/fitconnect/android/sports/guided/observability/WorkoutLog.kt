package com.fitconnect.android.sports.guided.observability

import com.fitconnect.android.foundation.common.Logger

object WorkoutLog {
    const val TAG = "WorkoutEngine"

    fun event(logger: Logger, type: String, sessionId: String) {
        logger.i(TAG, "$type session=$sessionId")
    }
}
