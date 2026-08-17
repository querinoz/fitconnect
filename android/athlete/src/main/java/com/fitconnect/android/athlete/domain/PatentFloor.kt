package com.fitconnect.android.athlete.domain

import com.fitconnect.android.designui.identity.PatentLogic
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.identity.PatentSignals
import com.fitconnect.android.designui.identity.PatentStatus
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys

suspend fun resolvePatentStatus(
    store: KeyValueStore,
    signals: PatentSignals,
): PatentStatus {
    val earned = PatentLogic.evaluate(signals)
    val floor = PatentLogic.parseFloor(store.get(PreferenceKeys.PATENT_FLOOR))
    val shown = PatentLogic.applyFloor(earned, floor)
    if (shown != null && shown.outranks(floor)) {
        store.set(PreferenceKeys.PATENT_FLOOR, PatentLogic.encodeFloor(shown))
    }
    return PatentLogic.status(shown, signals)
}
