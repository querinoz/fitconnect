package com.fitconnect.android.geo.availability

import com.fitconnect.android.geo.domain.SessionMode
import java.time.Instant
import java.time.ZoneId
import java.util.concurrent.ConcurrentHashMap

data class WorkingHours(
    val dayOfWeek: Int,
    val startHour: Int,
    val endHour: Int,
)

data class AvailabilityProfile(
    val targetId: String,
    val timezone: String,
    val workingHours: List<WorkingHours>,
    val breaks: List<WorkingHours> = emptyList(),
    val vacations: List<LongRange> = emptyList(),
    val blockedDates: Set<String> = emptySet(),
    val recurringRules: List<String> = emptyList(),
    val capacityPrivate: Int = 1,
    val capacityGroup: Int = 8,
)

/**
 * Scheduling engine — working hours, breaks, vacations, recurring availability,
 * blocked dates, time zones, capacity, private/group.
 */
interface AvailabilityEngine {
    fun profile(targetId: String): AvailabilityProfile?
    fun upsert(profile: AvailabilityProfile)
    fun isOpen(targetId: String, startEpochMs: Long, durationMin: Int, mode: SessionMode): Boolean
    fun capacity(targetId: String, mode: SessionMode): Int
}

class DefaultAvailabilityEngine : AvailabilityEngine {
    private val profiles = ConcurrentHashMap<String, AvailabilityProfile>()

    init {
        upsert(
            AvailabilityProfile(
                targetId = "p_coach_maya",
                timezone = "Europe/Lisbon",
                workingHours = listOf(
                    WorkingHours(1, 7, 12),
                    WorkingHours(2, 7, 18),
                    WorkingHours(3, 14, 20),
                    WorkingHours(4, 7, 12),
                    WorkingHours(5, 7, 16),
                ),
                breaks = listOf(WorkingHours(2, 12, 13)),
                recurringRules = listOf("FREQ=WEEKLY;BYDAY=MO,TU,TH"),
                capacityPrivate = 1,
                capacityGroup = 6,
            ),
        )
        upsert(
            AvailabilityProfile(
                targetId = "p_gym_volt",
                timezone = "Europe/Lisbon",
                workingHours = (1..7).map { WorkingHours(it, 6, 23) },
                capacityPrivate = 20,
                capacityGroup = 40,
            ),
        )
    }

    override fun profile(targetId: String): AvailabilityProfile? = profiles[targetId]

    override fun upsert(profile: AvailabilityProfile) {
        profiles[profile.targetId] = profile
    }

    override fun isOpen(targetId: String, startEpochMs: Long, durationMin: Int, mode: SessionMode): Boolean {
        val profile = profiles[targetId] ?: return true
        val zone = ZoneId.of(profile.timezone)
        val zdt = Instant.ofEpochMilli(startEpochMs).atZone(zone)
        val day = zdt.dayOfWeek.value
        val hour = zdt.hour
        val dateKey = zdt.toLocalDate().toString()
        if (dateKey in profile.blockedDates) return false
        if (profile.vacations.any { startEpochMs in it }) return false
        val inHours = profile.workingHours.any { it.dayOfWeek == day && hour in it.startHour until it.endHour }
        if (!inHours) return false
        val inBreak = profile.breaks.any { it.dayOfWeek == day && hour in it.startHour until it.endHour }
        return !inBreak
    }

    override fun capacity(targetId: String, mode: SessionMode): Int {
        val profile = profiles[targetId] ?: return if (mode == SessionMode.PRIVATE) 1 else 8
        return if (mode == SessionMode.PRIVATE) profile.capacityPrivate else profile.capacityGroup
    }
}
