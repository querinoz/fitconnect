package com.fitconnect.android.foundation.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

interface ConnectivityMonitor {
    val online: StateFlow<Boolean>
    fun start()
}

class AndroidConnectivityMonitor(
    context: Context,
) : ConnectivityMonitor {
    private val appContext = context.applicationContext
    private val _online = MutableStateFlow(true)
    override val online: StateFlow<Boolean> = _online.asStateFlow()
    private var registered = false

    override fun start() {
        if (registered) return
        registered = true
        val cm = appContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        _online.value = cm.activeNetwork?.let { network ->
            cm.getNetworkCapabilities(network)
                ?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
        } ?: false
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        cm.registerNetworkCallback(
            request,
            object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    _online.value = true
                }

                override fun onLost(network: Network) {
                    _online.value = false
                }
            },
        )
    }
}
