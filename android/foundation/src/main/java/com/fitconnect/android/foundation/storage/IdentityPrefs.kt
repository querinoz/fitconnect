package com.fitconnect.android.foundation.storage

suspend fun KeyValueStore.needsIdentityRoleSelection(uid: String, isLocalDemo: Boolean): Boolean {
    if (isLocalDemo || uid.isBlank()) return false
    return get(PreferenceKeys.identityRoleSelected(uid)) == "0"
}
