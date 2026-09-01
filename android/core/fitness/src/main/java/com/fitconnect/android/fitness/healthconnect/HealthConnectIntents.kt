package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import com.fitconnect.android.fitness.domain.HealthConnectSdkState

/**
 * Deep links aligned with the Android Health & Fitness dev center:
 * install / update Health Connect and open permission management.
 */
object HealthConnectIntents {
    private const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"
    private const val PLAY_STORE_URI = "market://details?id=$HEALTH_CONNECT_PACKAGE"

    fun openInstallOrUpdate(context: Context, state: HealthConnectSdkState) {
        when (state) {
            HealthConnectSdkState.NEEDS_UPDATE,
            HealthConnectSdkState.UNAVAILABLE,
            -> openPlayStore(context)
            HealthConnectSdkState.AVAILABLE -> openManageData(context)
        }
    }

    fun openManageData(context: Context) {
        if (HealthConnectSdkMapper.probe(context) != HealthConnectSdkState.AVAILABLE) {
            openPlayStore(context)
            return
        }
        val intent = HealthConnectClient.getHealthConnectManageDataIntent(context, context.packageName)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    fun openPlayStore(context: Context) {
        val market = Intent(Intent.ACTION_VIEW, Uri.parse(PLAY_STORE_URI)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        runCatching { context.startActivity(market) }.getOrElse {
            val web = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$HEALTH_CONNECT_PACKAGE"),
            ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
            context.startActivity(web)
        }
    }
}
