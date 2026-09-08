package com.fitconnect.android.designui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import com.fitconnect.android.designui.motion.EliteMotionTokens
import com.fitconnect.android.designui.motion.MotionToken
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import kotlinx.coroutines.delay

/**
 * Full-bleed multi-sport media plane — premium-for-all-sports, not gym-only.
 * Cycles drawable names that resolve via [EliteLocalImageExists].
 */
@Composable
fun EosMultiSportHero(
    imageNames: List<String>,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    dwellMs: Long = 4200L,
    contentScale: ContentScale = ContentScale.Crop,
) {
    val reduceMotion = reduceMotionEnabled()
    val available = imageNames.filter { EliteLocalImageExists(it) }.ifEmpty {
        imageNames.take(1)
    }
    var index by remember(available) { mutableIntStateOf(0) }

    LaunchedEffect(available, reduceMotion, dwellMs) {
        if (reduceMotion || available.size <= 1) return@LaunchedEffect
        while (true) {
            delay(dwellMs)
            index = (index + 1) % available.size
        }
    }

    val fadeMs = EliteMotionTokens.durationMs(MotionToken.SLOW, reduceMotion)
    Box(modifier = modifier) {
        val name = available.getOrNull(index) ?: available.firstOrNull().orEmpty()
        AnimatedContent(
            targetState = name,
            transitionSpec = {
                fadeIn(animationSpec = tween(fadeMs)) togetherWith
                    fadeOut(animationSpec = tween(fadeMs))
            },
            label = "multi_sport_hero",
            modifier = Modifier.fillMaxSize(),
        ) { current ->
            if (current.isNotBlank() && EliteLocalImageExists(current)) {
                EliteLocalImage(
                    name = current,
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale,
                )
            }
        }
    }
}
