package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.designui.motion.EliteMotionPreset
import com.fitconnect.android.designui.motion.eliteMotionSpec
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled

@Composable
fun AscendXPBar(
    rankLabel: String,
    level: Int,
    xpLabel: String,
    remainingLabel: String,
    progress: Float,
    nextUnlock: String?,
    modifier: Modifier = Modifier,
) {
    val reduce = reduceMotionEnabled()
    val animated by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = eliteMotionSpec(EliteMotionPreset.SUCCESS),
        label = "ascend-xp",
    )
    val shown = if (reduce) progress.coerceIn(0f, 1f) else animated
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("ascend_xp_bar")) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteSysLabel("SYS / ASCEND · PERFORMANCE STATUS")
            Text(
                "$rankLabel  ${level.toString().padStart(2, '0')}",
                style = MaterialTheme.typography.headlineSmall,
            )
            LinearProgressIndicator(
                progress = { shown },
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = remainingLabel },
            )
            Text(xpLabel, style = EliteMetricTextStyle, color = MaterialTheme.colorScheme.primary)
            Text(remainingLabel, style = MaterialTheme.typography.bodyMedium)
            nextUnlock?.let {
                EliteSysLabel("NEXT UNLOCK")
                Text(it, style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}

@Composable
fun AscendStreakCard(
    title: String,
    daysLabel: String,
    statusLabel: String,
    body: String,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("ascend_streak")) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteSysLabel("PERFORMANCE STREAK")
            Text(title, style = MaterialTheme.typography.titleLarge)
            Text(daysLabel, style = EliteMetricTextStyle, color = MaterialTheme.colorScheme.primary)
            Text(statusLabel, style = MaterialTheme.typography.labelMedium)
            Text(body, style = MaterialTheme.typography.bodyMedium)
        }
    }
}

@Composable
fun AscendMissionCard(
    overline: String,
    title: String,
    progressLabel: String,
    why: String,
    progress: Float,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("ascend_mission")) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteSysLabel(overline)
            Text(title, style = MaterialTheme.typography.titleLarge)
            EliteProgress(progress = progress.coerceIn(0f, 1f))
            Text(progressLabel, style = MaterialTheme.typography.bodyMedium)
            Text(why, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun AscendDnaCard(
    typeLabel: String,
    primary: String,
    emerging: String,
    rows: List<Pair<String, Int>>,
    evidence: String,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("ascend_dna")) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteSysLabel("ATHLETE DNA")
            Text(typeLabel, style = MaterialTheme.typography.headlineSmall)
            Text(primary, style = MaterialTheme.typography.bodyLarge)
            Text(emerging, style = MaterialTheme.typography.bodyMedium)
            rows.forEach { (name, score) ->
                EliteStack(spacing = EliteSpace.Xxs) {
                    Text("$name  $score", style = MaterialTheme.typography.labelMedium)
                    EliteProgress(progress = score / 100f)
                }
            }
            Text(evidence, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun AscendEnergyCard(
    kcalLabel: String,
    equivalent: String,
    disclaimer: String,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Metric, modifier = modifier.testTag("ascend_energy")) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteSysLabel("ENERGY DEPLOYED")
            Text(kcalLabel, style = EliteMetricTextStyle)
            Text(equivalent, style = MaterialTheme.typography.bodyLarge)
            Text(disclaimer, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun AscendAchievementCard(
    name: String,
    description: String,
    rarity: String,
    progressLabel: String,
    ownership: String?,
    unlocked: Boolean,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier) {
        EliteStack(spacing = EliteSpace.Sm) {
            EliteBadge(text = rarity)
            Text(if (unlocked) name else "$name", style = MaterialTheme.typography.titleMedium)
            Text(description, style = MaterialTheme.typography.bodyMedium)
            Text(progressLabel, style = MaterialTheme.typography.labelMedium)
            ownership?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
        }
    }
}

@Composable
fun PerformanceCompleteOverlay(
    distanceLabel: String,
    xpLabel: String,
    why: String,
    result: String,
    next: String,
    energyLabel: String?,
    achievement: String?,
    record: String?,
    levelFrom: String?,
    levelTo: String?,
    unlock: String?,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier,
) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = modifier.testTag("performance_complete")) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel("PERFORMANCE COMPLETE")
            Text(distanceLabel, style = EliteMetricTextStyle, color = MaterialTheme.colorScheme.primary)
            Text(xpLabel, style = MaterialTheme.typography.headlineSmall)
            Text(why, style = MaterialTheme.typography.bodyLarge)
            Text(result, style = MaterialTheme.typography.bodyMedium)
            achievement?.let {
                EliteSysLabel("ACHIEVEMENT")
                Text(it, style = MaterialTheme.typography.titleMedium)
            }
            record?.let {
                EliteSysLabel("PERSONAL RECORD")
                Text(it, style = MaterialTheme.typography.titleMedium)
            }
            energyLabel?.let { Text(it, style = MaterialTheme.typography.bodyLarge) }
            if (levelFrom != null && levelTo != null) {
                EliteCard(variant = EliteCardVariant.Metric, modifier = Modifier.testTag("level_up")) {
                    EliteStack {
                        EliteSysLabel("LEVEL UP")
                        Text("$levelFrom → $levelTo", style = MaterialTheme.typography.headlineSmall)
                        unlock?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
            Text(next, style = MaterialTheme.typography.bodyMedium)
            EliteButton(label = "Continue", onClick = onContinue, modifier = Modifier.testTag("performance_complete_continue"))
        }
    }
}
