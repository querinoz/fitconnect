package com.fitconnect.android.auth

import com.fitconnect.android.foundation.auth.AuthErrorMapper
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.FirebaseAuthGateway
import com.fitconnect.android.foundation.auth.IdentitySnapshot
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.google.firebase.auth.EmailAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthException
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await

/**
 * Real Firebase Auth SDK adapter. UI must never import this class.
 */
class AndroidFirebaseAuthGateway(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
) : FirebaseAuthGateway {

    override val isAvailable: Boolean = true

    override suspend fun signInEmail(email: String, password: String): AppResult<IdentitySnapshot> =
        runFirebase { auth.signInWithEmailAndPassword(email, password).await().user }

    override suspend fun signUpEmail(email: String, password: String): AppResult<IdentitySnapshot> =
        runFirebase {
            val user = auth.createUserWithEmailAndPassword(email, password).await().user
            runCatching { user?.sendEmailVerification()?.await() }
            user
        }

    override suspend fun signInGoogle(idToken: String): AppResult<IdentitySnapshot> =
        runFirebase {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            auth.signInWithCredential(credential).await().user
        }

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> =
        runFirebaseUnit { auth.sendPasswordResetEmail(email).await() }

    override suspend fun sendEmailVerification(): AppResult<Unit> =
        runFirebaseUnit {
            val user = auth.currentUser ?: throw MissingUser()
            user.sendEmailVerification().await()
        }

    override suspend fun reload(): AppResult<IdentitySnapshot> =
        runFirebase {
            val user = auth.currentUser ?: throw MissingUser()
            user.reload().await()
            auth.currentUser
        }

    override suspend fun signOut(): AppResult<Unit> {
        auth.signOut()
        return AppResult.Ok(Unit)
    }

    override suspend fun current(): AppResult<IdentitySnapshot?> {
        val user = auth.currentUser ?: return AppResult.Ok(null)
        return snapshot(user)
    }

    override suspend fun getIdToken(forceRefresh: Boolean): AppResult<String> {
        val user = auth.currentUser
            ?: return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        return runCatching {
            val token = user.getIdToken(forceRefresh).await().token
            if (token.isNullOrBlank()) AuthErrorMapper.err(AppError.AuthKind.SESSION_EXPIRED)
            else AppResult.Ok(token)
        }.getOrElse { mapFirebase(it) }
    }

    override suspend fun linkEmail(email: String, password: String): AppResult<IdentitySnapshot> =
        runFirebase {
            val user = auth.currentUser ?: throw MissingUser()
            user.linkWithCredential(EmailAuthProvider.getCredential(email, password)).await().user
        }

    override suspend fun linkGoogle(idToken: String): AppResult<IdentitySnapshot> =
        runFirebase {
            val user = auth.currentUser ?: throw MissingUser()
            user.linkWithCredential(GoogleAuthProvider.getCredential(idToken, null)).await().user
        }

    override suspend fun unlink(provider: AuthProviderKind): AppResult<IdentitySnapshot> =
        runFirebase {
            val user = auth.currentUser ?: throw MissingUser()
            val id = when (provider) {
                AuthProviderKind.EMAIL_PASSWORD -> EmailAuthProvider.PROVIDER_ID
                AuthProviderKind.GOOGLE -> GoogleAuthProvider.PROVIDER_ID
                AuthProviderKind.APPLE -> "apple.com"
                else -> throw IllegalArgumentException("unsupported")
            }
            user.unlink(id).await().user
        }

    private suspend fun runFirebase(block: suspend () -> FirebaseUser?): AppResult<IdentitySnapshot> =
        runCatching {
            val user = block() ?: throw MissingUser()
            snapshot(user)
        }.getOrElse { mapFirebase(it) }

    private suspend fun runFirebaseUnit(block: suspend () -> Unit): AppResult<Unit> =
        runCatching {
            block()
            AppResult.Ok(Unit)
        }.getOrElse { mapFirebase(it) }

    private suspend fun snapshot(user: FirebaseUser): AppResult<IdentitySnapshot> {
        val token = user.getIdToken(false).await().token
            ?: return AuthErrorMapper.err(AppError.AuthKind.SESSION_EXPIRED)
        return AppResult.Ok(
            IdentitySnapshot(
                uid = user.uid,
                email = user.email,
                emailVerified = user.isEmailVerified,
                providers = user.providerData.mapNotNull { info ->
                    when (info.providerId) {
                        EmailAuthProvider.PROVIDER_ID -> AuthProviderKind.EMAIL_PASSWORD
                        GoogleAuthProvider.PROVIDER_ID -> AuthProviderKind.GOOGLE
                        "apple.com" -> AuthProviderKind.APPLE
                        else -> null
                    }
                }.toSet(),
                idToken = token,
                refreshToken = null,
            ),
        )
    }

    private fun mapFirebase(throwable: Throwable): AppResult.Err {
        if (throwable is MissingUser) {
            return AuthErrorMapper.err(AppError.AuthKind.UNAUTHENTICATED)
        }
        val code = (throwable as? FirebaseAuthException)?.errorCode ?: throwable.message
        return AuthErrorMapper.err(AuthErrorMapper.fromCode(code))
    }

    private class MissingUser : Exception()
}
