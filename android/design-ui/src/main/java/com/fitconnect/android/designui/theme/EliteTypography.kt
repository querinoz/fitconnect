package com.fitconnect.android.designui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceType as T
import com.fitconnect.android.designui.R

/**
 * Typography maps generated TYPE_TOKENS.
 * Syne / Plus Jakarta Sans / JetBrains Mono are bundled under res/font.
 */
private val Syne = FontFamily(Font(R.font.syne_regular, FontWeight.Normal))
private val PlusJakarta = FontFamily(Font(R.font.plus_jakarta_sans_regular, FontWeight.Normal))
private val JetBrainsMono = FontFamily(Font(R.font.jetbrains_mono_regular, FontWeight.Normal))

private fun style(
    size: Float,
    lineHeight: Float,
    weight: Int,
    tracking: Float,
    family: String,
): TextStyle = TextStyle(
    fontSize = size.sp,
    lineHeight = lineHeight.sp,
    fontWeight = FontWeight(weight),
    letterSpacing = tracking.sp,
    fontFeatureSettings = "tnum",
    fontFamily = when (family) {
        "display" -> Syne
        "mono" -> JetBrainsMono
        else -> PlusJakarta
    },
)

val EliteTypographyStyles = Typography(
    displayLarge = style(T.DISPLAY_XL_SIZE_SP, T.DISPLAY_XL_LINE_HEIGHT_SP, T.DISPLAY_XL_WEIGHT, T.DISPLAY_XL_TRACKING, T.DISPLAY_XL_FAMILY),
    displayMedium = style(T.DISPLAY_L_SIZE_SP, T.DISPLAY_L_LINE_HEIGHT_SP, T.DISPLAY_L_WEIGHT, T.DISPLAY_L_TRACKING, T.DISPLAY_L_FAMILY),
    headlineMedium = style(T.HEADLINE_SIZE_SP, T.HEADLINE_LINE_HEIGHT_SP, T.HEADLINE_WEIGHT, T.HEADLINE_TRACKING, T.HEADLINE_FAMILY),
    titleLarge = style(T.TITLE_SIZE_SP, T.TITLE_LINE_HEIGHT_SP, T.TITLE_WEIGHT, T.TITLE_TRACKING, T.TITLE_FAMILY),
    titleMedium = style(T.SUBTITLE_SIZE_SP, T.SUBTITLE_LINE_HEIGHT_SP, T.SUBTITLE_WEIGHT, T.SUBTITLE_TRACKING, T.SUBTITLE_FAMILY),
    bodyLarge = style(T.BODY_SIZE_SP, T.BODY_LINE_HEIGHT_SP, T.BODY_WEIGHT, T.BODY_TRACKING, T.BODY_FAMILY),
    bodyMedium = style(T.BODY_SIZE_SP, T.BODY_LINE_HEIGHT_SP, T.BODY_WEIGHT, T.BODY_TRACKING, T.BODY_FAMILY),
    labelLarge = style(T.CAPTION_SIZE_SP, T.CAPTION_LINE_HEIGHT_SP, T.CAPTION_WEIGHT, T.CAPTION_TRACKING, T.CAPTION_FAMILY),
    labelSmall = style(T.OVERLINE_SIZE_SP, T.OVERLINE_LINE_HEIGHT_SP, T.OVERLINE_WEIGHT, T.OVERLINE_TRACKING, T.OVERLINE_FAMILY),
)

val EliteMetricTextStyle: TextStyle = style(
    T.METRIC_SIZE_SP,
    T.METRIC_LINE_HEIGHT_SP,
    T.METRIC_WEIGHT,
    T.METRIC_TRACKING,
    T.METRIC_FAMILY,
)

val EliteMetricHeroTextStyle: TextStyle = style(
    T.METRIC_HERO_SIZE_SP,
    T.METRIC_HERO_LINE_HEIGHT_SP,
    T.METRIC_HERO_WEIGHT,
    T.METRIC_HERO_TRACKING,
    T.METRIC_HERO_FAMILY,
)

val EliteMonoTextStyle: TextStyle = style(
    T.MONOSPACE_SIZE_SP,
    T.MONOSPACE_LINE_HEIGHT_SP,
    T.MONOSPACE_WEIGHT,
    T.MONOSPACE_TRACKING,
    T.MONOSPACE_FAMILY,
)
