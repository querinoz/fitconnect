package com.fitconnect.android.auth

import android.app.Activity
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.NoCredentialException
import com.fitconnect.android.foundation.auth.AuthErrorMapper
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.FederatedAuthHost
import com.fitconnect.android.foundation.auth.IdentitySnapshot
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.OAuthProvider
import kotlinx.coroutines.tasks.await

class AndroidFederatedAuthHost(
    private val activity: Activity,
    private val webClientId: () -> String,
) : FederatedAuthHost {
    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }

    override suspend fun googleIdToken(): AppResult<String> {
        val serverClientId = webClientId()
        if (serverClientId.isBlank()) {
            return AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
        }
        val manager = CredentialManager.create(activity)
        return try {
            requestGoogle(manager, serverClientId, filterAuthorized = true)
        } catch (_: NoCredentialException) {
            try {
                requestGoogle(manager, serverClientId, filterAuthorized = false)
            } catch (_: NoCredentialException) {
                AuthErrorMapper.err(AppError.AuthKind.PROVIDER_UNAVAILABLE)
            }
        }
    }

    override suspend fun appleSignIn(): AppResult<IdentitySnapshot> {
        return runCatching {
            val provider = OAuthProvider.newBuilder("apple.com")
                .setScopes(listOf("email", "name"))
                .build()
            val current = auth.currentUser
            val result = if (current != null) {
                current.startActivityForLinkWithProvider(activity, provider).await()
            } else {
                auth.startActivityForSignInWithProvider(activity, provider).await()
            }
            val user = result.user ?: return AuthErrorMapper.err(AppError.AuthKind.UNKNOWN_AUTH_ERROR)
            val token = user.getIdToken(false).await().token
                ?: return AuthErrorMapper.err(AppError.AuthKind.SESSION_EXPIRED)
            AppResult.Ok(
                IdentitySnapshot(
                    uid = user.uid,
                    email = user.email,
                    emailVerified = user.isEmailVerified,
                    providers = user.providerData.mapNotNull { info ->
                        when (info.providerId) {
                            "password" -> AuthProviderKind.EMAIL_PASSWORD
                            "google.com" -> AuthProviderKind.GOOGLE
                            "apple.com" -> AuthProviderKind.APPLE
                            else -> null
                        }
                    }.toSet(),
                    idToken = token,
                    refreshToken = null,
                ),
            )
        }.getOrElse { throwable ->
            val message = throwable.message.orEmpty()
            val code = (throwable as? FirebaseAuthException)?.errorCode ?: message
            when {
                message.contains("cancel", ignoreCase = true) ->
                    AuthErrorMapper.err(AppError.AuthKind.CANCELLED)
                else -> AuthErrorMapper.err(AuthErrorMapper.fromCode(code))
            }
        }
    }

    suspend fun clearCredentialState() {
        runCatching {
            CredentialManager.create(activity).clearCredentialState(ClearCredentialStateRequest())
        }
    }

    private suspend fun requestGoogle(
        manager: CredentialManager,
        serverClientId: String,
        filterAuthorized: Boolean,
    ): AppResult<String> {
        try {
            val option = GetGoogleIdOption.Builder()
                .setServerClientId(serverClientId)
                .setFilterByAuthorizedAccounts(filterAuthorized)
                .build()
            val request = GetCredentialRequest.Builder()
                .addCredentialOption(option)
                .build()
            val credential = manager.getCredential(activity, request).credential
            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val parsed = GoogleIdTokenCredential.createFrom(credential.data)
                val token = parsed.idToken
                return if (token.isBlank()) {
                    AuthErrorMapper.err(AppError.AuthKind.UNKNOWN_AUTH_ERROR)
                } else {
                    AppResult.Ok(token)
                }
            }
            return AuthErrorMapper.err(AppError.AuthKind.UNKNOWN_AUTH_ERROR)
        } catch (cancelled: GetCredentialCancellationException) {
            return AuthErrorMapper.err(AppError.AuthKind.CANCELLED)
        } catch (missing: NoCredentialException) {
            throw missing
        } catch (t: Throwable) {
            return AuthErrorMapper.err(AuthErrorMapper.fromCode(t.message))
        }
    }
}
