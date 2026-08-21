package com.fitconnect.android.ui.auth

import androidx.activity.ComponentActivity
import androidx.compose.foundation.Image
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.lifecycle.viewmodel.compose.viewModel
import com.fitconnect.android.R
import com.fitconnect.android.auth.AndroidFederatedAuthHost
import com.fitconnect.android.auth.GoogleWebClientIds
import com.fitconnect.android.foundation.auth.FederatedAuthHost
import com.fitconnect.android.foundation.auth.UnavailableFederatedAuthHost
import com.fitconnect.android.designui.components.EliteAppearancePicker
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.config.AppConfig
import com.fitconnect.android.foundation.theme.AccentPreset
import com.fitconnect.android.foundation.theme.ThemeMode
import com.fitconnect.android.ui.theme.LocalAppContainer
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    config: AppConfig,
    onSignedIn: () -> Unit,
) {
    val container = LocalAppContainer.current
    val activity = LocalContext.current as ComponentActivity
    val host = remember(activity, config.firebaseAuthConfigured) {
        if (config.firebaseAuthConfigured) {
            AndroidFederatedAuthHost(activity) { GoogleWebClientIds.resolve(activity) }
        } else {
            UnavailableFederatedAuthHost
        }
    }
    val viewModel: AuthViewModel = viewModel(factory = AuthViewModel.factory(container))
    val state by viewModel.state.collectAsState()
    val themeMode by container.themeSettings.observe().collectAsState(initial = ThemeMode.DARK)
    val accent by container.themeSettings.observeAccent().collectAsState(initial = AccentPreset.VOLTLINE)
    val scope = rememberCoroutineScope()
    val reduceMotion = reduceMotionEnabled()
    var introStep by remember { mutableIntStateOf(if (reduceMotion) 3 else 0) }
    val busy = state.phase == AuthPhase.AUTHENTICATING ||
        state.phase == AuthPhase.VERIFYING ||
        state.phase == AuthPhase.SYNCHRONIZING

    LaunchedEffect(reduceMotion) {
        if (reduceMotion) {
            introStep = 3
            return@LaunchedEffect
        }
        introStep = 0
        delay(280)
        introStep = 1
        delay(280)
        introStep = 2
        delay(280)
        introStep = 3
    }

    LaunchedEffect(state.phase) {
        if (state.phase == AuthPhase.SUCCESS) onSignedIn()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .statusBarsPadding()
            .padding(EliteSpace.Xl)
            .testTag("screen_auth")
            .semantics { contentDescription = "Identity verification" },
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Image(
            painter = painterResource(R.drawable.ic_fitconnect_brand),
            contentDescription = stringResource(R.string.app_name),
            modifier = Modifier
                .height(EliteSpace.Huge)
                .testTag("auth_brand_mark"),
        )
        Spacer(modifier = Modifier.height(EliteSpace.Md))
        EliteSysLabel(stringResource(R.string.auth_sys_identity))
        Spacer(modifier = Modifier.height(EliteSpace.Sm))
        Text(
            text = stringResource(R.string.app_name),
            style = MaterialTheme.typography.displayMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            text = stringResource(R.string.splash_tagline),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (introStep >= 1) {
            Text(
                text = stringResource(R.string.auth_sys_init),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        if (introStep >= 2) {
            EliteSysLabel(stringResource(R.string.auth_sys_core))
        }
        Spacer(modifier = Modifier.height(EliteSpace.Sm))
        Text(
            text = stringResource(R.string.auth_identity_verification),
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(EliteSpace.Lg))

        if (busy) {
            EliteSysLabel(stringResource(AuthMessages.phaseLabel(state.phase)))
            Spacer(modifier = Modifier.height(EliteSpace.Md))
        }

        state.errorKind?.let { kind ->
            Text(
                text = stringResource(AuthMessages.title(kind)),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.testTag("auth_error"),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Sm))
            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteButton(
                    label = stringResource(R.string.auth_retry),
                    variant = EliteButtonVariant.Secondary,
                    onClick = { viewModel.clearError() },
                    modifier = Modifier.testTag("auth_retry"),
                )
                EliteButton(
                    label = stringResource(R.string.nav_back),
                    variant = EliteButtonVariant.Ghost,
                    onClick = { viewModel.setMode(AuthFormMode.PROVIDERS) },
                )
                EliteButton(
                    label = stringResource(R.string.auth_help),
                    variant = EliteButtonVariant.Ghost,
                    onClick = { },
                )
            }
            Spacer(modifier = Modifier.height(EliteSpace.Md))
        }

        if (introStep >= 3) {
            EliteCard(variant = EliteCardVariant.Glass) {
                IdentityBody(
                    config = config,
                    state = state,
                    busy = busy,
                    viewModel = viewModel,
                    host = host,
                )
            }
            Spacer(modifier = Modifier.height(EliteSpace.Xl))
            EliteCard(variant = EliteCardVariant.Glass) {
                EliteAppearancePicker(
                    mode = themeMode,
                    onModeChange = { next ->
                        scope.launch { container.themeSettings.setMode(next) }
                    },
                    accent = accent,
                    onAccentChange = { next ->
                        scope.launch { container.themeSettings.setAccent(next) }
                    },
                )
            }
        }
    }
}

@Composable
private fun IdentityBody(
    config: AppConfig,
    state: AuthUiState,
    busy: Boolean,
    viewModel: AuthViewModel,
    host: FederatedAuthHost,
) {
    val showIdentityCore = config.usesIdentityCore
    val showDemo = config.allowLocalAuth && config.isDebuggable
    val failClosed = !showIdentityCore && !showDemo

    if (failClosed) {
        Text(
            text = stringResource(R.string.nav_auth_unconfigured_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.error,
        )
        return
    }

    when (state.mode) {
        AuthFormMode.PROVIDERS -> {
            EliteSysLabel(stringResource(R.string.auth_sys_secure))
            Spacer(modifier = Modifier.height(EliteSpace.Md))
            EliteButton(
                label = stringResource(R.string.auth_continue_google),
                onClick = { viewModel.continueWithGoogle(host) },
                loading = busy,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("auth_google"),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Sm))
            EliteButton(
                label = stringResource(R.string.auth_continue_apple),
                variant = EliteButtonVariant.Secondary,
                onClick = { viewModel.continueWithApple(host) },
                loading = busy,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("auth_apple"),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Sm))
            EliteButton(
                label = stringResource(R.string.auth_continue_email),
                variant = EliteButtonVariant.Ghost,
                onClick = { viewModel.setMode(AuthFormMode.EMAIL_SIGN_IN) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("auth_continue_email"),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Lg))
            if (showDemo) {
                EliteBadge(text = DemoPersona.MODE_LABEL)
                Spacer(modifier = Modifier.height(EliteSpace.Md))
                Text(
                    text = stringResource(R.string.nav_auth_body),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(modifier = Modifier.height(EliteSpace.Md))
                DemoPersonaButton(
                    persona = DemoPersona.INES,
                    testTag = "screen_auth_primary",
                    variant = EliteButtonVariant.Primary,
                    enabled = !busy,
                    onClick = { viewModel.demoPersona(DemoPersona.INES) },
                )
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                DemoPersonaButton(
                    persona = DemoPersona.MARINA,
                    testTag = "screen_auth_marina",
                    variant = EliteButtonVariant.Secondary,
                    enabled = !busy,
                    onClick = { viewModel.demoPersona(DemoPersona.MARINA) },
                )
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                DemoPersonaButton(
                    persona = DemoPersona.TOMAS,
                    testTag = "screen_auth_secondary",
                    variant = EliteButtonVariant.Secondary,
                    enabled = !busy,
                    onClick = { viewModel.demoPersona(DemoPersona.TOMAS) },
                )
            }
        }
        AuthFormMode.EMAIL_SIGN_IN -> EmailForm(
            body = stringResource(R.string.nav_auth_live_body),
            submitLabel = stringResource(R.string.auth_submit),
            confirm = false,
            busy = busy,
            onSubmit = { email, password, _ -> viewModel.signInEmail(email, password) },
        )
        AuthFormMode.EMAIL_REGISTER -> EmailForm(
            body = stringResource(R.string.auth_signup_body),
            submitLabel = stringResource(R.string.auth_signup_submit),
            confirm = true,
            busy = busy,
            onSubmit = { email, password, confirmPw -> viewModel.register(email, password, confirmPw) },
        )
        AuthFormMode.FORGOT -> ForgotForm(busy = busy) { email ->
            viewModel.sendPasswordReset(email)
        }
        AuthFormMode.VERIFY_EMAIL -> {
            Text(
                text = stringResource(R.string.auth_verify_body, state.pendingEmail.orEmpty()),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.height(EliteSpace.Md))
            EliteButton(
                label = stringResource(R.string.auth_verify_refresh),
                onClick = { viewModel.refreshVerification() },
                loading = busy,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Sm))
            EliteButton(
                label = stringResource(R.string.auth_verify_resend),
                variant = EliteButtonVariant.Secondary,
                onClick = { viewModel.resendVerification() },
                loading = busy,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }

    if (state.mode != AuthFormMode.PROVIDERS) {
        Spacer(modifier = Modifier.height(EliteSpace.Md))
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
            if (state.mode != AuthFormMode.EMAIL_REGISTER) {
                EliteButton(
                    label = stringResource(R.string.auth_signup_link),
                    variant = EliteButtonVariant.Ghost,
                    onClick = { viewModel.setMode(AuthFormMode.EMAIL_REGISTER) },
                )
            }
            if (state.mode != AuthFormMode.FORGOT) {
                EliteButton(
                    label = stringResource(R.string.auth_forgot_link),
                    variant = EliteButtonVariant.Ghost,
                    onClick = { viewModel.setMode(AuthFormMode.FORGOT) },
                )
            }
            EliteButton(
                label = stringResource(R.string.nav_back),
                variant = EliteButtonVariant.Ghost,
                onClick = { viewModel.setMode(AuthFormMode.PROVIDERS) },
            )
        }
    }

    when (state.status) {
        "RESET_QUEUED" -> {
            Spacer(modifier = Modifier.height(EliteSpace.Md))
            Text(
                stringResource(R.string.auth_reset_queued),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        "VERIFY_SENT" -> {
            Spacer(modifier = Modifier.height(EliteSpace.Md))
            Text(
                stringResource(R.string.auth_verify_sent),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

@Composable
private fun DemoPersonaButton(
    persona: DemoPersona,
    testTag: String,
    variant: EliteButtonVariant,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    EliteButton(
        label = "${persona.displayName} · ${persona.tagline}",
        onClick = onClick,
        variant = variant,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .testTag(testTag),
    )
}

@Composable
private fun EmailForm(
    body: String,
    submitLabel: String,
    confirm: Boolean,
    busy: Boolean,
    onSubmit: (email: String, password: String, confirm: String) -> Unit,
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

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
    if (confirm) {
        Spacer(modifier = Modifier.height(EliteSpace.Md))
        EliteTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = stringResource(R.string.auth_confirm_password_label),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.testTag("auth_confirm_password"),
        )
    }
    Spacer(modifier = Modifier.height(EliteSpace.Xl))
    EliteButton(
        label = submitLabel,
        onClick = { onSubmit(email.trim(), password, confirmPassword) },
        enabled = !busy && email.isNotBlank() && password.length >= 8,
        loading = busy,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("auth_submit"),
    )
}

@Composable
private fun ForgotForm(busy: Boolean, onSubmit: (email: String) -> Unit) {
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
        enabled = !busy && email.isNotBlank(),
        loading = busy,
        modifier = Modifier.fillMaxWidth(),
    )
}
