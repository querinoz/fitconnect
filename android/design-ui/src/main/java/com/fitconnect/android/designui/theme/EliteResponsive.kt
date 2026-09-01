package com.fitconnect.android.designui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalConfiguration

/** Width below which athlete chrome stacks instead of crowding a single row. */
const val EliteCompactWidthDp = 400

/** Width below which header status copy is hidden to preserve avatar/actions. */
const val EliteHeaderCompactWidthDp = 420

@Composable
fun isCompactAthleteWidth(): Boolean =
    LocalConfiguration.current.screenWidthDp < EliteCompactWidthDp

@Composable
fun isCompactAthleteHeader(): Boolean =
    LocalConfiguration.current.screenWidthDp < EliteHeaderCompactWidthDp
