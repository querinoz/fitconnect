package com.fitconnect.android.glance

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.fitconnect.android.R
import com.fitconnect.android.capture.glance.GlancePrefs
import com.fitconnect.shared.glance.GlanceSnapshot

enum class GlanceWidgetKind {
    TODAY,
    TRAIN,
    RECOVERY,
    PROGRESS,
    MARTIAL,
    COACH,
    DEVICE,
}

abstract class FitConnectGlanceWidget : AppWidgetProvider() {
    abstract val kind: GlanceWidgetKind

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val snap = GlancePrefs.load(context).redact(
            showRecovery = GlancePrefs.showRecovery(context),
            showHeartRate = GlancePrefs.showHeartRate(context),
            showLockDetails = GlancePrefs.showLockDetails(context),
            surface = "widget",
        )
        val copy = copyFor(kind, snap)
        appWidgetIds.forEach { id ->
            val views = RemoteViews(context.packageName, R.layout.widget_glance)
            views.setTextViewText(R.id.widget_kicker, copy.kicker)
            views.setTextViewText(R.id.widget_title, copy.title)
            views.setTextViewText(R.id.widget_subtitle, copy.subtitle)
            views.setOnClickPendingIntent(R.id.widget_root, deepLink(context, copy.link))
            appWidgetManager.updateAppWidget(id, views)
        }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            listOf(
                TodayGlanceWidget::class.java,
                TrainGlanceWidget::class.java,
                RecoveryGlanceWidget::class.java,
                ProgressGlanceWidget::class.java,
                MartialArtsGlanceWidget::class.java,
                CoachGlanceWidget::class.java,
                DeviceGlanceWidget::class.java,
            ).forEach { cls ->
                val ids = mgr.getAppWidgetIds(ComponentName(context, cls))
                if (ids.isNotEmpty()) {
                    context.sendBroadcast(
                        Intent(context, cls)
                            .setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
                            .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids),
                    )
                }
            }
        }

        internal fun copyFor(kind: GlanceWidgetKind, snap: GlanceSnapshot): GlanceCopy {
            return when (kind) {
                GlanceWidgetKind.TODAY -> GlanceCopy(
                    "TODAY",
                    snap.sport,
                    "${snap.durationMin} min · ${snap.nextAction}",
                    "fitconnect://app/train",
                )
                GlanceWidgetKind.TRAIN -> GlanceCopy(
                    "TRAIN",
                    snap.title,
                    "${snap.sport} · ${snap.durationMin} min",
                    "fitconnect://app/train",
                )
                GlanceWidgetKind.RECOVERY -> GlanceCopy(
                    "RECOVERY",
                    snap.recoveryHRV,
                    "Sleep ${snap.recoverySleep}",
                    "fitconnect://app/recovery",
                )
                GlanceWidgetKind.PROGRESS -> GlanceCopy(
                    "PROGRESS",
                    if (snap.xp == 0) "No XP yet" else "${snap.xp} XP",
                    if (snap.streak == 0) "No streak" else "Streak ${snap.streak}",
                    "fitconnect://app/ascend",
                )
                GlanceWidgetKind.MARTIAL -> GlanceCopy(
                    "MARTIAL ARTS",
                    if (snap.kind == "fight") snap.title else "Fight Mode",
                    snap.roundLabel.ifBlank { "Open catalog" },
                    "fitconnect://app/martial-arts",
                )
                GlanceWidgetKind.COACH -> GlanceCopy(
                    "COACH",
                    snap.coachNext,
                    "No athlete health on this surface",
                    "fitconnect://app/coach",
                )
                GlanceWidgetKind.DEVICE -> GlanceCopy(
                    "DEVICE",
                    snap.deviceStatus,
                    "Sync ${snap.syncStatus}",
                    "fitconnect://app/connections",
                )
            }
        }

        private fun deepLink(context: Context, uri: String): PendingIntent {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri)).setPackage(context.packageName)
            return PendingIntent.getActivity(
                context,
                uri.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }
    }
}

data class GlanceCopy(
    val kicker: String,
    val title: String,
    val subtitle: String,
    val link: String,
)

class TodayGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.TODAY
}

class TrainGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.TRAIN
}

class RecoveryGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.RECOVERY
}

class ProgressGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.PROGRESS
}

class MartialArtsGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.MARTIAL
}

class CoachGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.COACH
}

class DeviceGlanceWidget : FitConnectGlanceWidget() {
    override val kind = GlanceWidgetKind.DEVICE
}
