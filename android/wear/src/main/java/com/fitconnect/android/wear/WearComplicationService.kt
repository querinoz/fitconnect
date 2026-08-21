package com.fitconnect.android.wear

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.shared.identity.LocalDemoIdentity

/**
 * Publishes one FitConnect signal straight onto the user's watch face.
 *
 * Wear surface #3 (app -> tile -> complication). A complication is the highest-frequency,
 * lowest-effort surface there is: the number is simply *there* every time the wrist comes up,
 * with no navigation at all.
 *
 * Honesty rules carried over from the tile and the phone app:
 *  - readiness is still LOCAL_DEMO, so the description says so; nothing is presented as if it
 *    were measured from a live sensor;
 *  - when a session is running the complication switches to session state rather than showing
 *    a stale readiness number;
 *  - when ownership is blocked we surface the block code instead of a plausible-looking value.
 *
 * Supported types are declared in the manifest and must stay in sync with the `when` below.
 */
class WearComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? =
        when (type) {
            ComplicationType.SHORT_TEXT -> shortText(value = "88", label = "PRIME", tap = null)
            ComplicationType.RANGED_VALUE -> ranged(value = 88f, label = "88", tap = null)
            else -> null
        }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val tap = openAppIntent()
        val phase = WearRuntime.engine?.state?.value?.phase
        val blocked = WearRuntime.lastBlockCode

        return when (request.complicationType) {
            ComplicationType.SHORT_TEXT -> when {
                blocked != null -> shortText(value = blocked, label = "BLOCK", tap = tap)
                phase == LiveActivityPhase.RUNNING -> shortText(value = "LIVE", label = "SESSION", tap = tap)
                phase == LiveActivityPhase.PAUSED -> shortText(value = "HOLD", label = "SESSION", tap = tap)
                else -> shortText(
                    value = streakDays().toString(),
                    label = "STREAK",
                    tap = tap,
                )
            }

            ComplicationType.RANGED_VALUE -> when {
                phase == LiveActivityPhase.RUNNING || phase == LiveActivityPhase.PAUSED ->
                    ranged(value = READINESS, label = "LIVE", tap = tap)
                else -> ranged(value = READINESS, label = READINESS.toInt().toString(), tap = tap)
            }

            // Any type we did not declare in the manifest: return null rather than
            // guessing a rendering the watch face never asked for.
            else -> null
        }
    }

    private fun shortText(value: String, label: String, tap: PendingIntent?) =
        ShortTextComplicationData.Builder(
            text = plain(value),
            contentDescription = plain(DESCRIPTION),
        )
            .setTitle(plain(label))
            .apply { tap?.let { setTapAction(it) } }
            .build()

    private fun ranged(value: Float, label: String, tap: PendingIntent?) =
        RangedValueComplicationData.Builder(
            value = value,
            min = MIN,
            max = MAX,
            contentDescription = plain(DESCRIPTION),
        )
            .setText(plain(label))
            .setTitle(plain("PRIME"))
            .apply { tap?.let { setTapAction(it) } }
            .build()

    private fun plain(text: String): ComplicationText =
        PlainComplicationText.Builder(text = text).build()

    private fun openAppIntent(): PendingIntent? {
        val intent = Intent(this, WearMainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(
            this,
            REQUEST_OPEN_APP,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }

    private fun streakDays(): Int =
        WearRuntime.ascend.snapshot(LocalDemoIdentity.ATHLETE_ID)
            .streaks
            .firstOrNull { it.kind == StreakKind.PERFORMANCE }
            ?.days
            ?: 0

    private companion object {
        const val MIN = 0f
        const val MAX = 100f

        /** LOCAL_DEMO, matching WearTileService.readinessLayout() — not a measured value. */
        const val READINESS = 88f
        const val DESCRIPTION = "FitConnect Prime Readiness (LOCAL_DEMO)"
        const val REQUEST_OPEN_APP = 1001
    }
}
