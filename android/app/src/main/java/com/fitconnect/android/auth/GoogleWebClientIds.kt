package com.fitconnect.android.auth

import android.content.Context
import com.fitconnect.android.BuildConfig

object GoogleWebClientIds {
    /**
     * Web client ID required by Credential Manager ([GetGoogleIdOption.setServerClientId]).
     * Never hardcode. Empty until google-services.json / local.properties is supplied.
     */
    fun resolve(context: Context): String {
        val fromBuild = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
        if (fromBuild.isNotEmpty()) return fromBuild
        val resId = context.resources.getIdentifier(
            "default_web_client_id",
            "string",
            context.packageName,
        )
        if (resId != 0) {
            val value = context.getString(resId).trim()
            if (value.isNotEmpty() && !value.startsWith("YOUR_")) return value
        }
        return ""
    }
}
