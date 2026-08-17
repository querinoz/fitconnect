package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.common.AppError

object AuthValidators {
    private val emailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

    fun email(raw: String?): AppError.AuthKind? {
        val value = raw?.trim().orEmpty()
        if (value.isEmpty()) return AppError.AuthKind.INVALID_EMAIL
        if (!emailRegex.matches(value)) return AppError.AuthKind.INVALID_EMAIL
        return null
    }

    fun password(raw: String?): AppError.AuthKind? {
        if (raw.isNullOrEmpty()) return AppError.AuthKind.WEAK_PASSWORD
        if (raw.length < 8) return AppError.AuthKind.WEAK_PASSWORD
        return null
    }

    fun passwordsMatch(password: String?, confirm: String?): AppError.AuthKind? {
        if (confirm != null && password != confirm) return AppError.AuthKind.PASSWORD_MISMATCH
        return null
    }
}
