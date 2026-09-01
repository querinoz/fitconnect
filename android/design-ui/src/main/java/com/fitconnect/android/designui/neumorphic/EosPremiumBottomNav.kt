package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteNavItem
import com.fitconnect.android.designui.components.EliteNavTab
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

private val NavAccent = { EliteSurfaceColors.CONNECT.toColor() }

@Composable
fun EosPremiumBottomNavigation(
    items: List<EliteNavItem>,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = EliteSpace.Md, vertical = EliteSpace.Sm),
    ) {
        EosGlassSurface(
            modifier = Modifier.fillMaxWidth(),
            cornerRadius = 24.dp,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp)
                    .padding(horizontal = EliteSpace.Xs),
                horizontalArrangement = Arrangement.SpaceAround,
            ) {
                items.forEach { item ->
                    EliteNavTab(item = item, selectedColor = NavAccent())
                }
            }
        }
    }
}
