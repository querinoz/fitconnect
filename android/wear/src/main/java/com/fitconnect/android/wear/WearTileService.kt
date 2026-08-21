package com.fitconnect.android.wear

import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.design.EliteSurfaceColors
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

/**
 * Elite Readiness tile. Timeline is chosen at request time: loading, empty,
 * error, default LOCAL_DEMO readiness, or session-active.
 */
class WearTileService : TileService() {
    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> {
        return Futures.immediateFuture(buildTile())
    }

    override fun onTileResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> {
        return Futures.immediateFuture(
            ResourceBuilders.Resources.Builder().setVersion(RESOURCES_VERSION).build(),
        )
    }

    private fun buildTile(): TileBuilders.Tile {
        val engine = WearRuntime.engine
        val phase = engine?.state?.value?.phase
        val layout = when {
            engine == null -> emptyLayout()
            phase == LiveActivityPhase.RUNNING || phase == LiveActivityPhase.PAUSED ->
                sessionLayout(phase)
            WearRuntime.lastBlockCode != null -> errorLayout(WearRuntime.lastBlockCode ?: "ERROR")
            else -> readinessLayout()
        }
        val freshness = if (phase == LiveActivityPhase.RUNNING) 15_000L else 3_600_000L
        return TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setFreshnessIntervalMillis(freshness)
            .setTileTimeline(
                TimelineBuilders.Timeline.Builder()
                    .addTimelineEntry(
                        TimelineBuilders.TimelineEntry.Builder()
                            .setLayout(
                                LayoutElementBuilders.Layout.Builder().setRoot(layout).build(),
                            )
                            .build(),
                    )
                    .build(),
            )
            .build()
    }

    private fun readinessLayout() = metricColumn(
        kicker = "READINESS",
        value = "88",
        footnote = "PRIMED · LOCAL_DEMO",
        kickerColor = EliteSurfaceColors.CONNECT,
        valueColor = EliteSurfaceColors.VOLTLINE,
    )

    private fun sessionLayout(phase: LiveActivityPhase) = metricColumn(
        kicker = if (phase == LiveActivityPhase.PAUSED) "PAUSED" else "ACTIVE",
        value = "LIVE",
        footnote = "SESSION · WATCH",
        kickerColor = EliteSurfaceColors.TELEMETRY,
        valueColor = EliteSurfaceColors.VOLTLINE,
    )

    private fun emptyLayout() = metricColumn(
        kicker = "FITCONNECT",
        value = "—",
        footnote = "OPEN APP",
        kickerColor = EliteSurfaceColors.CONNECT,
        valueColor = EliteSurfaceColors.ON_SURFACE,
    )

    private fun errorLayout(code: String) = metricColumn(
        kicker = "BLOCKED",
        value = code,
        footnote = "OWNERSHIP",
        kickerColor = EliteSurfaceColors.ALERT,
        valueColor = EliteSurfaceColors.ALERT,
    )

    private fun metricColumn(
        kicker: String,
        value: String,
        footnote: String,
        kickerColor: Long,
        valueColor: Long,
    ): LayoutElementBuilders.LayoutElement {
        val click = ModifiersBuilders.Modifiers.Builder()
            .setClickable(
                ModifiersBuilders.Clickable.Builder()
                    .setId("open_app")
                    .setOnClick(
                        ActionBuilders.LaunchAction.Builder()
                            .setAndroidActivity(
                                ActionBuilders.AndroidActivity.Builder()
                                    .setPackageName(packageName)
                                    .setClassName(WearMainActivity::class.java.name)
                                    .build(),
                            )
                            .build(),
                    )
                    .build(),
            )
            .build()
        return LayoutElementBuilders.Column.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setModifiers(click)
            .addContent(text(kicker, kickerColor, caption = true))
            .addContent(text(value, valueColor, caption = false))
            .addContent(text(footnote, EliteSurfaceColors.ON_SURFACE_MUTED, caption = true))
            .build()
    }

    private fun text(value: String, color: Long, caption: Boolean): LayoutElementBuilders.Text {
        val size = LayoutElementBuilders.FontStyle.Builder()
            .setColor(argb(color.toInt()))
            .setSize(androidx.wear.protolayout.DimensionBuilders.sp(if (caption) 12f else 32f))
            .build()
        return LayoutElementBuilders.Text.Builder()
            .setText(value)
            .setFontStyle(size)
            .build()
    }

    companion object {
        private const val RESOURCES_VERSION = "1"
    }
}
