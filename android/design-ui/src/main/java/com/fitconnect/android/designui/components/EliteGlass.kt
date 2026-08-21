package com.fitconnect.android.designui.components

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.EliteSurfaceTheme
import androidx.compose.material3.Text
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxWidth

@Composable
fun EliteGlassCard(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = EliteRadius.Xl,
    blurRadius: Dp = 16.dp,
    content: @Composable BoxScope.() -> Unit
) {
    val isAtLeastS = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    val shape = RoundedCornerShape(cornerRadius)
    
    Box(
        modifier = modifier
            .clip(shape)
            .then(
                if (isAtLeastS) {
                    Modifier.blur(blurRadius)
                } else {
                    Modifier
                }
            )
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.08f),
                        Color.White.copy(alpha = 0.02f)
                    )
                )
            )
            .border(
                EliteBorder.Hairline,
                Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = 0.12f),
                        Color.White.copy(alpha = 0.04f)
                    )
                ),
                shape
            )
            .padding(EliteSpace.Lg)
    ) {
        // Overlay a slight tint to ensure readability even without blur support
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(Color.Black.copy(alpha = 0.2f))
        )
        content()
    }
}

@Preview
@Composable
fun EliteGlassCardPreview() {
    EliteSurfaceTheme {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            contentAlignment = androidx.compose.ui.Alignment.Center
        ) {
            EliteGlassCard {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Ultra Premium Glass", color = Color.White)
                    Text("Design System 2.0", color = Color.White.copy(alpha = 0.7f))
                }
            }
        }
    }
}
