package com.fitconnect.android.athlete.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material.icons.outlined.LocalFireDepartment
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.KeyboardOptions
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.brand.EosFitConnectLockup
import com.fitconnect.android.designui.charts.EliteChartPalette
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteLocalImage
import com.fitconnect.android.designui.components.EliteLocalImageExists
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.EosMultiSportHero
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteMetricHeroTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.SetSide
import com.fitconnect.android.sports.guided.domain.SyncUiStatus
import com.fitconnect.android.sports.guided.domain.SystemWorkoutClock
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.timer.MonotonicTimer
import com.fitconnect.android.sports.guided.wakelock.WorkoutWakePolicy
import com.fitconnect.android.sports.progression.ExerciseMode
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import android.view.WindowManager

@Composable
fun StrengthWorkoutScreen() {
    val container = LocalAthleteContainer.current
    val runtime = container.guidedWorkout
    val snap by runtime.snapshot.collectAsState()
    val scope = rememberCoroutineScope()
    val view = LocalView.current
    var error by remember { mutableStateOf<String?>(null) }
    var pausedElapsed by remember { mutableStateOf(0L) }

    LaunchedEffect(Unit) {
        when (val result = runtime.prepare()) {
            is AppResult.Err -> error = "Sign in required to start a workout."
            is AppResult.Ok -> error = null
        }
    }

    LaunchedEffect(snap.phase) {
        while (snap.phase == WorkoutPhase.ACTIVE || snap.phase == WorkoutPhase.REST) {
            delay(250)
            runtime.tick()
        }
    }

    LaunchedEffect(snap.phase) {
        pausedElapsed = 0L
        while (snap.phase == WorkoutPhase.PAUSED) {
            delay(1_000)
            pausedElapsed += 1_000
        }
    }

    val keepAwake = WorkoutWakePolicy.keepScreenAwake(snap.phase, pausedElapsed)
    DisposableEffect(keepAwake) {
        val window = (view.context as? android.app.Activity)?.window
        if (keepAwake) {
            window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            view.keepScreenOn = true
        } else {
            window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            view.keepScreenOn = false
        }
        onDispose {
            window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            view.keepScreenOn = false
        }
    }

    AthleteScreenScaffold(
        title = snap.plan.name.ifBlank { "Guided workout" },
        testTag = "athlete_guided_workout",
        overline = "TRAIN",
        subtitle = syncLabel(snap.syncStatus),
        showTitle = false,
    ) {
        when (snap.phase) {
            WorkoutPhase.IDLE, WorkoutPhase.PREP, WorkoutPhase.RECOVERING -> {
                // Photo hero + START SESSION only (no duplicate command hero).
            }
            else -> {
                item {
                    WorkoutHeroSection(
                        snap = snap,
                        syncLabel = syncLabel(snap.syncStatus),
                        onPrimaryAction = when (snap.phase) {
                            WorkoutPhase.PAUSED -> ({ scope.launch { runtime.resume() } })
                            else -> null
                        },
                    )
                }
            }
        }
        if (snap.phase != WorkoutPhase.IDLE &&
            snap.phase != WorkoutPhase.PREP &&
            snap.phase != WorkoutPhase.RECOVERING
        ) {
            item {
                SyncChip(snap.syncStatus)
            }
        }
        if (error != null || snap.lastError != null) {
            item {
                Text(
                    text = error ?: snap.lastError.orEmpty(),
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.semantics { contentDescription = "Workout error" },
                )
            }
        }
        when (snap.phase) {
            WorkoutPhase.IDLE, WorkoutPhase.PREP, WorkoutPhase.RECOVERING -> {
                item { PrepPhase(snap, onStart = { scope.launch { runtime.start() } }) }
            }
            WorkoutPhase.ACTIVE -> {
                item {
                    ActivePhase(
                        snap = snap,
                        onLog = { input -> scope.launch { runtime.logSet(input) } },
                        onPause = { scope.launch { runtime.pause() } },
                        onSkip = { scope.launch { runtime.skipExercise() } },
                        onFinish = { scope.launch { runtime.finish() } },
                    )
                }
            }
            WorkoutPhase.REST -> {
                item {
                    RestPhase(
                        snap = snap,
                        onSkip = { scope.launch { runtime.skipRest() } },
                        onExtend = { scope.launch { runtime.extendRest(15) } },
                        onPause = { scope.launch { runtime.pause() } },
                    )
                }
            }
            WorkoutPhase.PAUSED -> {
                item {
                    EosPremiumCard {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                            EliteSysLabel(text = "PAUSED")
                            EliteButton(
                                label = "Resume",
                                onClick = { scope.launch { runtime.resume() } },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                                    .testTag("workout_resume"),
                                contentDescription = "Resume workout",
                            )
                            EliteButton(
                                label = "Finish workout",
                                onClick = { scope.launch { runtime.finish() } },
                                variant = EliteButtonVariant.Secondary,
                                modifier = Modifier.fillMaxWidth().testTag("workout_finish"),
                            )
                        }
                    }
                }
            }
            WorkoutPhase.COMPLETING,
            WorkoutPhase.COMPLETED,
            WorkoutPhase.SYNC_PENDING,
            WorkoutPhase.SYNCED,
            -> {
                item(key = "complete") {
                    CompletionPhase(
                        snap = snap,
                        onSync = { scope.launch { runtime.trySync() } },
                        onNew = { scope.launch { runtime.startNew() } },
                    )
                }
            }
            WorkoutPhase.FAILED -> {
                item {
                    EliteButton(
                        label = "Start new workout",
                        onClick = { scope.launch { runtime.startNew() } },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun WorkoutHeroSection(
    snap: GuidedSessionSnapshot,
    syncLabel: String,
    onPrimaryAction: (() -> Unit)?,
) {
    EosPremiumCard(modifier = Modifier.testTag("workout_command_hero")) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            EliteZenithHeader(
                sysLabel = "WORKOUT HERO",
                title = snap.plan.name.ifBlank { "Guided workout" },
                subtitle = workoutPhaseSubtitle(snap),
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                HexStatus("PHASE ${snap.phase.name}")
                HexStatus(syncLabel)
            }
            Text(
                text = "~${snap.plan.estimatedDurationMin} min · ${snap.plan.exercises.size} exercises",
                style = MaterialTheme.typography.bodyLarge,
            )
            snap.currentSlot?.let { slot ->
                Text(
                    text = "Current block · ${slot.exercise.name} · set ${slot.setNumber}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            if (onPrimaryAction != null) {
                EliteButton(
                    label = if (snap.phase == WorkoutPhase.PAUSED) "Resume workout" else "Start workout",
                    onClick = onPrimaryAction,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                        .testTag(
                            if (snap.phase == WorkoutPhase.PAUSED) "workout_hero_resume"
                            else "workout_hero_start",
                        ),
                    contentDescription = if (snap.phase == WorkoutPhase.PAUSED) {
                        "Resume workout from command hero"
                    } else {
                        "Start workout from command hero"
                    },
                )
            }
        }
    }
}

@Composable
private fun SyncChip(status: SyncUiStatus) {
    val label = syncLabel(status)
    val zone = when (status) {
        SyncUiStatus.SYNCED -> 2
        SyncUiStatus.SYNCING -> 3
        SyncUiStatus.SYNC_ERROR -> 5
        SyncUiStatus.LOCAL -> 1
    }
    EliteChip(
        label = label,
        selected = true,
        onClick = {},
        modifier = Modifier
            .testTag("workout_sync_status")
            .semantics { contentDescription = "Sync status $label" },
    )
    Text(
        text = "Effort zones stay semantic — brand accent is not intensity.",
        style = MaterialTheme.typography.bodySmall,
        color = EliteChartPalette.zone(zone),
    )
}

private fun syncLabel(status: SyncUiStatus): String = when (status) {
    SyncUiStatus.LOCAL -> "LOCAL"
    SyncUiStatus.SYNCING -> "SYNCING"
    SyncUiStatus.SYNCED -> "SYNCED"
    SyncUiStatus.SYNC_ERROR -> "SYNC ERROR"
}

private fun workoutPhaseSubtitle(snap: GuidedSessionSnapshot): String = when (snap.phase) {
    WorkoutPhase.IDLE,
    WorkoutPhase.PREP,
    WorkoutPhase.RECOVERING,
    -> "Prep the next block before logging sets."
    WorkoutPhase.ACTIVE -> "Live set logging preserves progression, timer, and sync state."
    WorkoutPhase.REST -> "Rest timer is active. Extend or skip without leaving the session."
    WorkoutPhase.PAUSED -> "Session paused locally. Resume when ready to continue."
    WorkoutPhase.COMPLETING,
    WorkoutPhase.COMPLETED,
    WorkoutPhase.SYNC_PENDING,
    WorkoutPhase.SYNCED,
    -> "Workout complete. Review the summary and retry sync if needed."
    WorkoutPhase.FAILED -> "Recovery failed. Start a fresh session without fabricating workout state."
}

@Composable
private fun PrepPhase(snap: GuidedSessionSnapshot, onStart: () -> Unit) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val minutes = snap.plan.estimatedDurationMin.coerceAtLeast(1)
    val calories = (minutes * 11).coerceAtLeast(200)
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosFitConnectLockup(markSize = 28.dp, wordmarkSize = 16.sp)
        Text(
            text = "TRAIN",
            style = EliteMetricHeroTextStyle.copy(
                fontStyle = FontStyle.Italic,
                fontWeight = FontWeight.Black,
            ),
            color = volt,
        )
        Text(
            text = "YOUR PERFORMANCE. CONNECTED.",
            style = MaterialTheme.typography.labelMedium.copy(letterSpacing = 2.sp),
            color = Color.White.copy(alpha = 0.92f),
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(360.dp)
                .clip(RoundedCornerShape(EliteRadius.Media))
                .border(1.dp, volt.copy(alpha = 0.85f), RoundedCornerShape(EliteRadius.Media))
                .testTag("workout_prep"),
        ) {
            if (EliteLocalImageExists("fc_train_multisport") || EliteLocalImageExists("fc_train_hero")) {
                EosMultiSportHero(
                    imageNames = listOf(
                        "fc_train_multisport",
                        "fc_train_hero",
                        "fc_splash_multisport",
                        "fc_feed_post_1",
                        "fc_feed_post_2",
                    ),
                    contentDescription = "Multi-sport training",
                    modifier = Modifier.fillMaxSize(),
                    dwellMs = 4800L,
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(EliteSurfaceColors.FLOOR.toColor()),
                )
            }
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.25f),
                                Color.Black.copy(alpha = 0.85f),
                            ),
                        ),
                    ),
            )
            Column(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(EliteSpace.Md),
            ) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(Color.Black.copy(alpha = 0.55f))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Bolt,
                        contentDescription = null,
                        tint = volt,
                        modifier = Modifier.size(14.dp),
                    )
                    Text(
                        "PERFORMANCE",
                        style = MaterialTheme.typography.labelSmall,
                        color = volt,
                    )
                }
            }
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(EliteSpace.Lg),
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
            ) {
                Text(
                    text = "WHAT\nWHY\nWHEN",
                    style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.Black),
                    color = Color.White,
                )
                Box(
                    modifier = Modifier
                        .padding(vertical = EliteSpace.Xs)
                        .width(36.dp)
                        .height(2.dp)
                        .background(volt),
                )
                Text(
                    text = "Push harder. Move smarter.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White.copy(alpha = 0.9f),
                )
                Spacer(modifier = Modifier.height(EliteSpace.Sm))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    PrepMetric(
                        icon = Icons.Outlined.Schedule,
                        value = "$minutes MIN",
                        label = "DURATION",
                    )
                    PrepMetric(
                        icon = Icons.Outlined.BarChart,
                        value = "HIGH",
                        label = "INTENSITY",
                    )
                    PrepMetric(
                        icon = Icons.Outlined.LocalFireDepartment,
                        value = "$calories",
                        label = "CALORIES",
                    )
                }
            }
        }
        EliteButton(
            label = "START SESSION",
            onClick = onStart,
            leadingIcon = Icons.Outlined.Bolt,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                .testTag("workout_start"),
            contentDescription = "Start guided workout",
        )
    }
}

