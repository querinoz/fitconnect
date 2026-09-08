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

/**
 * Publishes one FitConnect signal straight onto the user's watch face.
 *
 * Honesty rules:
 *  - readiness comes from [WearRuntime.resolveReadiness] — default Unavailable,
 *    never a silent LOCAL_DEMO 88;
 *  - when a session is running the complication switches to session state;
 *  - when ownership is blocked we surface the block code instead of a plausible value.
 */
class WearComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val preview = ReadinessSource.Unavailable.toPresentation()
        return when (type) {
            ComplicationType.SHORT_TEXT -> shortText(
                value = preview.value,
                label = preview.shortLabel,
                description = preview.contentDescription,
                tap = null,
            )
            ComplicationType.RANGED_VALUE -> ranged(
                value = 0f,
                label = preview.value,
                description = preview.contentDescription,
                tap = null,
            )
            else -> null
        }
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val tap = openAppIntent()
        val phase = WearRuntime.engine?.state?.value?.phase
        val blocked = WearRuntime.lastBlockCode
        val presentation = WearRuntime.resolveReadiness().toPresentation()

        return when (request.complicationType) {
            ComplicationType.SHORT_TEXT -> when {
                blocked != null -> shortText(
                    value = blocked,
                    label = "BLOCK",
                    description = "FitConnect ownership blocked",
                    tap = tap,
                )
                phase == LiveActivityPhase.RUNNING -> shortText(
                    value = "LIVE",
                    label = "SESSION",
                    description = "FitConnect session active",
                    tap = tap,
                )
                phase == LiveActivityPhase.PAUSED -> shortText(
                    value = "HOLD",
                    label = "SESSION",
                    description = "FitConnect session paused",
                    tap = tap,
                )
                else -> shortText(
                    value = presentation.value,
                    label = presentation.shortLabel,
                    description = presentation.contentDescription,
                    tap = tap,
                )
            }

            ComplicationType.RANGED_VALUE -> when {
                phase == LiveActivityPhase.RUNNING || phase == LiveActivityPhase.PAUSED ->
                    ranged(
                        value = presentation.rangedValue ?: 0f,
                        label = "LIVE",
                        description = "FitConnect session active",
                        tap = tap,
                    )
                else -> ranged(
                    value = presentation.rangedValue ?: 0f,
                    label = presentation.value,
                    description = presentation.contentDescription,
                    tap = tap,
                )
            }

            else -> null
        }
    }

    private fun shortText(
        value: String,
        label: String,
        description: String,
        tap: PendingIntent?,
    ) = ShortTextComplicationData.Builder(
        text = plain(value),
        contentDescription = plain(description),
    )
        .setTitle(plain(label))
        .apply { tap?.let { setTapAction(it) } }
        .build()

    private fun ranged(
        value: Float,
        label: String,
        description: String,
        tap: PendingIntent?,
    ) = RangedValueComplicationData.Builder(
        value = value.coerceIn(MIN, MAX),
        min = MIN,
        max = MAX,
        contentDescription = plain(description),
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

    private companion object {
        const val MIN = 0f
        const val MAX = 100f
        const val REQUEST_OPEN_APP = 1001
    }
}
