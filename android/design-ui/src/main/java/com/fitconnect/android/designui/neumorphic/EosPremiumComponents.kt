package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Convex molded card — session, weather, coach channel.
 */
@Composable
fun EosPremiumCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(cornerRadius)
    EosNeumorphicSurface(
        modifier = modifier,
        style = EosNeumorphicStyle.Convex,
        cornerRadius = cornerRadius,
        onClick = onClick,
    ) {
        Column(
            modifier = Modifier
                .border(1.dp, EosNeumorphicColors.RimConvex, shape)
                .padding(EliteSpace.Lg),
            content = content,
        )
    }
}

/**
 * Concave molded well — charts, inputs, inset data zones.
 */
@Composable
fun EosPremiumWell(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
    content: @Composable BoxScope.() -> Unit,
) {
    val shape = RoundedCornerShape(cornerRadius)
    EosNeumorphicSurface(
        modifier = modifier,
        style = EosNeumorphicStyle.Concave,
        cornerRadius = cornerRadius,
    ) {
        Box(
            modifier = Modifier
                .clip(shape)
                .background(EosNeumorphicColors.MoldSurface)
                .border(1.dp, EosNeumorphicColors.RimConcave, shape)
                .padding(EliteSpace.Lg),
            content = content,
        )
    }
}
