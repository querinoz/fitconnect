package com.fitconnect.android.foundation.storage

/**
 * Legacy role-gate flag. Unified identity never requires Athlete/Coach selection at login.
 * Mode switching lives on Profile after entitlements resolve.
 */
suspend fun KeyValueStore.needsIdentityRoleSelection(uid: String, isLocalDemo: Boolean): Boolean {
    // Always false — do not resurrect RoleSelectScreen.
    return false
}
