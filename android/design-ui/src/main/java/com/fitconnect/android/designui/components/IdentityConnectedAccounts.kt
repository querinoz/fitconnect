package com.fitconnect.android.designui.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.fitconnect.android.designui.identity.LocalFederatedAuthHost
import com.fitconnect.android.foundation.auth.AuthCredentials
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.AuthRepository
import com.fitconnect.android.foundation.auth.LinkedProviders
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun IdentityConnectedAccounts(
    authRepository: AuthRepository,
    modifier: Modifier = Modifier,
) {
    val host = LocalFederatedAuthHost.current
    val scope = rememberCoroutineScope()
    var linked by remember { mutableStateOf(LinkedProviders()) }
    var busy by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        linked = (authRepository.linkedProviders() as? AppResult.Ok)?.value ?: LinkedProviders()
    }

    fun refresh() {
        scope.launch {
            linked = (authRepository.linkedProviders() as? AppResult.Ok)?.value ?: linked
            busy = false
        }
    }

    EliteConnectedAccounts(
        emailConnected = linked.email,
        googleConnected = linked.google,
        appleConnected = linked.apple,
        busy = busy,
        modifier = modifier,
        onLinkEmail = {
            /* Email linking requires the email form — surface stays honest. */
        },
        onLinkGoogle = {
            val federated = host ?: return@EliteConnectedAccounts
            busy = true
            scope.launch {
                authRepository.linkProvider(
                    AuthProviderKind.GOOGLE,
                    AuthCredentials(federated = federated),
                )
                refresh()
            }
        },
        onLinkApple = {
            val federated = host ?: return@EliteConnectedAccounts
            busy = true
            scope.launch {
                authRepository.linkProvider(
                    AuthProviderKind.APPLE,
                    AuthCredentials(federated = federated),
                )
                refresh()
            }
        },
        onUnlinkGoogle = {
            busy = true
            scope.launch {
                authRepository.unlinkProvider(AuthProviderKind.GOOGLE)
                refresh()
            }
        },
        onUnlinkApple = {
            busy = true
            scope.launch {
                authRepository.unlinkProvider(AuthProviderKind.APPLE)
                refresh()
            }
        },
    )
}
