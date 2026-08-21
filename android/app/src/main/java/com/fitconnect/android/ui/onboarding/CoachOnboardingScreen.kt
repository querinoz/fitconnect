package com.fitconnect.android.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteOnboardingProgress
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.identity.IdentityOnboarding
import com.fitconnect.android.foundation.identity.IdentityRemote
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.coachOnboardingStep
import com.fitconnect.android.foundation.storage.markCoachOnboardingDone
import com.fitconnect.android.foundation.storage.setCoachOnboardingStep
import kotlinx.coroutines.launch

private val COACH_STEPS = listOf(
    "Profile",
    "Specialization",
    "Documents",
    "Pricing",
    "Stripe Connect",
    "Review",
)

@Composable
fun CoachOnboardingScreen(
    keyValueStore: KeyValueStore,
    onFinished: () -> Unit,
    identityRemote: IdentityRemote? = null,
) {
    val scope = rememberCoroutineScope()
    var step by remember { mutableIntStateOf(0) }
    var displayName by remember { mutableStateOf("Tomás Rivera") }
    var specialty by remember { mutableStateOf("Endurance") }
    var documentState by remember { mutableStateOf("Uploaded (LOCAL_DEMO)") }
    var hourly by remember { mutableStateOf("45") }
    var stripeState by remember { mutableStateOf("Connect pending (LOCAL_DEMO)") }
    var hydrated by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        step = keyValueStore.coachOnboardingStep()
        hydrated = true
    }

    fun persistStep(next: Int) {
        step = next
        scope.launch {
            keyValueStore.setCoachOnboardingStep(next)
            identityRemote?.putOnboarding(
                IdentityOnboarding(
                    uid = "",
                    role = UserRole.COACH,
                    step = next,
                    completed = false,
                    payload = org.json.JSONObject()
                        .put("displayName", displayName)
                        .put("specialty", specialty)
                        .toString(),
                ),
            )
        }
    }

    if (!hydrated) {
        Spacer(modifier = Modifier.fillMaxSize())
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(EliteSpace.Xl)
            .testTag("screen_coach_onboarding"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EliteBadge(text = DemoPersona.MODE_LABEL)
        EliteOnboardingProgress(step = step, total = COACH_STEPS.size)
        Text("Coach onboarding", style = MaterialTheme.typography.headlineSmall)
        Text(
            "Command center init · ${COACH_STEPS[step]}",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        when (step) {
            0 -> {
                Text("Coach profile", style = MaterialTheme.typography.titleMedium)
                EliteTextField(
                    value = displayName,
                    onValueChange = { displayName = it },
                    label = "Display name",
                    modifier = Modifier.testTag("coach_onboarding_name"),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(
                        label = "Continue",
                        enabled = displayName.isNotBlank(),
                        onClick = { persistStep(1) },
                    )
                }
            }
            1 -> {
                Text("Specialization", style = MaterialTheme.typography.titleMedium)
                listOf("Endurance", "Strength", "Hybrid", "Recovery").forEach { option ->
                    EliteChip(label = option, selected = specialty == option, onClick = { specialty = option })
                }
                Text("Selected: $specialty", style = MaterialTheme.typography.bodyMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(0) })
                    EliteButton(label = "Continue", onClick = { persistStep(2) })
                }
            }
            2 -> {
                Text("Documents", style = MaterialTheme.typography.titleMedium)
                Text(
                    "Certification / liability upload is simulated in LOCAL_DEMO.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                listOf("Uploaded (LOCAL_DEMO)", "Skip for now").forEach { option ->
                    EliteChip(label = option, selected = documentState == option, onClick = { documentState = option })
                }
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(1) })
                    EliteButton(label = "Continue", onClick = { persistStep(3) })
                }
            }
            3 -> {
                Text("Pricing", style = MaterialTheme.typography.titleMedium)
                EliteTextField(
                    value = hourly,
                    onValueChange = { hourly = it.filter { ch -> ch.isDigit() }.take(4) },
                    label = "Hourly rate (EUR)",
                )
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(2) })
                    EliteButton(
                        label = "Continue",
                        enabled = hourly.toIntOrNull()?.let { it > 0 } == true,
                        onClick = { persistStep(4) },
                    )
                }
            }
            4 -> {
                Text("Stripe Connect", style = MaterialTheme.typography.titleMedium)
                EliteCard {
                    Text(
                        "Production Stripe Connect remains HUMAN_PENDING. This step only records LOCAL_DEMO state.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                listOf("Connect pending (LOCAL_DEMO)", "Simulated connected").forEach { option ->
                    EliteChip(label = option, selected = stripeState == option, onClick = { stripeState = option })
                }
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(3) })
                    EliteButton(label = "Continue", onClick = { persistStep(5) })
                }
            }
            else -> {
                Text("Review", style = MaterialTheme.typography.titleLarge)
                EliteCard {
                    Text("Name: $displayName", style = MaterialTheme.typography.bodyLarge)
                    Text("Specialty: $specialty", style = MaterialTheme.typography.bodyLarge)
                    Text("Documents: $documentState", style = MaterialTheme.typography.bodyLarge)
                    Text("Rate: €$hourly / hr", style = MaterialTheme.typography.bodyLarge)
                    Text("Payouts: $stripeState", style = MaterialTheme.typography.bodyLarge)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteButton(label = "Back", variant = EliteButtonVariant.Ghost, onClick = { persistStep(4) })
                    EliteButton(
                        label = "Enter Coach OS",
                        modifier = Modifier.testTag("coach_onboarding_finish"),
                        onClick = {
                            scope.launch {
                                keyValueStore.markCoachOnboardingDone()
                                identityRemote?.putOnboarding(
                                    IdentityOnboarding(
                                        uid = "",
                                        role = UserRole.COACH,
                                        step = 5,
                                        completed = true,
                                        payload = org.json.JSONObject()
                                            .put("displayName", displayName)
                                            .put("specialty", specialty)
                                            .toString(),
                                    ),
                                )
                                onFinished()
                            }
                        },
                    )
                }
            }
        }
    }
}
