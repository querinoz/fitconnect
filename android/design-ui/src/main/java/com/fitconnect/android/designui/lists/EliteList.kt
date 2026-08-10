package com.fitconnect.android.designui.lists

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteSkeleton
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Virtualized list (Compose LazyColumn = Recycler / FlashList equivalent on native).
 * Supports pull-to-refresh, infinite scroll threshold, and skeleton placeholders.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun <T> EliteLazyList(
    items: List<T>,
    key: (T) -> Any,
    modifier: Modifier = Modifier,
    refreshing: Boolean = false,
    onRefresh: (() -> Unit)? = null,
    loadingMore: Boolean = false,
    onLoadMore: (() -> Unit)? = null,
    showSkeleton: Boolean = false,
    skeletonCount: Int = 6,
    contentPadding: PaddingValues = PaddingValues(EliteSpace.Lg),
    itemContent: @Composable (T) -> Unit,
) {
    val listState = rememberLazyListState()
    val shouldLoadMore by remember {
        derivedStateOf {
            val info = listState.layoutInfo
            val last = info.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= info.totalItemsCount - 3
        }
    }
    LaunchedEffect(shouldLoadMore, loadingMore) {
        if (shouldLoadMore && !loadingMore) onLoadMore?.invoke()
    }

    val body: @Composable () -> Unit = {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = contentPadding,
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            if (showSkeleton && items.isEmpty()) {
                items(skeletonCount) { EliteSkeleton() }
            } else {
                items(items = items, key = key) { item -> itemContent(item) }
                if (loadingMore) {
                    item(key = "elite_loading_more") { EliteLoading() }
                }
            }
        }
    }

    if (onRefresh != null) {
        PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = onRefresh,
            modifier = modifier.fillMaxSize(),
            content = { body() },
        )
    } else {
        Box(modifier = modifier.fillMaxSize()) { body() }
    }
}

fun LazyListScope.eliteListSection(
    titleKey: String,
    content: LazyListScope.() -> Unit,
) {
    item(key = titleKey) { /* section hooks for feature modules */ }
    content()
}
