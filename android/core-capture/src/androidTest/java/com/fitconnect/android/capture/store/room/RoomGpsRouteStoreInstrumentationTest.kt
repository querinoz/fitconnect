package com.fitconnect.android.capture.store.room

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.fitconnect.android.capture.store.RoomGpsRouteStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class RoomGpsRouteStoreInstrumentationTest {
    @Test
    fun roomPersistsAcceptedPointsAndActiveSession() = runBlocking {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val db = Room.inMemoryDatabaseBuilder(context, CaptureRoomDatabase::class.java).build()
        val store = RoomGpsRouteStore(db)
        val activityId = "gps-inst-1"
        store.upsertSession(
            GpsSessionEntity(
                activityId = activityId,
                userId = "u1",
                sport = "Run",
                phase = "PREPARING",
                startedAtUtcMs = 1_000L,
                updatedAtUtcMs = 1_000L,
                distanceM = 0.0,
                movingMs = 0L,
                elapsedMs = 0L,
                idempotencyKey = "activity:u1:$activityId",
                syncStatus = "LOCAL",
            ),
        )
        store.appendPoint(
            LocationPointEntity(
                pointId = "$activityId:1",
                activityId = activityId,
                userId = "u1",
                latitude = 38.7223,
                longitude = -9.1393,
                accuracyMeters = 6.0,
                speedMps = 2.5,
                altitudeMeters = 80.0,
                capturedAtUtcMs = 2_000L,
                sequenceNumber = 1,
                verdict = "ACCEPT",
                feedStatus = "EMULATOR_INJECTED",
            ),
        )
        store.appendPoint(
            LocationPointEntity(
                pointId = "$activityId:2",
                activityId = activityId,
                userId = "u1",
                latitude = 38.7268,
                longitude = -9.1393,
                accuracyMeters = 7.0,
                speedMps = 2.8,
                altitudeMeters = 86.0,
                capturedAtUtcMs = 62_000L,
                sequenceNumber = 2,
                verdict = "ACCEPT",
                feedStatus = "EMULATOR_INJECTED",
            ),
        )
        assertEquals(2, store.pointCount(activityId))
        assertEquals(2, store.acceptedRoutePoints(activityId).size)
        assertNotNull(store.activeSession("u1"))
        db.close()
    }
}

private object Room {
    fun inMemoryDatabaseBuilder(
        context: android.content.Context,
        klass: Class<CaptureRoomDatabase>,
    ) = androidx.room.Room.inMemoryDatabaseBuilder(context, klass)
}
