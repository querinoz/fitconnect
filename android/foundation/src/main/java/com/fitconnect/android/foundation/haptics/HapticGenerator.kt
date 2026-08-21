package com.fitconnect.android.foundation.haptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.annotation.RequiresApi

enum class HapticPreset {
    SUCCESS,
    ERROR,
    LIGHT_CLICK,
    HEAVY_CLICK,
    PULSE,
    TICK,
}

interface HapticGenerator {
    fun generate(preset: HapticPreset)
}

class AndroidHapticGenerator(private val context: Context) : HapticGenerator {

    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    override fun generate(preset: HapticPreset) {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return

        when (preset) {
            HapticPreset.SUCCESS -> v.vibrate(successEffect())
            HapticPreset.ERROR -> v.vibrate(errorEffect())
            HapticPreset.LIGHT_CLICK -> v.vibrate(clickEffect(light = true))
            HapticPreset.HEAVY_CLICK -> v.vibrate(clickEffect(light = false))
            HapticPreset.PULSE -> v.vibrate(pulseEffect())
            HapticPreset.TICK -> v.vibrate(tickEffect())
        }
    }

    private fun successEffect(): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
        } else {
            VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE)
        }
    }

    private fun errorEffect(): VibrationEffect {
        return VibrationEffect.createWaveform(longArrayOf(0, 50, 100, 50), intArrayOf(0, 255, 0, 255), -1)
    }

    private fun clickEffect(light: Boolean): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            VibrationEffect.createPredefined(if (light) VibrationEffect.EFFECT_TICK else VibrationEffect.EFFECT_CLICK)
        } else {
            VibrationEffect.createOneShot(if (light) 10 else 30, VibrationEffect.DEFAULT_AMPLITUDE)
        }
    }

    private fun pulseEffect(): VibrationEffect {
        return VibrationEffect.createWaveform(longArrayOf(0, 40, 60, 40), intArrayOf(0, 120, 0, 180), -1)
    }

    private fun tickEffect(): VibrationEffect {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
        } else {
            VibrationEffect.createOneShot(10, VibrationEffect.DEFAULT_AMPLITUDE)
        }
    }
}
