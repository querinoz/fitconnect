package com.fitconnect.android.designui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MonitorHeart
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceMotion
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

fun elitePrimeStatus(score: Int): String = when {
    score >= 80 -> "PRIMED"
    score >= 65 -> "READY"
    score >= 50 -> "MODERATE"
    else -> "RECOVER"
}

fun elitePeakTitle(score: Int): String = when {
    score >= 75 -> "Peak Readiness"
    score >= 50 -> "Train Smart"
    else -> "Recovery Focus"
}

fun eliteDayStrain(readinessScore: Int): Double =
    ((100 - readinessScore).coerceIn(0, 100) * 0.12) + 8.0

fun eliteNervousLabel(recovery: Int): String = when {
    recovery >= 75 -> "OPTIMAL"
    recovery >= 50 -> "BALANCED"
    recovery >= 30 -> "CAUTION"
    else -> "STRAIN"
}

/**
 * Stitch native chrome: avatar | FITCONNECT | sensors.
 */
@Composable
fun EliteWordmarkHeader(
    initials: String,
    modifier: Modifier = Modifier,
    showWordmark: Boolean = true,
    onAvatarClick: () -> Unit = {},
    onSensorsClick: () -> Unit = {},
) {
    val volt = MaterialTheme.colorScheme.primary
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("elite_wordmark_header")
            .padding(vertical = EliteSpace.Sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        EliteAvatar(
            initials = initials,
            modifier = Modifier
                .clip(CircleShape)
                .border(EliteBorder.Hairline, MaterialTheme.colorScheme.outline, CircleShape)
                .clickable(onClick = onAvatarClick)
                .semantics { contentDescription = "Profile" },
        )
        if (showWordmark) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "FITCONNECT",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.4).sp,
                    ),
                    color = MaterialTheme.colorScheme.onBackground,
                )
                Box(
                    modifier = Modifier
                        .padding(top = EliteSpace.Xxs)
                        .size(width = EliteSpace.Xl, height = EliteBorder.Thin)
                        .background(volt, RoundedCornerShape(EliteRadius.Full)),
                )
            }
        }
        EliteIconButton(onClick = onSensorsClick, contentDescription = "Wearable sync") {
            Icon(
                imageVector = Icons.Filled.MonitorHeart,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

/**
 * Page-level Prime Recovery instrument — Stitch athlete cockpit hero.
 */
@Composable
fun ElitePrimeInstrument(
    score: Int,
    modifier: Modifier = Modifier,
    status: String = elitePrimeStatus(score),
    title: String = elitePeakTitle(score),
    subtitle: String? = null,
    size: Dp = EliteRingHero,
    overline: String = "PRIME RECOVERY",
    showCaption: Boolean = true,
) {
    val clamped = score.coerceIn(0, 100)
    val volt = MaterialTheme.colorScheme.primary
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("prime_recovery_block"),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        EliteInstrumentRing(
            progress = clamped / 100f,
            diameter = size,
            contentDescription = "Recovery $clamped percent, status $status",
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = overline,
                    style = EliteMonoTextStyle.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.6.sp,
                    ),
                    color = volt,
                )
                Text(
                    text = "$clamped",
                    style = com.fitconnect.android.designui.theme.EliteMetricHeroTextStyle,
                    color = MaterialTheme.colorScheme.onBackground,
                )
                Text(
                    text = status,
                    style = EliteMonoTextStyle.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp,
                    ),
                    color = volt.copy(alpha = EliteOpacity.Subtle),
                )
            }
        }
        if (showCaption) {
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(top = EliteSpace.Md),
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = EliteSpace.Xs),
                )
            }
        }
    }
}

@Composable
fun EliteBentoCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    val shape = RoundedCornerShape(EliteRadius.Xl)
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val click = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
    Box(
        modifier = modifier
            .clip(shape)
            .then(click)
            .background(carbon)
            .border(
                EliteBorder.Hairline,
                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.08f),
                shape,
            )
            .padding(EliteSpace.Lg),
    ) {
        content()
    }
}

@Composable
fun EliteBentoMetric(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    unit: String? = null,
    delta: String? = null,
    accentVolt: Boolean = true,
    onClick: (() -> Unit)? = null,
) {
    val volt = MaterialTheme.colorScheme.primary
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    EliteBentoCard(modifier = modifier, onClick = onClick) {
        Column(verticalArrangement = Arrangement.SpaceBetween) {
            EliteSysLabel(label)
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = value,
                    style = EliteMetricTextStyle,
                    color = MaterialTheme.colorScheme.onBackground,
                )
                if (unit != null) {
                    Text(
                        text = " $unit",
                        style = EliteMonoTextStyle,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = EliteSpace.Xxs),
                    )
                }
            }
            if (delta != null) {
                Box(
                    modifier = Modifier
                        .padding(top = EliteSpace.Sm)
                        .clip(RoundedCornerShape(EliteRadius.Full))
                        .background((if (accentVolt) volt else telemetry).copy(alpha = 0.12f))
                        .border(
                            EliteBorder.Hairline,
                            (if (accentVolt) volt else telemetry).copy(alpha = 0.22f),
                            RoundedCornerShape(EliteRadius.Full),
                        )
                        .padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Xxs),
                ) {
                    Text(
                        text = delta,
                        style = EliteMonoTextStyle,
                        color = if (accentVolt) volt else telemetry,
                    )
                }
            }
        }
    }
}