@Composable
private fun PrepMetric(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    value: String,
    label: String,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(16.dp),
        )
        Text(value, style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold), color = Color.White)
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.75f))
    }
}

@Composable
private fun ActivePhase(
    snap: GuidedSessionSnapshot,
    onLog: (SetLogInput) -> Unit,
    onPause: () -> Unit,
    onSkip: () -> Unit,
    onFinish: () -> Unit,
) {
    val slot = snap.currentSlot ?: return
    val exercise = slot.exercise
    var reps by remember(slot.slotIndex) {
        mutableStateOf(exercise.targetRepsMax.takeIf { it > 0 }?.toString().orEmpty())
    }
    var load by remember(slot.slotIndex) {
        mutableStateOf(exercise.targetWeightKg?.toString().orEmpty())
    }
    var timeSec by remember(slot.slotIndex) {
        mutableStateOf(exercise.targetTimeSec?.toString().orEmpty())
    }
    var rpe by remember(slot.slotIndex) { mutableDoubleStateOf(0.0) }
    var rir by remember(slot.slotIndex) { mutableIntStateOf(-1) }
    val timedLeft = snap.timed?.let {
                    MonotonicTimer.timedRemaining(it, SystemWorkoutClock)
    }

    EosPremiumCard(modifier = Modifier.testTag("workout_active")) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            EliteSysLabel(text = "ACTIVE · SET ${slot.setNumber}")
            Text(text = exercise.name, style = EliteMetricHeroTextStyle)
            Text(
                text = when (slot.side) {
                    SetSide.LEFT -> "Left"
                    SetSide.RIGHT -> "Right"
                    else -> "Both"
                },
            )
            if (timedLeft != null) {
                Text(
                    text = formatMs(timedLeft),
                    style = EliteMetricHeroTextStyle,
                    color = EliteChartPalette.zone(4),
                    modifier = Modifier.semantics { contentDescription = "Exercise timer ${formatMs(timedLeft)}" },
                )
            }
            val needsReps = exercise.mode == ExerciseMode.REPS ||
                exercise.mode == ExerciseMode.BODYWEIGHT ||
                exercise.mode == ExerciseMode.WEIGHTED_BODYWEIGHT
            if (needsReps) {
                OutlinedTextField(
                    value = reps,
                    onValueChange = { reps = it.filter { ch -> ch.isDigit() } },
                    label = { Text("Reps") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("workout_reps_input"),
                )
            }
            if (exercise.weighted) {
                OutlinedTextField(
                    value = load,
                    onValueChange = { load = it.filter { ch -> ch.isDigit() || ch == '.' } },
                    label = { Text("Load (kg)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth().testTag("workout_load_input"),
                )
            }
            if (exercise.mode == ExerciseMode.TIME || exercise.mode == ExerciseMode.DURATION_SPEED) {
                OutlinedTextField(
                    value = timeSec,
                    onValueChange = { timeSec = it.filter { ch -> ch.isDigit() } },
                    label = { Text("Time (sec)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().testTag("workout_time_input"),
                )
            }
            Text(text = "RPE (optional, 1–10)", style = MaterialTheme.typography.labelMedium)
            EliteFlowRow {
                (1..10).forEach { value ->
                    EliteChip(
                        label = value.toString(),
                        selected = rpe.toInt() == value,
                        onClick = { rpe = value.toDouble() },
                        modifier = Modifier.testTag("workout_rpe_$value"),
                    )
                }
            }
            Text(text = "RIR (optional, 0–5)", style = MaterialTheme.typography.labelMedium)
            EliteFlowRow {
                (0..5).forEach { value ->
                    EliteChip(
                        label = value.toString(),
                        selected = rir == value,
                        onClick = { rir = value },
                        modifier = Modifier.testTag("workout_rir_$value"),
                    )
                }
            }
            snap.nextSlot?.let {
                Text(text = "Next: ${it.exercise.name}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            EliteButton(
                label = "Log set",
                onClick = {
                    onLog(
                        SetLogInput(
                            actualReps = reps.toIntOrNull(),
                            actualTimeSec = timeSec.toIntOrNull()
                                ?: snap.timed?.let { ((it.durationMs - (timedLeft ?: 0)) / 1000).toInt() },
                            loadKg = load.toDoubleOrNull(),
                            rpe = rpe.takeIf { it >= 1.0 },
                            rir = rir.takeIf { it >= 0 },
                            side = slot.side,
                        ),
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                    .testTag("workout_log_set"),
                contentDescription = "Log set",
            )
            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm), modifier = Modifier.fillMaxWidth()) {
                EliteButton(
                    label = "Pause",
                    onClick = onPause,
                    variant = EliteButtonVariant.Secondary,
                    modifier = Modifier.weight(1f).testTag("workout_pause"),
                )
                EliteButton(
                    label = "Skip",
                    onClick = onSkip,
                    variant = EliteButtonVariant.Ghost,
                    modifier = Modifier.weight(1f).testTag("workout_skip"),
                )
            }
            EliteButton(
                label = "Finish",
                onClick = onFinish,
                variant = EliteButtonVariant.Destructive,
                modifier = Modifier.fillMaxWidth().testTag("workout_finish"),
            )
            if (snap.sets.isNotEmpty()) {
                EliteSysLabel(text = "COMPLETED SETS")
                snap.sets.takeLast(5).forEach {
                    Text(text = "${it.exerciseId} · ${it.actualReps ?: it.actualTimeSec}${it.loadKg?.let { kg -> " @ ${kg}kg" } ?: ""}")
                }
            }
        }
    }
}

@Composable
private fun RestPhase(
    snap: GuidedSessionSnapshot,
    onSkip: () -> Unit,
    onExtend: () -> Unit,
    onPause: () -> Unit,
) {
    val remaining = snap.rest?.let {
        MonotonicTimer.restRemaining(it, SystemWorkoutClock)
    } ?: 0L
    EosPremiumCard(modifier = Modifier.testTag("workout_rest")) {
        Column(
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth(),
        ) {
            EliteSysLabel(text = "REST")
            Text(
                text = formatMs(remaining),
                style = EliteMetricHeroTextStyle,
                color = EliteChartPalette.zone(1),
                modifier = Modifier.semantics { contentDescription = "Rest timer ${formatMs(remaining)}" },
            )
            snap.currentSlot?.let {
                Text(text = "Next: ${it.exercise.name} · set ${it.setNumber}")
            }
            EliteButton(
                label = "Skip rest",
                onClick = onSkip,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp)
                    .testTag("workout_skip_rest"),
            )
            EliteButton(
                label = "Extend +15s",
                onClick = onExtend,
                variant = EliteButtonVariant.Secondary,
                modifier = Modifier.fillMaxWidth().testTag("workout_extend_rest"),
            )
            EliteButton(
                label = "Pause",
                onClick = onPause,
                variant = EliteButtonVariant.Ghost,
                modifier = Modifier.fillMaxWidth().testTag("workout_pause"),
            )
        }
    }
}

@Composable
private fun CompletionPhase(
    snap: GuidedSessionSnapshot,
    onSync: () -> Unit,
    onNew: () -> Unit,
) {
    val summary = snap.summary()
    EosPremiumCard(modifier = Modifier.testTag("workout_complete")) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
            EliteSysLabel(text = "COMPLETE")
            Text(text = formatMs(summary.durationMs), style = EliteMetricHeroTextStyle)
            Text(text = "${summary.totalSets} sets · ${summary.exercisesCompleted} exercises")
            Text(text = "Volume ${"%.1f".format(summary.volumeKg)} kg")
            snap.progressionRationale?.let {
                Text(text = it, color = EliteChartPalette.zone(3))
            }
            Text(
                text = when {
                    snap.xpEarned != null -> "XP ${snap.xpEarned}${if (snap.xpDuplicatePrevented) " (deduped)" else ""}"
                    else -> "XP syncs when online — not fabricated locally."
                },
            )
            EliteButton(
                label = "Retry sync",
                onClick = onSync,
                modifier = Modifier.fillMaxWidth().testTag("workout_retry_sync"),
            )
            EliteButton(
                label = "New workout",
                onClick = onNew,
                variant = EliteButtonVariant.Secondary,
                modifier = Modifier.fillMaxWidth().testTag("workout_new"),
            )
        }
    }
}

private fun formatMs(ms: Long): String {
    val totalSec = (ms / 1000).coerceAtLeast(0)
    val m = totalSec / 60
    val s = totalSec % 60
    return "%d:%02d".format(m, s)
}
