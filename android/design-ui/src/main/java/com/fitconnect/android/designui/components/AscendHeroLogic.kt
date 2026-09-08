package com.fitconnect.android.designui.components

import kotlin.math.roundToInt

/** Cinematic Ascend math — keep UI composition free of magic ratios. */
object AscendHeroLogic {
    const val CHUNK_SLOTS: Int = 11
    const val STREAK_CYCLE_DAYS: Int = 21
    const val TELEMETRY_CAP: Int = 12

    fun chunkFill(value: Int, cap: Int, slots: Int = CHUNK_SLOTS): Int {
        if (value <= 0 || cap <= 0 || slots <= 0) return 0
        return ((value.toFloat() / cap.toFloat()) * slots)
            .roundToInt()
            .coerceIn(0, slots)
    }

    fun spacedWordmark(word: String): String =
        word.trim().toCharArray().filter { !it.isWhitespace() }.joinToString(" ")
}
