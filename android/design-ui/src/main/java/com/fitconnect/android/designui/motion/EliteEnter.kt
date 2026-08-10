package com.fitconnect.android.designui.motion

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.fitconnect.android.design.EliteSurfaceMotion
import com.fitconnect.android.designui.theme.reduceMotionEnabled

/**
 * Screen / section entrance — fade + slight rise. Honors reduce-motion.
 */
@Composable
fun EliteEnter(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    val reduce = reduceMotionEnabled()
    var visible by remember { mutableStateOf(reduce) }
    LaunchedEffect(Unit) { visible = true }
    if (reduce) {
        Box(modifier = modifier, content = { content() })
        return
    }
    val fadeMs = EliteSurfaceMotion.UI_MS
    val slideMs = EliteSurfaceMotion.SCREEN_MS
    AnimatedVisibility(
        visible = visible,
        modifier = modifier,
        enter = fadeIn(animationSpec = tween(fadeMs)) +
            slideInVertically(
                animationSpec = tween(slideMs),
                initialOffsetY = { it / 24 },
            ),
        exit = fadeOut(animationSpec = tween(fadeMs)),
        content = { content() },
    )
}
