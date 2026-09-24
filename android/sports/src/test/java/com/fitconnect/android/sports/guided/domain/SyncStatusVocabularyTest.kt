package com.fitconnect.android.sports.guided.domain

import org.junit.Assert.assertEquals
import org.junit.Test

class SyncStatusVocabularyTest {
    @Test
    fun mapsUiToLifecycleAndBack() {
        assertEquals(SyncLifecycleStatus.LOCAL_ONLY, SyncStatusVocabulary.fromUi(SyncUiStatus.LOCAL))
        assertEquals(SyncLifecycleStatus.SYNCING, SyncStatusVocabulary.fromUi(SyncUiStatus.SYNCING))
        assertEquals(SyncLifecycleStatus.SYNCED, SyncStatusVocabulary.fromUi(SyncUiStatus.SYNCED))
        assertEquals(
            SyncLifecycleStatus.FAILED_RETRYABLE,
            SyncStatusVocabulary.fromUi(SyncUiStatus.SYNC_ERROR, retryable = true),
        )
        assertEquals(
            SyncLifecycleStatus.FAILED_PERMANENT,
            SyncStatusVocabulary.fromUi(SyncUiStatus.SYNC_ERROR, retryable = false),
        )

        assertEquals(SyncUiStatus.LOCAL, SyncStatusVocabulary.toUi(SyncLifecycleStatus.QUEUED))
        assertEquals(SyncUiStatus.SYNC_ERROR, SyncStatusVocabulary.toUi(SyncLifecycleStatus.CONFLICT))
    }
}
