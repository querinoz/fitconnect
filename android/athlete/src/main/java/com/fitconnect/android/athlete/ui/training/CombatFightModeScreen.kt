package com.fitconnect.android.athlete.ui.training

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.theme.EliteMetricHeroTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.sports.combat.CombatCatalog
import com.fitconnect.android.sports.combat.CombatHonesty
import com.fitconnect.android.sports.combat.CombatRoundCommand
import com.fitconnect.android.sports.combat.CombatRoundEngine
import com.fitconnect.android.sports.combat.CombatRoundPhase
import com.fitconnect.android.sports.combat.CombatRoundPrescription
import com.fitconnect.android.sports.combat.CombatRoundSnapshot
import kotlinx.coroutines.delay

@Composable
fun CombatFightModeScreen(
    disciplineId: String = "boxing",
    onFinished: () -> Unit = {},
) {
    var snap by remember {
        mutableStateOf(
            CombatRoundEngine.reduce(
                CombatRoundSnapshot(),
                CombatRoundCommand.Configure(
                    CombatRoundPrescription(roundCount = 5, workSec = 180, restSec = 60, warningSec = 10, countdownSec = 10),
                    disciplineId = if (CombatCatalog.isKnown(disciplineId)) disciplineId else "boxing",
                ),
            ),
        )
    }
    val live = snap.phase == CombatRoundPhase.COUNTDOWN ||
        snap.phase == CombatRoundPhase.WORK ||
        snap.phase == CombatRoundPhase.WARNING ||
        snap.phase == CombatRoundPhase.REST
    LaunchedEffect(live, snap.phase) {
        while (
            snap.phase == CombatRoundPhase.COUNTDOWN ||
            snap.phase == CombatRoundPhase.WORK ||
            snap.phase == CombatRoundPhase.WARNING ||
            snap.phase == CombatRoundPhase.REST
        ) {
            delay(1_000)
            snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Tick)
        }
    }

    AthleteScreenScaffold(
        title = "Fight Mode",
        subtitle = "${snap.disciplineId.replace('_', ' ')} · no invented force",
        testTag = "athlete_fight_mode",
    ) {
        item {
            EliteCard {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                ) {
                    Text(
                        when (snap.phase) {
                            CombatRoundPhase.REST -> "REST"
                            CombatRoundPhase.WARNING -> "WARNING"
                            CombatRoundPhase.COUNTDOWN -> "COUNTDOWN"
                            CombatRoundPhase.COMPLETE -> "COMPLETE"
                            CombatRoundPhase.PAUSED -> "PAUSED"
                            CombatRoundPhase.IDLE -> "FIGHT MODE"
                            else -> "ROUND ${snap.currentRound}"
                        },
                        style = MaterialTheme.typography.labelLarge,
                    )
                    Text(
                        CombatRoundEngine.formatClock(snap.remainingSec),
                        style = EliteMetricHeroTextStyle,
                        modifier = Modifier.semantics {
                            contentDescription = "Round remaining ${CombatRoundEngine.formatClock(snap.remainingSec)}"
                        }.testTag("fight_clock"),
                    )
                    Text(
                        "Force from watch IMU is invalid: ${CombatHonesty.watchImuCannotMeasureForce()}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
        if (snap.phase == CombatRoundPhase.IDLE || snap.phase == CombatRoundPhase.COMPLETE) {
            item {
                EliteButton(
                    label = "Start session",
                    onClick = {
                        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Start)
                    },
                )
            }
        } else if (snap.phase != CombatRoundPhase.PAUSED) {
            item {
                EliteButton(
                    label = "Pause",
                    onClick = {
                        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Pause)
                    },
                )
            }
        }
        if (snap.phase == CombatRoundPhase.PAUSED) {
            item {
                EliteButton(label = "Resume", variant = EliteButtonVariant.Secondary, onClick = {
                    snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Resume)
                })
            }
        }
        if (snap.phase == CombatRoundPhase.REST) {
            item {
                EliteButton(label = "Skip rest", variant = EliteButtonVariant.Secondary, onClick = {
                    snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.SkipRest)
                })
            }
        }
        if (snap.phase != CombatRoundPhase.IDLE) {
            item {
                EliteButton(label = "Finish", variant = EliteButtonVariant.Ghost, onClick = {
                    snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Finish)
                    onFinished()
                })
            }
        }
    }
}
