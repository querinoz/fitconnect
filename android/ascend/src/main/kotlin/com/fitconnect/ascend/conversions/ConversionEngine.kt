package com.fitconnect.ascend.conversions

import com.fitconnect.ascend.domain.EnergyDeployment
import com.fitconnect.ascend.domain.MapSegment
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.RealWorldConversion
import kotlin.math.roundToInt

object ConversionEngine {
    fun energy(kcal: Int): EnergyDeployment? {
        if (kcal <= 0) return null
        val thighs = kcal / 270.0
        return EnergyDeployment(
            kcal = kcal,
            labelKey = "energy.deployed",
            equivalentKey = "energy.chicken_thighs",
            equivalentAmount = (thighs * 10.0).roundToInt() / 10.0,
            disclaimerKey = "energy.disclaimer",
        )
    }

    fun conversions(distanceM: Double, elevationM: Double, durationMs: Long, demo: Boolean): List<RealWorldConversion> {
        val list = mutableListOf<RealWorldConversion>()
        val km = distanceM / 1000.0
        if (km >= 8.5 && km <= 10.5) {
            list += RealWorldConversion("distance", "convert.porto_matosinhos", "convert.porto_matosinhos.d", demo)
        } else if (km > 0) {
            list += RealWorldConversion("distance", "convert.distance_km", "convert.distance_km.d", demo)
        }
        if (elevationM > 0) {
            list += RealWorldConversion("elevation", "convert.floors", "convert.floors.d", demo)
        }
        if (durationMs > 0) {
            list += RealWorldConversion("time", "convert.time", "convert.time.d", demo)
        }
        return list
    }

    fun floors(elevationM: Double): Int = (elevationM / 3.0).roundToInt()

    fun demoSegment(elevationM: Double, distanceM: Double): MapSegment? {
        if (distanceM < 400 || elevationM < 8) return null
        return MapSegment(
            id = "seg-ribeira",
            nameKey = "segment.ribeira",
            distanceKm = 0.8,
            elevationM = 62.0,
            bestTimeMs = null,
            demoLabeled = true,
        )
    }

    fun lastWorkoutFacts(events: List<PerformanceEvent>): Triple<Double, Double, Long> {
        val last = events.lastOrNull() ?: return Triple(0.0, 0.0, 0L)
        val p = last.payload
        return Triple(p.distanceM, p.elevationGainM, p.durationMs)
    }
}
