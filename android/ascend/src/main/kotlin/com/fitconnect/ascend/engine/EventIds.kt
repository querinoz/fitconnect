package com.fitconnect.ascend.engine

object EventIds {
    fun workoutCompleted(userId: String, sessionId: String): String =
        "$userId:$sessionId:WORKOUT_COMPLETED"

    fun typed(userId: String, type: String, qualifier: String): String =
        "$userId:$type:$qualifier"
}
