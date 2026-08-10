package com.fitconnect.android.foundation.lifecycle

import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AppLifecycleState {
    COLD_START,
    FOREGROUND,
    BACKGROUND,
}

/**
 * Process-level lifecycle + reconnect hooks. Feature modules observe
 * [state] / [isOnline] instead of registering their own Process observers.
 */
interface AppLifecycle {
    val state: StateFlow<AppLifecycleState>
    val isOnline: StateFlow<Boolean>
    fun start()
}

class DefaultAppLifecycle(
    private val connectivity: ConnectivityMonitor,
    private val logger: Logger,
    private val onForeground: suspend () -> Unit = {},
    private val onReconnect: suspend () -> Unit = {},
) : AppLifecycle, DefaultLifecycleObserver {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val _state = MutableStateFlow(AppLifecycleState.COLD_START)
    private val _online = MutableStateFlow(true)
    private var started = false

    override val state: StateFlow<AppLifecycleState> = _state.asStateFlow()
    override val isOnline: StateFlow<Boolean> = _online.asStateFlow()

    override fun start() {
        if (started) return
        started = true
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)
        scope.launch {
            connectivity.online.collect { online ->
                val wasOffline = !_online.value
                _online.value = online
                if (online && wasOffline) {
                    logger.i("AppLifecycle", "network reconnect")
                    onReconnect()
                }
            }
        }
    }

    override fun onStart(owner: LifecycleOwner) {
        val fromCold = _state.value == AppLifecycleState.COLD_START
        _state.value = AppLifecycleState.FOREGROUND
        logger.d("AppLifecycle", if (fromCold) "cold start → foreground" else "warm start → foreground")
        scope.launch { onForeground() }
    }

    override fun onStop(owner: LifecycleOwner) {
        _state.value = AppLifecycleState.BACKGROUND
        logger.d("AppLifecycle", "background")
    }
}
