package com.fitconnect.android.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.Alignment
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteOnboardingProgress
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.identity.IdentityOnboarding
import com.fitconnect.android.foundation.identity.IdentityRemote
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.athleteOnboardingGoal
import com.fitconnect.android.foundation.storage.athleteOnboardingSport
import com.fitconnect.android.foundation.storage.athleteOnboardingStep
import com.fitconnect.android.foundation.storage.markOnboardingDone
import com.fitconnect.android.foundation.storage.setAthleteOnboardingGoal
import com.fitconnect.android.foundation.storage.setAthleteOnboardingSport
import com.fitconnect.android.foundation.storage.setAthleteOnboardingStep
import kotlinx.coroutines.launch

private val ATHLETE_STEPS = listOf(
    "Welcome",
    "Sport",
    "Goals",
    "Wearables",
    "Plan",
    "Complete",
)

/**
 * First-run athlete onboarding (6 steps). Persists step + selections locally.
 */
@Composable
fun OnboardingScreen(
    keyValueStore: KeyValueStore,
    onFinished: () -> Unit,
    identityRemote: IdentityRemote? = null,
    isLocalDemoSession: Boolean = false,
) {
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    var step by remember { mutableIntStateOf(0) }
    var sport by remember { mutableStateOf("Running") }
    var goal by remember { mutableStateOf("Build consistency") }
    var wearable by remember { mutableStateOf("Skip for now") }
    var plan by remember { mutableStateOf("Athlete Pro preview") }
    var hydrated by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val persistedStep = keyValueStore.athleteOnboardingStep()
        step = maxOf(step, persistedStep)
        sport = keyValueStore.athleteOnboardingSport()
        goal = keyValueStore.athleteOnboardingGoal()
        hydrated = true
    }

    fun persistStep(next: Int) {
        step = next
        scope.launch {
            keyValueStore.setAthleteOnboardingStep(next)
            val remote = identityRemote ?: return@launch
            launch {
                runCatching {
                    remote.putOnboarding(
                        IdentityOnboarding(
                            uid = "",
                            role = UserRole.ATHLETE,
                            step = next,
                            completed = false,
                            payload = org.json.JSONObject()
                                .put("sport", sport)
                                .put("goal", goal)
                                .toString(),
                        ),
                    )
                }
            }
        }
    }

    if (!hydrated) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .testTag("screen_onboarding_loading"),
            contentAlignment = Alignment.Center,
        ) {
            EliteLoading(label = "SYS.ONBOARD")
        }
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(EliteSpace.Xl)
            .testTag("screen_onboarding"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        if (isLocalDemoSession) {
            EliteBadge(text = DemoPersona.MODE_LABEL)
        }
        EliteOnboardingProgress(
            step = step,
            total = ATHLETE_STEPS.size,
            modifier = Modifier.testTag("onboarding_step_$step"),
        )
        Text("Athlete onboarding", style = MaterialTheme.typography.headlineSmall)
        Text(
            "System initialization · ${ATHLETE_STEPS[step]}",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        when (step) {
            0 -> {
                Text("Welcome to FitConnect Elite OS", style = MaterialTheme.typography.titleLarge)
                Text(
                    "Connect. Train. Perform. Configure your cockpit once — change anytime in Profile.",
                    style = MaterialTheme.typography.bodyLarge,
                )
                EliteButton(
                    label = "Continue",
                    onClick = { persistStep(1) },
                    modifier = Modifier.testTag("onboarding_continue"),
                )
            }
            1 -> {
                Text("Choose your primary sport", style = MaterialTheme.typography.titleMedium)
                listOf("Running", "Cycling", "Swimming", "Strength", "Multisport").forEach { option ->
                    EliteChip(
                        label = option,
                        selected = sport == option,
                        onClick = {
                            sport = option
                            scope.launch { keyValueStore.setAthleteOnboardingSport(option) }
                        },
                    )
                }
                Text("Selected: $sport", style = MaterialTheme.typography.bodyMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(0) })
                    EliteButton(
                        label = "Continue",
                        onClick = { persistStep(2) },
                        modifier = Modifier.testTag("onboarding_continue"),
                    )
                }
            }
            2 -> {
                Text("Set a training goal", style = MaterialTheme.typography.titleMedium)
                listOf("Build consistency", "Race prep", "Recover smarter", "Strength base").forEach { option ->
                    EliteChip(
                        label = option,
                        selected = goal == option,
                        onClick = {
                            goal = option
                            scope.launch { keyValueStore.setAthleteOnboardingGoal(option) }
                        },
                    )
                }
                EliteTextField(
                    value = goal,
                    onValueChange = {
                        goal = it
                        scope.launch { keyValueStore.setAthleteOnboardingGoal(it) }
                    },
                    label = "Goal",
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                    modifier = Modifier.testTag("onboarding_goal"),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(1) })
                    EliteButton(
                        label = "Continue",
                        enabled = goal.isNotBlank(),
                        onClick = { persistStep(3) },
                        modifier = Modifier.testTag("onboarding_continue"),
                    )
                }
            }
            3 -> {
                Text("Wearables", style = MaterialTheme.typography.titleMedium)
                Text(
                    if (isLocalDemoSession) {
                        "Connect devices later from Profile → Telemetry. LOCAL_DEMO does not call production APIs."
                    } else {
                        "Connect devices later from Profile → Telemetry."
                    },
                    style = MaterialTheme.typography.bodyMedium,
                )
                listOf("Apple Watch / Health", "Garmin", "Whoop", "Skip for now").forEach { option ->
                    EliteChip(label = option, selected = wearable == option, onClick = { wearable = option })
                }
                Text("Selected: $wearable", style = MaterialTheme.typography.bodyMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(2) })
                    EliteButton(
                        label = "Skip",
                        variant = EliteButtonVariant.Secondary,
                        onClick = {
                            wearable = "Skip for now"
                            persistStep(4)
                        },
                        modifier = Modifier.testTag("onboarding_skip"),
                    )
                    EliteButton(
                        label = "Continue",
                        onClick = { persistStep(4) },
                        modifier = Modifier.testTag("onboarding_continue"),
                    )
                }
            }
            4 -> {
                Text("Plan preview", style = MaterialTheme.typography.titleMedium)
                EliteCard {
                    Text(
                        if (isLocalDemoSession) "Athlete Pro (LOCAL_DEMO)" else "Athlete Pro",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        "Recovery rings · AI directive · coach marketplace · telemetry cockpit",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    if (isLocalDemoSession) {
                        Text("Billing is simulated — no Stripe charge.", style = MaterialTheme.typography.bodySmall)
                    }
                }
                listOf("Athlete Pro preview", "Coach-led plan preview").forEach { option ->
                    EliteChip(label = option, selected = plan == option, onClick = { plan = option })
                }
                Text("Selected: $plan", style = MaterialTheme.typography.bodyMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(3) })
                    EliteButton(
                        label = "Continue",
                        onClick = { persistStep(5) },
                        modifier = Modifier.testTag("onboarding_continue"),
                    )
                }
            }
            else -> {
                Text("You're ready", style = MaterialTheme.typography.titleLarge)
                EliteCard {
                    Text("Sport: $sport", style = MaterialTheme.typography.bodyLarge)
                    Text("Goal: $goal", style = MaterialTheme.typography.bodyLarge)
                    Text("Wearable: $wearable", style = MaterialTheme.typography.bodyLarge)
                    Text("Plan: $plan", style = MaterialTheme.typography.bodyLarge)
                }
                Spacer(modifier = Modifier.height(EliteSpace.Md))
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(4) })
                    EliteButton(
                        label = "Enter Athlete OS",
                        modifier = Modifier.testTag("onboarding_finish"),
                        onClick = {
                            scope.launch {
                                keyValueStore.markOnboardingDone()
                                onFinished()
                                val remote = identityRemote ?: return@launch
                                launch {
                                    runCatching {
                                        remote.putOnboarding(
                                            IdentityOnboarding(
                                                uid = "",
                                                role = UserRole.ATHLETE,
                                                step = 5,
                                                completed = true,
                                                payload = org.json.JSONObject()
                                                    .put("sport", sport)
                                                    .put("goal", goal)
                                                    .toString(),
                                            ),
                                        )
                                    }
                                }
                            }
                        },
                    )
                }
            }
        }
    }
}
