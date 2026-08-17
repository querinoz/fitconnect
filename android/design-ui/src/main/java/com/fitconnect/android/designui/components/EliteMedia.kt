package com.fitconnect.android.designui.components

import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource

@Composable
fun eliteDrawableId(name: String): Int {
    val context = LocalContext.current
    return remember(name) {
        val clean = name.substringAfterLast('/').substringBefore('.')
        if (clean.isBlank()) 0 else context.resources.getIdentifier(clean, "drawable", context.packageName)
    }
}

@Composable
fun eliteRawId(name: String): Int {
    val context = LocalContext.current
    return remember(name) {
        val clean = name.substringAfterLast('/').substringBefore('.')
        if (clean.isBlank()) 0 else context.resources.getIdentifier(clean, "raw", context.packageName)
    }
}

@Composable
fun EliteLocalImageExists(name: String): Boolean = eliteDrawableId(name) != 0

@Composable
fun EliteLocalImage(
    name: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
) {
    val resId = eliteDrawableId(name)
    if (resId != 0) {
        Image(
            painter = painterResource(resId),
            contentDescription = contentDescription,
            modifier = modifier,
            contentScale = contentScale,
        )
    }
}
