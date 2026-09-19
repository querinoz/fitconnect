package com.fitconnect.android.athlete.ui.train

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.home.TodaySportSessionCard
import com.fitconnect.android.athlete.ui.home.honestReadiness
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.guided.catalog.GuidedPlanCatalog
import com.fitconnect.android.sports.intelligence.AdaptationAction
import com.fitconnect.android.sports.intelligence.AdaptationConfidence
import com.fitconnect.android.sports.intelligence.AdaptiveTraining
import com.fitconnect.android.sports.intelligence.ExplainableAdaptation
import com.fitconnect.android.sports.intelligence.SessionHonestyBundle
import com.fitconnect.android.sports.intelligence.SportIntelligenceCatalog
import com.fitconnect.android.sports.intelligence.SportWireIds
import com.fitconnect.android.sports.intelligence.TrainingLoadLabel
import com.fitconnect.android.sports.intelligence.TrainingLoadView
import com.fitconnect.android.sports.intelligence.TodaySessionRecommendation
import kotlinx.coroutines.launch

/**
 * TRAIN intelligence hub — sport registry, identity, plan overview, today, adaptation confirm.
 * Live free-session execution stays on [ActivityScreen]; this surfaces the product gap fill.
 */
@Composable
fun TrainIntelligenceHub(
    readinessProvenanced: Provenanced<Int>?,
    onStartFreeSession: () -> Unit,
    onStartGuided: () -> Unit,
    onOpenFight: () -> Unit,
    onOpenNutrition: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var selectedSport by remember { mutableStateOf(SportId.STRENGTH) }
    var identityLabel by remember { mutableStateOf<String?>(null) }
    var identityBackend by remember { mutableStateOf<String?>(null) }
    var serverTodayName by remember { mutableStateOf<String?>(null) }
    var nutritionHint by remember { mutableStateOf<String?>(null) }
    var adaptationConfirmed by remember { mutableStateOf(false) }
    var persistMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        when (val id = container.sportsIdentity.getIdentity()) {
            is AppResult.Ok -> {
                id.value.primarySport?.let { selectedSport = it }
                identityLabel = id.value.primarySport?.let {
                    SportIntelligenceCatalog.get(it)?.displayName ?: it.value
                }
                identityBackend = id.value.backend
            }
            is AppResult.Err -> {
                identityBackend = "offline/local"
            }
        }
        when (val today = container.trainingToday.getToday(SportWireIds.toWire(selectedSport))) {
            is AppResult.Ok -> {
                today.value.today?.sportId?.let { selectedSport = it }
                serverTodayName = today.value.today?.sessionName
                val n = today.value.nutrition
                nutritionHint = when {
                    n == null -> null
                    n.kcal != null ->
                        "Fuel ESTIMATE ${n.kcal} kcal · ${n.confidence} · ${n.estimateKind}"
                    else -> "Fuel ${n.estimateKind} · ${n.confidence} (no kcal without mass/profile)"
                }
                today.value.identity?.primarySport?.let { selectedSport = it }
            }
            is AppResult.Err -> Unit
        }
    }

    val honesty = SessionHonestyBundle(readiness = honestReadiness(readinessProvenanced))
    val recommendation: TodaySessionRecommendation = remember(selectedSport, readinessProvenanced) {
        SportIntelligenceCatalog.recommendToday(
            sportId = selectedSport,
            honesty = honesty,
        )
    }

    val loadLabel = when (readinessProvenanced?.provenance) {
        AthleteDataProvenance.LOCAL_DEMO, AthleteDataProvenance.INSUFFICIENT_DATA, null ->
            TrainingLoadLabel.UNKNOWN
        else -> AdaptiveTraining.loadLabelFromReadiness(
            readinessProvenanced.value,
            honesty.readiness.status,
        )
    }
    val adaptation: ExplainableAdaptation = remember(recommendation, loadLabel, readinessProvenanced) {
        AdaptiveTraining.recommendSessionAdaptation(
            trainingLoad = TrainingLoadView(loadLabel),
            readinessScore = honesty.readiness.value,
            readinessState = when (honesty.readiness.status) {
                com.fitconnect.android.sports.intelligence.HonestyStatus.AVAILABLE ->
                    AdaptationConfidence.HIGH
                com.fitconnect.android.sports.intelligence.HonestyStatus.MISSING,
                com.fitconnect.android.sports.intelligence.HonestyStatus.NOT_CONNECTED,
                -> AdaptationConfidence.NOT_AVAILABLE
                else -> AdaptationConfidence.LOW
            },
            availableMin = null,
            plannedDurationMin = recommendation.estimatedDurationMin,
        )
    }

    val plans = remember { GuidedPlanCatalog.cards() }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("train_intelligence_hub"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_sport_identity")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("SPORT IDENTITY")
                Text(
                    identityLabel?.let { "Primary · $it" } ?: "Primary sport not set",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "Backend ${identityBackend ?: "—"} · registry ${SportIntelligenceCatalog.all().size} sports",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                EliteFlowRow {
                    SportIntelligenceCatalog.all().forEach { profile ->
                        EliteChip(
                            label = profile.displayName,
                            selected = selectedSport == profile.sportId,
                            onClick = {
                                selectedSport = profile.sportId
                                adaptationConfirmed = false
                                scope.launch {
                                    when (
                                        val put = container.sportsIdentity.putIdentity(
                                            primarySport = SportWireIds.toWire(profile.sportId),
                                            primaryGoal = "PERFORMANCE",
                                            sportLevel = null,
                                        )
                                    ) {
                                        is AppResult.Ok -> {
                                            identityLabel = profile.displayName
                                            identityBackend = put.value.backend
                                            persistMessage = "Identity saved"
                                        }
                                        is AppResult.Err -> {
                                            persistMessage =
                                                "Identity saved locally for this session (server unreachable)"
                                        }
                                    }
                                    when (
                                        val today = container.trainingToday.getToday(
                                            SportWireIds.toWire(profile.sportId),
                                        )
                                    ) {
                                        is AppResult.Ok -> {
                                            serverTodayName = today.value.today?.sessionName
                                            val n = today.value.nutrition
                                            nutritionHint = n?.let {
                                                if (it.kcal != null) {
                                                    "Fuel ESTIMATE ${it.kcal} kcal · ${it.confidence}"
                                                } else {
                                                    "Fuel ${it.estimateKind} · ${it.confidence}"
                                                }
                                            }
                                        }
                                        is AppResult.Err -> Unit
                                    }
                                }
                            },
                        )
                    }
                }
                persistMessage?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall)
                }
            }
        }

        TodaySportSessionCard(
            recommendation = recommendation,
            onStart = {
                if (selectedSport == SportId.MARTIAL_ARTS) onOpenFight()
                else if (
                    selectedSport == SportId.STRENGTH ||
                    selectedSport == SportId.CROSSFIT ||
                    selectedSport == SportId.GENERAL_FITNESS
                ) {
                    onStartGuided()
                } else {
                    onStartFreeSession()
                }
            },
        )

        serverTodayName?.let {
            Text(
                "Server today · $it",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.testTag("train_server_today"),
            )
        }

        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_plan_overview")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("PLAN OVERVIEW")
                Text(
                    "Phase · active catalog · ${plans.size} sessions",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "Week blocks are executable guided plans. Completions are MANUAL — not fabricated biometrics.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                plans.take(4).forEach { card ->
                    Text(
                        "· ${card.plan.name} · ${card.plan.estimatedDurationMin} min · ${card.difficulty} · ${card.structure.joinToString(" → ")}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
                EliteButton(
                    label = "OPEN GUIDED PLAN",
                    onClick = onStartGuided,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                        .testTag("train_open_guided"),
                )
            }
        }

        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_adaptation_card")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("ADAPTATION · CONFIRM ONLY")
                Text("WHAT · ${adaptation.what}", style = MaterialTheme.typography.bodyMedium)
                Text("WHY · ${adaptation.why}", style = MaterialTheme.typography.bodyMedium)
                Text(
                    "DATA · ${adaptation.data.joinToString(" · ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    "CONFIDENCE · ${adaptation.confidence.name}",
                    style = MaterialTheme.typography.labelLarge,
                )
                Text(
                    if (adaptationConfirmed) {
                        "Confirmed for this session · action ${adaptation.action.name} (not auto-applied)"
                    } else {
                        "Not applied until you confirm. Auto-apply is forbidden."
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (adaptation.action != AdaptationAction.KEEP) {
                    EliteButton(
                        label = if (adaptationConfirmed) "CONFIRMED" else "CONFIRM ADAPTATION",
                        onClick = { adaptationConfirmed = true },
                        variant = if (adaptationConfirmed) {
                            EliteButtonVariant.Secondary
                        } else {
                            EliteButtonVariant.Primary
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("train_confirm_adaptation"),
                        enabled = !adaptationConfirmed,
                    )
                }
            }
        }

        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_nutrition_entry")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("NUTRITION INTELLIGENCE")
                Text(
                    nutritionHint ?: "Open nutrition for sport-aware ESTIMATE targets, meals, grocery.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                Text(
                    "ESTIMATE context only — logging requires explicit confirm.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                EliteButton(
                    label = "OPEN NUTRITION",
                    onClick = onOpenNutrition,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("train_open_nutrition"),
                )
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
            EliteButton(
                label = "FREE SESSION",
                onClick = onStartFreeSession,
                variant = EliteButtonVariant.Primary,
                modifier = Modifier.weight(1f).testTag("train_start_free"),
            )
            EliteButton(
                label = "FIGHT",
                onClick = onOpenFight,
                variant = EliteButtonVariant.Secondary,
                modifier = Modifier.weight(1f).testTag("train_open_fight"),
            )
        }
    }
}