@Composable
fun EliteBentoRow(
    modifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        content = content,
    )
}

@Composable
fun EliteAiDirective(
    body: String,
    action: String,
    onAction: () -> Unit,
    modifier: Modifier = Modifier,
    title: String = "AI DIRECTIVE",
    actionVariant: EliteButtonVariant = EliteButtonVariant.Secondary,
) {
    val volt = MaterialTheme.colorScheme.primary
    EliteBentoCard(modifier = modifier.testTag("elite_ai_directive")) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = null,
                    tint = EliteSurfaceColors.TELEMETRY.toColor(),
                    modifier = Modifier.size(16.dp),
                )
                EliteSysLabel(title)
            }
            Text(
                text = body,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            EliteButton(
                label = action,
                onClick = onAction,
                variant = actionVariant,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
fun EliteAiFab(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String = "AI Coach",
) {
    val volt = MaterialTheme.colorScheme.primary
    val elevated = EliteSurfaceColors.ELEVATED.toColor()
    Box(
        modifier = modifier
            .size(Accessibility.PREFERRED_TOUCH_TARGET_DP.dp + 8.dp)
            .clip(CircleShape)
            .background(elevated.copy(alpha = 0.72f))
            .border(EliteBorder.Thin, volt.copy(alpha = 0.35f), CircleShape)
            .clickable(onClick = onClick)
            .testTag("elite_ai_fab")
            .semantics { this.contentDescription = contentDescription },
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = Icons.Filled.Star,
            contentDescription = null,
            tint = volt,
            modifier = Modifier.size(28.dp),
        )
    }
}

@Composable
fun EliteMarketplaceCard(
    name: String,
    sport: String,
    specialty: String,
    city: String,
    rating: String,
    price: String,
    verified: Boolean,
    available: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    coverImageName: String? = null,
) {
    val volt = MaterialTheme.colorScheme.primary
    val connect = EliteSurfaceColors.CONNECT.toColor()
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val iris = EliteSurfaceColors.IRIS.toColor()
    val initials = name.split(" ").mapNotNull { it.firstOrNull()?.uppercase() }.take(2).joinToString("")
    EliteBentoCard(modifier = modifier.testTag("elite_marketplace_card"), onClick = onClick) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .clip(RoundedCornerShape(EliteRadius.Lg))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                carbon,
                                iris.copy(alpha = 0.35f),
                                EliteSurfaceColors.ELEVATED.toColor(),
                            ),
                        ),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                if (!coverImageName.isNullOrBlank() && EliteLocalImageExists(coverImageName)) {
                    EliteLocalImage(
                        name = coverImageName,
                        contentDescription = name,
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                    )
                } else {
                    Text(
                        text = initials.ifBlank { "FC" },
                        style = MaterialTheme.typography.displayMedium,
                        color = volt,
                    )
                }
                if (verified) {
                    EliteBadge(
                        text = "VERIFIED",
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(EliteSpace.Sm),
                    )
                }
            }
            Text(name, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onBackground)
            EliteSysLabel("$sport · $specialty")
            Text(
                text = city,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                EliteBadge(text = "★ $rating")
                EliteBadge(
                    text = price,
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                EliteBadge(
                    text = if (available) "AVAILABLE" else "WAITLIST",
                    containerColor = (if (available) connect else MaterialTheme.colorScheme.onSurfaceVariant)
                        .copy(alpha = 0.18f),
                    contentColor = if (available) connect else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
fun EliteTelemetryGrid(
    cells: List<Pair<String, String>>,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
        cells.chunked(3).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                row.forEach { (label, value) ->
                    EliteBentoCard(modifier = Modifier.weight(1f)) {
                        Column {
                            EliteSysLabel(label)
                            Text(
                                text = value,
                                style = EliteMetricTextStyle.copy(fontSize = 18.sp, lineHeight = 22.sp),
                                color = MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                }
                repeat(3 - row.size) {
                    Box(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
fun EliteLiveDot(
    live: Boolean,
    modifier: Modifier = Modifier,
    label: String = if (live) "LIVE" else "IDLE",
) {
    val reduceMotion = reduceMotionEnabled()
    val pulse = rememberInfiniteTransition(label = "elite-live-dot")
    val liveAlpha by pulse.animateFloat(
        initialValue = EliteOpacity.Muted,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(EliteSurfaceMotion.UI_MS * 4, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "elite-live-alpha",
    )
    val color = if (live) {
        EliteSurfaceColors.CONNECT.toColor()
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }
    val alpha = if (live && !reduceMotion) liveAlpha else 1f
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = alpha)),
        )
        Text(label, style = EliteMonoTextStyle, color = color)
    }
}

@Composable
fun EliteCommandPip(
    name: String,
    recovery: Int,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
) {
    val tone = when {
        recovery >= 75 -> EliteSurfaceColors.PERFORMANCE.toColor()
        recovery >= 50 -> MaterialTheme.colorScheme.primary
        else -> EliteSurfaceColors.ALERT.toColor()
    }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = EliteSpace.Xs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(name, style = MaterialTheme.typography.bodyLarge)
        Text(
            text = "$recovery",
            style = EliteMonoTextStyle.copy(fontWeight = FontWeight.Bold),
            color = tone,
        )
    }
}
