package com.fitconnect.android.designui.components

/** Feed social math — keep Compose free of ad-hoc reaction counting. */
object EliteFeedLogic {
    const val LIKE_ID: String = "LIKE"

    fun likeCount(reactions: List<EliteFeedReaction>): Int {
        val like = reactions.firstOrNull { it.id.equals(LIKE_ID, ignoreCase = true) }
        if (like != null) return like.count.coerceAtLeast(0)
        return reactions.sumOf { it.count.coerceAtLeast(0) }
    }

    fun liked(reactions: List<EliteFeedReaction>): Boolean =
        reactions.any { it.id.equals(LIKE_ID, ignoreCase = true) && it.selected }
}
