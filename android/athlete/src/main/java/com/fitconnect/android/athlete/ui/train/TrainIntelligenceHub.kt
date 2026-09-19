package com.fitconnect.android.athlete.ui.train

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.home.TodaySportSessionCard
import com.fitconnect.android.athlete.ui.home.honestReadiness
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.PreferenceKeys
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.domain.gpsSupported
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

/**
 * TRAIN hub — training-only. Nutrition / GPS / full plan catalog are contextual CTAs
 * to dedicated owners (CONTEXTUAL LINKS ≠ AGGLUTINATION).
 */
@Composable
fun TrainIntelligenceHub(
    readinessProvenanced: Provenanced<Int>?,
    onStartFreeSession: () -> Unit,
    onStartGuided: () -> Unit,
    onOpenFight: () -> Unit,
    onOpenNutrition: () -> Unit,
    onOpenSportSelector: () -> Unit = {},
    onOpenTrainPlan: () -> Unit = {},
    onOpenRoutes: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    val container = LocalAthleteContainer.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var resumeTick by remember { mutableIntStateOf(0) }
    var selectedSport by remember { mutableStateOf(SportId.STRENGTH) }
    var identityLabel by remember { mutableStateOf<String?>(null) }
    var identityBackend by remember { mutableStateOf<String?>(null) }
    var serverTodayName by remember { mutableStateOf<String?>(null) }
    var nutritionHint by remember { mutableStateOf<String?>(null) }
    var adaptationConfirmed by remember { mutableStateOf(false) }
    var gpsOk by remember { mutableStateOf(false) }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                resumeTick += 1
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(resumeTick) {
        val localSport = container.platform.keyValueStore
            .get(PreferenceKeys.ACTIVE_TRAINING_SPORT)
            ?.let { SportId(it) }
        when (val id = container.sportsIdentity.getIdentity()) {
            is AppResult.Ok -> {
                val resolved = id.value.primarySport ?: localSport
                resolved?.let { selectedSport = it }
                identityLabel = resolved?.let {
                    container.sportsEngine.registry().get(it)?.displayName
                        ?: SportIntelligenceCatalog.get(it)?.displayName
                        ?: it.value
                }
                identityBackend = id.value.backend
                gpsOk = resolved?.let {
                    container.sportsEngine.registry().get(it)?.gpsSupported()
                } == true
            }
            is AppResult.Err -> {
                identityBackend = "offline/local"
                localSport?.let { selectedSport = it }
                identityLabel = localSport?.let {
                    container.sportsEngine.registry().get(it)?.displayName ?: it.value
                }
                gpsOk = container.sportsEngine.registry().get(selectedSport)?.gpsSupported() == true
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
                        "Fuel ESTIMATE ${n.kcal} kcal · ${n.confidence}"
                    else -> "Fuel ${n.estimateKind} · ${n.confidence}"
                }
                today.value.identity?.primarySport?.let { selectedSport = it }
                gpsOk = container.sportsEngine.registry().get(selectedSport)?.gpsSupported() == true
                identityLabel = container.sportsEngine.registry().get(selectedSport)?.displayName
                    ?: identityLabel
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

    val planCount = remember { GuidedPlanCatalog.cards().size }
    val featuredName = remember {
        GuidedPlanCatalog.cards().firstOrNull()?.plan?.name ?: "Guided plan"
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("train_intelligence_hub"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_sport_identity")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("ACTIVE TRAINING SPORT")
                Text(
                    identityLabel ?: "Sport not set",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "Backend ${identityBackend ?: "—"} · change via sport groups",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                EliteButton(
                    label = "CHANGE SPORT",
                    onClick = onOpenSportSelector,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("train_change_sport"),
                )
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

        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_plan_summary")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("PLAN SUMMARY")
                Text(
                    "$featuredName · $planCount sessions in catalog",
                    style = MaterialTheme.typography.titleMedium,
                )
                Text(
                    "Full plan lives on Train Plan — not inside this hub.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                EliteButton(
                    label = "OPEN PLAN",
                    onClick = onOpenTrainPlan,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                        .testTag("train_open_plan"),
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

        EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_nutrition_cta")) {
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteSysLabel("NUTRITION · CTA")
                Text(
                    nutritionHint ?: "Sport-aware fuel estimates live in Nutrition.",
                    style = MaterialTheme.typography.bodyMedium,
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

        if (gpsOk) {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("train_gps_cta")) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("ROUTES · CTA")
                    Text(
                        "GPS supported for this sport — open Routes hub.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    EliteButton(
                        label = "OPEN ROUTES",
                        onClick = onOpenRoutes,
                        variant = EliteButtonVariant.Secondary,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("train_open_routes"),
                    )
                }
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
