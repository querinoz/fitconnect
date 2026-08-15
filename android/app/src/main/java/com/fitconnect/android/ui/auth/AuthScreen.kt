package com.fitconnect.android.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import com.fitconnect.android.R
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.analytics.Analytics
import com.fitconnect.android.foundation.auth.AuthCredentials
import com.fitconnect.android.foundation.auth.AuthProviderKind
import com.fitconnect.android.foundation.auth.AuthRepository
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.error.ErrorDomain
import com.fitconnect.android.foundation.error.ErrorPipeline
import com.fitconnect.android.foundation.theme.ThemeMode
import com.fitconnect.android.ui.theme.LocalAppContainer
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    config: AppConfig,
    authRepository: AuthRepository,
    analytics: Analytics,
    errorPipeline: ErrorPipeline,
    onSignedIn: () -> Unit,
    onError: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val appContainer = LocalAppContainer.current
    val themeMode by appContainer.themeSettings.observe().collectAsState(initial = ThemeMode.SYSTEM)
    val usesLiveAuth = config.usesLiveAuth
    val isDebuggable = config.isDebuggable
    var mode by remember { mutableStateOf(AuthMode.SignIn) }
    var status by remember { mutableStateOf<String?>(null) }

    fun handleResult(result: AppResult<com.fitconnect.android.foundation.auth.AuthUser>) {
        when (result) {
            is AppResult.Ok -> {
                analytics.identify(result.value.id)
                onSignedIn()
            }
            is AppResult.Err -> {
                errorPipeline.report(ErrorDomain.AUTH, result.error)
                onError()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .statusBarsPadding()
            .padding(EliteSpace.Xl)
            .testTag("screen_auth"),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.nav_auth_title),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            text = "Elite OS · local access",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(EliteSpace.Sm))
        EliteCard {
            EliteAppearancePicker(
                mode = themeMode,
                onModeChange = { next ->
                    scope.launch { appContainer.themeSettings.setMode(next) }
                },
            )
        }
        Spacer(modifier = Modifier.height(EliteSpace.Lg))

        when {
            usesLiveAuth -> {
                when (mode) {
                    AuthMode.SignIn -> LiveAuthForm(
                        body = stringResource(R.string.nav_auth_live_body),
                        submitLabel = stringResource(R.string.auth_submit),
                        onSubmit = { email, password ->
                            scope.launch {
                                handleResult(
                                    authRepository.signIn(
                                        AuthProviderKind.EMAIL_PASSWORD,
                                        AuthCredentials(email = email, password = password),
                                    ),
                                )
                            }
                        },
                    )
                    AuthMode.SignUp -> LiveAuthForm(
                        body = stringResource(R.string.auth_signup_body),
                        submitLabel = stringResource(R.string.auth_signup_submit),
                        onSubmit = { email, password ->
                            scope.launch { handleResult(authRepository.signUp(email, password)) }
                        },
                    )
                    AuthMode.Forgot -> ForgotForm { email ->
                        scope.launch {
                            when (val r = authRepository.sendMagicLink(email)) {
                                is AppResult.Ok -> status = "Reset link queued (check email)"
                                is AppResult.Err -> {
                                    errorPipeline.report(ErrorDomain.AUTH, r.error)
                                    status = "Could not queue reset"
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(EliteSpace.Md))
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(
                        label = stringResource(R.string.auth_signup_link),
                        variant = EliteButtonVariant.Ghost,
                        onClick = { mode = AuthMode.SignUp },
                    )
                    EliteButton(
                        label = stringResource(R.string.auth_forgot_link),
                        variant = EliteButtonVariant.Ghost,
                        onClick = { mode = AuthMode.Forgot },
                    )
                    if (mode != AuthMode.SignIn) {
                        EliteButton(
                            label = stringResource(R.string.auth_submit),
                            variant = EliteButtonVariant.Ghost,
                            onClick = { mode = AuthMode.SignIn },
                        )
                    }
                }
            }
            isDebuggable -> {
                EliteBadge(text = DemoPersona.MODE_LABEL)
                Spacer(modifier = Modifier.height(EliteSpace.Md))
                Text(
                    text = stringResource(R.string.nav_auth_body),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(modifier = Modifier.height(EliteSpace.Xl))
                DemoPersonaButton(
                    persona = DemoPersona.INES,
                    testTag = "screen_auth_primary",
                    variant = EliteButtonVariant.Primary,
                    onClick = {
                        scope.launch {
                            handleResult(
                                authRepository.signIn(
                                    AuthProviderKind.EMAIL_PASSWORD,
                                    AuthCredentials(
                                        email = DemoPersona.INES.email,
                                        password = DemoPersona.DEMO_PASSWORD,
                                    ),
                                ),
                            )
                        }
                    },
                )
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                DemoPersonaButton(
                    persona = DemoPersona.MARINA,
                    testTag = "screen_auth_marina",
                    variant = EliteButtonVariant.Secondary,
                    onClick = {
                        scope.launch {
                            handleResult(
                                authRepository.signIn(
                                    AuthProviderKind.EMAIL_PASSWORD,
                                    AuthCredentials(
                                        email = DemoPersona.MARINA.email,
                                        password = DemoPersona.DEMO_PASSWORD,
                                    ),
                                ),
                            )
                        }
                    },
                )
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                DemoPersonaButton(
                    persona = DemoPersona.TOMAS,
                    testTag = "screen_auth_secondary",
                    variant = EliteButtonVariant.Secondary,
                    onClick = {
                        scope.launch {
                            handleResult(
                                authRepository.signIn(
                                    AuthProviderKind.EMAIL_PASSWORD,
                                    AuthCredentials(
                                        email = DemoPersona.TOMAS.email,
                                        password = DemoPersona.DEMO_PASSWORD,
                                    ),
                                ),
                            )
                        }
                    },
                )
                Spacer(modifier = Modifier.height(EliteSpace.Lg))
                when (mode) {
                    AuthMode.SignUp -> LiveAuthForm(
                        body = stringResource(R.string.auth_signup_body),
                        submitLabel = stringResource(R.string.auth_signup_submit),
                        onSubmit = { email, password ->
                            scope.launch { handleResult(authRepository.signUp(email, password)) }
                        },
                    )
                    AuthMode.Forgot -> ForgotForm { email ->
                        scope.launch {
                            authRepository.sendMagicLink(email)
                            status = "LOCAL_DEMO · magic link simulated"
                        }
                    }
                    else -> Unit
                }
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(
                        label = stringResource(R.string.auth_signup_link),
                        variant = EliteButtonVariant.Ghost,
                        onClick = { mode = AuthMode.SignUp },
                    )
                    EliteButton(
                        label = stringResource(R.string.auth_forgot_link),
                        variant = EliteButtonVariant.Ghost,
                        onClick = { mode = AuthMode.Forgot },
                    )
                }
            }
            else -> {
                Text(
                    text = stringResource(R.string.nav_auth_unconfigured_body),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error,
                )
            }
        }
        status?.let {
            Spacer(modifier = Modifier.height(EliteSpace.Md))
            Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

private enum class AuthMode { SignIn, SignUp, Forgot }

@Composable
private fun DemoPersonaButton(
    persona: DemoPersona,
    testTag: String,
    variant: EliteButtonVariant,
    onClick: () -> Unit,
) {
    EliteButton(
        label = "${persona.displayName} · ${persona.tagline}",
        onClick = onClick,
        variant = variant,
        modifier = Modifier
            .fillMaxWidth()
            .testTag(testTag),
    )
}

@Composable
private fun LiveAuthForm(
    body: String,
    submitLabel: String,
    onSubmit: (email: String, password: String) -> Unit,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Text(
        text = body,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Spacer(modifier = Modifier.height(EliteSpace.Xl))
    EliteTextField(
        value = email,
        onValueChange = { email = it },
        label = stringResource(R.string.auth_email_label),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
        modifier = Modifier.testTag("auth_email"),
    )
    Spacer(modifier = Modifier.height(EliteSpace.Md))
    EliteTextField(
        value = password,
        onValueChange = { password = it },
        label = stringResource(R.string.auth_password_label),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
        visualTransformation = PasswordVisualTransformation(),
        modifier = Modifier.testTag("auth_password"),
    )
    Spacer(modifier = Modifier.height(EliteSpace.Xl))
    EliteButton(
        label = submitLabel,
        onClick = { onSubmit(email.trim(), password) },
        enabled = email.isNotBlank() && password.length >= 8,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("auth_submit"),
    )
}

@Composable
private fun ForgotForm(onSubmit: (email: String) -> Unit) {
    var email by remember { mutableStateOf("") }
    Text(
        text = stringResource(R.string.auth_forgot_body),
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Spacer(modifier = Modifier.height(EliteSpace.Md))
    EliteTextField(
        value = email,
        onValueChange = { email = it },
        label = stringResource(R.string.auth_email_label),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
    )
    Spacer(modifier = Modifier.height(EliteSpace.Md))
    EliteButton(
        label = stringResource(R.string.auth_forgot_submit),
        onClick = { onSubmit(email.trim()) },
        enabled = email.isNotBlank(),
        modifier = Modifier.fillMaxWidth(),
    )
}
