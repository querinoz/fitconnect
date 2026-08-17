package com.fitconnect.android.designui.identity

import androidx.compose.runtime.staticCompositionLocalOf
import com.fitconnect.android.foundation.auth.FederatedAuthHost

val LocalFederatedAuthHost = staticCompositionLocalOf<FederatedAuthHost?> { null }
