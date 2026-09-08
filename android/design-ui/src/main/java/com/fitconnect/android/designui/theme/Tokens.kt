package com.fitconnect.android.designui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceAtmosphere
import com.fitconnect.android.design.EliteSurfaceBorder
import com.fitconnect.android.design.EliteSurfaceElevation
import com.fitconnect.android.design.EliteSurfaceGlass
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.design.EliteSurfaceOpacity
import com.fitconnect.android.design.EliteSurfaceRadius
import com.fitconnect.android.design.EliteSurfaceSpacing
import com.fitconnect.android.foundation.theme.HoneycombIntensity

fun Long.toColor(): Color = Color(this)

val LocalReduceMotion = staticCompositionLocalOf { false }
val LocalHighContrast = staticCompositionLocalOf { false }
val LocalHoneycombIntensity = staticCompositionLocalOf { HoneycombIntensity.SUBTLE }

object EliteAtmosphere {
    val HoneycombSubtle get() = EliteSurfaceAtmosphere.HONEYCOMB_SUBTLE
    val HoneycombParallax get() = EliteSurfaceAtmosphere.HONEYCOMB_PARALLAX
    val HoneycombPulse get() = EliteSurfaceAtmosphere.HONEYCOMB_PULSE
    val HoneycombCellRadius: Dp get() = EliteSurfaceAtmosphere.HONEYCOMB_CELL_RADIUS.dp
}

object EliteSpace {
    val None: Dp get() = EliteSurfaceSpacing.NONE.dp
    val Xxs: Dp get() = EliteSurfaceSpacing.XXS.dp
    val Xs: Dp get() = EliteSurfaceSpacing.XS.dp
    val Sm: Dp get() = EliteSurfaceSpacing.SM.dp
    val Md: Dp get() = EliteSurfaceSpacing.MD.dp
    val Lg: Dp get() = EliteSurfaceSpacing.LG.dp
    val Inset: Dp get() = EliteSurfaceSpacing.INSET.dp
    val Xl: Dp get() = EliteSurfaceSpacing.XL.dp
    val Xxl: Dp get() = EliteSurfaceSpacing.XXL.dp
    val Section: Dp get() = EliteSurfaceSpacing.SECTION.dp
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
    /** Gym-layout media / soft chrome — alias of XL (24). Prefer over raw Lg for hero cards. */
    val Media: Dp get() = EliteSurfaceRadius.XL.dp
    /** Soft floating chrome (nav wells) — honeycomb cell radius token. */
    val SoftChrome: Dp get() = EliteSurfaceAtmosphere.HONEYCOMB_CELL_RADIUS.dp
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

object EliteGlass {
    val L1 get() = EliteSurfaceGlass.L_1
    val L2 get() = EliteSurfaceGlass.L_2
    val L3 get() = EliteSurfaceGlass.L_3
    val L4 get() = EliteSurfaceGlass.L_4
    val L5 get() = EliteSurfaceGlass.L_5
    val Highlight get() = EliteSurfaceGlass.HIGHLIGHT
    val BlurL3: Dp get() = EliteSurfaceGlass.BLUR_L_3.dp
    val BlurL4: Dp get() = EliteSurfaceGlass.BLUR_L_4.dp
    val BlurL5: Dp get() = EliteSurfaceGlass.BLUR_L_5.dp
}

object EliteBorder {
    val Hairline: Dp get() = EliteSurfaceBorder.HAIRLINE.dp
    val Thin: Dp get() = EliteSurfaceBorder.THIN.dp
    val Thick: Dp get() = EliteSurfaceBorder.THICK.dp
}

object EliteNavChrome {
    val Bar: Dp get() = EliteSurfaceInstrument.NAV_BAR_DP.dp
    val Dock: Dp get() = EliteSurfaceInstrument.NAV_DOCK_DP.dp
    val Fab: Dp get() = EliteSurfaceInstrument.TRAIN_FAB_DP.dp
    val CradleRadius: Dp get() = EliteSurfaceInstrument.NAV_CRADLE_RADIUS_DP.dp
    val ActiveIndicator: Dp get() = EliteSurfaceInstrument.NAV_ACTIVE_INDICATOR_DP.dp
    val FabLift: Dp get() = EliteSurfaceInstrument.NAV_FAB_LIFT_DP.dp
}

@Composable
@ReadOnlyComposable
fun reduceMotionEnabled(): Boolean = LocalReduceMotion.current
