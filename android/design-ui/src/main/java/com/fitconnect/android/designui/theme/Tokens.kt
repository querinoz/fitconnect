package com.fitconnect.android.designui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceBorder
import com.fitconnect.android.design.EliteSurfaceElevation
import com.fitconnect.android.design.EliteSurfaceOpacity
import com.fitconnect.android.design.EliteSurfaceRadius
import com.fitconnect.android.design.EliteSurfaceSpacing

fun Long.toColor(): Color = Color(this)

val LocalReduceMotion = staticCompositionLocalOf { false }
val LocalHighContrast = staticCompositionLocalOf { false }

object EliteSpace {
    val None: Dp get() = EliteSurfaceSpacing.NONE.dp
    val Xxs: Dp get() = EliteSurfaceSpacing.XXS.dp
    val Xs: Dp get() = EliteSurfaceSpacing.XS.dp
    val Sm: Dp get() = EliteSurfaceSpacing.SM.dp
    val Md: Dp get() = EliteSurfaceSpacing.MD.dp
    val Lg: Dp get() = EliteSurfaceSpacing.LG.dp
    val Xl: Dp get() = EliteSurfaceSpacing.XL.dp
    val Xxl: Dp get() = EliteSurfaceSpacing.XXL.dp
    val Xxxl: Dp get() = EliteSurfaceSpacing.XXXL.dp
    val Huge: Dp get() = EliteSurfaceSpacing.HUGE.dp
}

object EliteRadius {
    val None: Dp get() = EliteSurfaceRadius.NONE.dp
    val Xs: Dp get() = EliteSurfaceRadius.XS.dp
    val Sm: Dp get() = EliteSurfaceRadius.SM.dp
    val Md: Dp get() = EliteSurfaceRadius.MD.dp
    val Lg: Dp get() = EliteSurfaceRadius.LG.dp
    val Xl: Dp get() = EliteSurfaceRadius.XL.dp
    val Full: Dp get() = EliteSurfaceRadius.FULL.dp
}

object EliteElevation {
    val None: Dp get() = EliteSurfaceElevation.NONE.dp
    val Low: Dp get() = EliteSurfaceElevation.LOW.dp
    val Mid: Dp get() = EliteSurfaceElevation.MID.dp
    val High: Dp get() = EliteSurfaceElevation.HIGH.dp
    val Overlay: Dp get() = EliteSurfaceElevation.OVERLAY.dp
}

object EliteOpacity {
    val Disabled get() = EliteSurfaceOpacity.DISABLED
    val Muted get() = EliteSurfaceOpacity.MUTED
    val Subtle get() = EliteSurfaceOpacity.SUBTLE
    val Glass get() = EliteSurfaceOpacity.GLASS
    val Scrim get() = EliteSurfaceOpacity.SCRIM
    val Border get() = EliteSurfaceOpacity.BORDER
}

object EliteBorder {
    val Hairline: Dp get() = EliteSurfaceBorder.HAIRLINE.dp
    val Thin: Dp get() = EliteSurfaceBorder.THIN.dp
    val Thick: Dp get() = EliteSurfaceBorder.THICK.dp
}

@Composable
@ReadOnlyComposable
fun reduceMotionEnabled(): Boolean = LocalReduceMotion.current
