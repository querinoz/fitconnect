package com.fitconnect.android.sports.guided.domain

/**
 * Canonical sync vocabulary for Zenith offline engine docs/APIs.
 * Maps existing [SyncUiStatus] without breaking Room snapshots / UI chips.
 */
enum class SyncLifecycleStatus {
    LOCAL_ONLY,
    QUEUED,
    SYNCING,
    SYNCED,
    FAILED_RETRYABLE,
    FAILED_PERMANENT,
    CONFLICT,
}

object SyncStatusVocabulary {
    fun fromUi(status: SyncUiStatus, retryable: Boolean = true): SyncLifecycleStatus =
        when (status) {
            SyncUiStatus.LOCAL -> SyncLifecycleStatus.LOCAL_ONLY
            SyncUiStatus.SYNCING -> SyncLifecycleStatus.SYNCING
            SyncUiStatus.SYNCED -> SyncLifecycleStatus.SYNCED
            SyncUiStatus.SYNC_ERROR ->
                if (retryable) SyncLifecycleStatus.FAILED_RETRYABLE
                else SyncLifecycleStatus.FAILED_PERMANENT
        }

    fun toUi(status: SyncLifecycleStatus): SyncUiStatus =
        when (status) {
            SyncLifecycleStatus.LOCAL_ONLY, SyncLifecycleStatus.QUEUED -> SyncUiStatus.LOCAL
            SyncLifecycleStatus.SYNCING -> SyncUiStatus.SYNCING
            SyncLifecycleStatus.SYNCED -> SyncUiStatus.SYNCED
            SyncLifecycleStatus.FAILED_RETRYABLE,
            SyncLifecycleStatus.FAILED_PERMANENT,
            SyncLifecycleStatus.CONFLICT -> SyncUiStatus.SYNC_ERROR
        }

    /** Athlete-facing chip / status line — never invent success. */
    fun label(status: SyncLifecycleStatus): String =
        when (status) {
            SyncLifecycleStatus.LOCAL_ONLY -> "On device"
            SyncLifecycleStatus.QUEUED -> "Queued"
            SyncLifecycleStatus.SYNCING -> "Syncing"
            SyncLifecycleStatus.SYNCED -> "Synced"
            SyncLifecycleStatus.FAILED_RETRYABLE -> "Retry sync"
            SyncLifecycleStatus.FAILED_PERMANENT -> "Sync failed"
            SyncLifecycleStatus.CONFLICT -> "Conflict — review"
        }

    fun labelFromUi(status: SyncUiStatus, retryable: Boolean = true): String =
        label(fromUi(status, retryable))
}
