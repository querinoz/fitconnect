package com.fitconnect.android.athlete.ui.vault

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.charts.EliteStreakTrendChart
import com.fitconnect.android.designui.charts.EliteXpProgressChart
import com.fitconnect.android.designui.components.AscendDnaCard
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteSegmentedControl
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.neumorphic.EosPremiumWell
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.ascend.copy.AscendCopy
import com.fitconnect.ascend.domain.AchievementCategory
import com.fitconnect.ascend.domain.MissionKind

@Composable
fun PerformanceVaultScreen() {
    val container = LocalAthleteContainer.current
    val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)
    val lang = locale.bcp47
    val snap = container.ascend.snapshot(LocalAthleteRepository.ATHLETE_ID)
    val vaultBadges = remember { AthleteContentResolver.vaultBadges() }
    val vaultProgress = remember { AthleteContentResolver.vaultProgress() }
    var tab by remember { mutableIntStateOf(0) }
    val t = { key: String -> AscendCopy.t(lang, key) }

    AthleteScreenScaffold(
        title = t("ui.vault"),
        subtitle = "Badges · records · milestones · identity",
        overline = "ATHLETE OS · ACHIEVEMENTS",
        testTag = "ascend_vault",
    ) {
        item {
            AthleteDemoBanner(
                visible = vaultBadges.isDemo || vaultProgress.isAnyDemo,
                modifier = Modifier.testTag("vault_demo_banner"),
            )
        }
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                EliteStack {
                    EliteSysLabel("SHAREABLE BADGES · ${AthleteDemoCatalog.MODE_LABEL}")
                    Text(vaultBadges.summary, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
        item {
            EosPremiumWell(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("vault_streak_chart"),
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("STREAK · 7 WEEKS")
                    EliteStreakTrendChart(
                        values = vaultProgress.streakWeekly.map { it.value },
                        labels = vaultProgress.streakLabels,
                        heroDays = vaultProgress.heroStreakDays.value,
                    )
                }
            }
        }
        item {
            EosPremiumWell(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("vault_xp_chart"),
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                    EliteSysLabel("XP · 7 WEEKS")
                    EliteXpProgressChart(
                        values = vaultProgress.xpWeekly.map { it.value },
                        labels = vaultProgress.xpLabels,
                        todayIndex = vaultProgress.xpTodayIndex,
                    )
                }
            }
        }
        item {
            EosPremiumCard(modifier = Modifier.fillMaxWidth().testTag("vault_xp_summary")) {
                EliteStack(spacing = EliteSpace.Sm) {
                    EliteSysLabel("SYS / ASCEND · PERFORMANCE STATUS")
                    Text(
                        "${t(snap.level.rank.nameKey)}  ${snap.level.level.toString().padStart(2, '0')}",
                        style = MaterialTheme.typography.headlineSmall,
                    )
                    LinearProgressIndicator(
                        progress = { snap.level.progressPercent / 100f },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Text("${snap.totalXp} XP", style = EliteMetricTextStyle)
                    Text(
                        "+${snap.level.xpToNext} XP TO NEXT LEVEL",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    snap.level.nextUnlock?.let {
                        EliteSysLabel("NEXT UNLOCK")
                        Text(t(it.nameKey), style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
        }
        item {
            EliteSegmentedControl(
                options = listOf("BADGES", "RECORDS", "MILESTONES", "LEGACY"),
                selectedIndex = tab,
                onSelected = { tab = it },
            )
        }
        when (tab) {
            0 -> {
                item {
                    EosPremiumCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("vault_badge_list"),
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                            EliteSysLabel("BADGE VAULT · ${AthleteDemoCatalog.MODE_LABEL}")
                            snap.achievements.forEach { item ->
                                VaultAchievementBadge(
                                    name = t(item.definition.nameKey),
                                    description = t(item.definition.descriptionKey),
                                    rarity = item.definition.rarity.name,
                                    progressLabel = "${item.percent}% · ${item.current.toInt()}/${item.target.toInt()}",
                                    ownership = item.demoOwnershipLabel?.let { t(it) },
                                    unlocked = item.unlocked,
                                )
                            }
                        }
                    }
                }
            }
            1 -> {
                if (snap.records.isEmpty()) {
                    item { Text("No performance records yet.", style = MaterialTheme.typography.bodyLarge) }
                }
                snap.records.forEach { record ->
                    item(key = record.kind.name) {
                        EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                            EliteStack(spacing = EliteSpace.Sm) {
                                EliteSysLabel(record.kind.name)
                                Text("${record.value} ${record.unit}", style = MaterialTheme.typography.titleLarge)
                                record.previousValue?.let {
                                    Text("Previous $it", style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            }
            2 -> {
                snap.milestones.forEach { mile ->
                    item(key = mile.id) {
                        EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                            Text(t(mile.nameKey), style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
                snap.missions.filter { it.kind == MissionKind.MONTHLY }.forEach { mission ->
                    item(key = mission.id) {
                        EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                "${t(mission.objectiveKey)} · ${mission.state.name}",
                                style = MaterialTheme.typography.bodyLarge,
                            )
                        }
                    }
                }
            }
            else -> {
                item {
                    AscendDnaCard(
                        typeLabel = t("type.${snap.dna.athleteType.name}"),
                        primary = snap.dna.primaryTrait?.name ?: t("dna.insufficient"),
                        emerging = snap.dna.emergingTrait?.name ?: "",
                        rows = snap.dna.scores.map { it.key.name to it.value },
                        evidence = t(snap.dna.evidenceNotesKey),
                    )
                }
                item {
                    EosPremiumCard(modifier = Modifier.fillMaxWidth()) {
                        EliteStack {
                            EliteSysLabel("UNLOCKED SYSTEMS")
                            snap.unlocks.forEach { Text(t(it.nameKey), style = MaterialTheme.typography.bodyLarge) }
                            snap.achievements.filter { it.unlocked && it.definition.category == AchievementCategory.LEGACY }
                                .forEach { Text(t(it.definition.nameKey), style = MaterialTheme.typography.bodyMedium) }
                        }
                    }
                }
            }
        }
    }
}
