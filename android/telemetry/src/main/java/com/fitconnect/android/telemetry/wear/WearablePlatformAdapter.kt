package com.fitconnect.android.telemetry.wear

enum class WearablePlatformStatus {
    READY,
    BLOCKED_EXTERNAL_DEPENDENCY,
}

/**
 * Manufacturer/OS adapter. Wear OS is implemented. Xiaomi HyperOS is not
 * Wear OS — do not pretend a BLE stub is a product integration.
 */
interface WearablePlatformAdapter {
    val platformId: String
    val status: WearablePlatformStatus
    suspend fun companionState(): WearCompanionState
}

class WearOsPlatformAdapter(
    private val companion: WearableCompanionPort,
) : WearablePlatformAdapter {
    override val platformId: String = "WEAR_OS"
    override val status: WearablePlatformStatus = WearablePlatformStatus.READY
    override suspend fun companionState(): WearCompanionState = companion.state()
}

class XiaomiPlatformAdapter : WearablePlatformAdapter {
    override val platformId: String = "XIAOMI_HYPEROS"
    override val status: WearablePlatformStatus = WearablePlatformStatus.BLOCKED_EXTERNAL_DEPENDENCY
    override suspend fun companionState(): WearCompanionState = WearCompanionState.NOT_PAIRED
}
