package com.fitconnect.android.designui.atmosphere

import android.content.Context
import android.os.PowerManager
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.MutableFloatState
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.ImageShader
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.testTag
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.fitconnect.android.design.EliteSurfaceAtmosphere
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteAtmosphere
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.LocalHoneycombIntensity
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.theme.HoneycombIntensity
import kotlin.math.ceil

val LocalHoneycombEmptyBoost = staticCompositionLocalOf<MutableState<Boolean>?> { null }
val LocalAtmosphereMotionScale = staticCompositionLocalOf<MutableFloatState?> { null }

@Composable
fun HoneycombAtmosphere(
    modifier: Modifier = Modifier,
    strokeColor: Color,
) {
    val intensity = LocalHoneycombIntensity.current
    if (intensity != HoneycombIntensity.SUBTLE) return

    val reduceMotion = reduceMotionEnabled()
    val context = LocalContext.current
    val powerSave = remember(context) { context.isPowerSaveMode() }
    val lifecycleOwner = LocalLifecycleOwner.current
    var resumed by remember { mutableStateOf(true) }
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, _ ->
            resumed = lifecycleOwner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }
    val emptyBoost = LocalHoneycombEmptyBoost.current?.value == true
    val sessionScale = LocalAtmosphereMotionScale.current?.floatValue ?: 1f
    val animate = !reduceMotion && !powerSave && resumed
    val alpha = if (emptyBoost) {
        EliteSurfaceAtmosphere.HONEYCOMB_EMPTY
    } else {
        EliteSurfaceAtmosphere.HONEYCOMB_SUBTLE
    }

    val density = LocalDensity.current
    val radiusPx = with(density) { EliteAtmosphere.HoneycombCellRadius.toPx() }
    val strokePx = with(density) { EliteBorder.Hairline.toPx() }
    val tile = remember(radiusPx, strokeColor, strokePx) {
        renderHexTile(radiusPx, strokeColor, strokePx)
    }
    val brush = remember(tile) {
        ShaderBrush(ImageShader(tile, TileMode.Repeated, TileMode.Repeated))
    }
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val (driftFactor, pulseAlpha) = honeycombMotion(animate)
    val driftAmp = radiusPx * EliteSurfaceAtmosphere.HONEYCOMB_PARALLAX * sessionScale

    CanvasLike(
        modifier = modifier
            .fillMaxSize()
            .testTag("honeycomb_atmosphere")
            .drawBehind {
                val dy = if (animate) driftFactor * driftAmp else 0f
                translate(left = 0f, top = dy) {
                    drawRect(brush = brush, alpha = alpha)
                }
                drawRect(
                    brush = Brush.verticalGradient(
                        0f to Color.Transparent,
                        EliteSurfaceAtmosphere.HONEYCOMB_COVERAGE to floor.copy(alpha = 0.35f),
                        1f to floor,
                    ),
                )
                if (animate) {
                    val pulseR = radiusPx * 0.32f
                    val origins = listOf(
                        Offset(size.width * 0.18f, size.height * 0.08f),
                        Offset(size.width * 0.72f, size.height * 0.14f),
                        Offset(size.width * 0.42f, size.height * 0.22f),
                    ).take(HoneycombMesh.pulseCells)
                    origins.forEach { origin ->
                        drawCircle(
                            color = strokeColor.copy(alpha = pulseAlpha * sessionScale),
                            radius = pulseR,
                            center = origin,
                        )
                    }
                }
            },
    )
}

@Composable
private fun CanvasLike(modifier: Modifier) {
    androidx.compose.foundation.layout.Box(modifier = modifier.fillMaxSize())
}

@Composable
private fun honeycombMotion(animate: Boolean): Pair<Float, Float> {
    if (!animate) return 0f to 0f
    val transition = rememberInfiniteTransition(label = "honeycomb-atmosphere")
    val drift by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = EliteSurfaceAtmosphere.HONEYCOMB_DRIFT_MS,
                easing = LinearEasing,
            ),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "honeycomb-drift",
    )
    val pulse by transition.animateFloat(
        initialValue = EliteSurfaceAtmosphere.HONEYCOMB_PULSE * 0.35f,
        targetValue = EliteSurfaceAtmosphere.HONEYCOMB_PULSE,
        animationSpec = infiniteRepeatable(
            animation = tween(2_200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "honeycomb-pulse",
    )
    return drift to pulse
}

internal fun renderHexTile(radiusPx: Float, color: Color, strokePx: Float): ImageBitmap {
    val (periodW, periodH) = HoneycombMesh.tilePeriod(radiusPx)
    val width = ceil(periodW.toDouble()).toInt().coerceAtLeast(8)
    val height = ceil(periodH.toDouble()).toInt().coerceAtLeast(8)
    val bitmap = ImageBitmap(width, height)
    val canvas = Canvas(bitmap)
    val paint = Paint().apply {
        this.color = color
        style = PaintingStyle.Stroke
        strokeWidth = strokePx.coerceAtLeast(1f)
        isAntiAlias = true
    }
    val colW = radiusPx * 1.5f
    val rowH = periodH / 2f
    val centers = listOf(
        0f to 0f,
        colW to 0f,
        colW * 2f to 0f,
        colW * 0.5f to rowH,
        colW * 1.5f to rowH,
        0f to rowH * 2f,
        colW to rowH * 2f,
        colW * 2f to rowH * 2f,
    )
    centers.forEach { (cx, cy) ->
        canvas.drawPath(honeycombHexPath(cx, cy, radiusPx), paint)
    }
    return bitmap
}

internal fun honeycombHexPath(cx: Float, cy: Float, radius: Float): androidx.compose.ui.graphics.Path {
    val verts = HoneycombMesh.hexVertices(cx, cy, radius)
    return androidx.compose.ui.graphics.Path().apply {
        moveTo(verts[0], verts[1])
        var i = 2
        while (i < verts.size) {
            lineTo(verts[i], verts[i + 1])
            i += 2
        }
        close()
    }
}

private fun Context.isPowerSaveMode(): Boolean =
    (getSystemService(Context.POWER_SERVICE) as? PowerManager)?.isPowerSaveMode == true
