package com.fitconnect.android.athlete.ui.community

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.community.distribution.DistributionPlatform
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ShareConsent
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * First-class CREATE sheet: post types + privacy consent + distribution targets.
 * Does not auto-enable sensitive fields.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreatePostSheet(
    open: Boolean,
    onDismiss: () -> Unit,
    onPublish: (kind: PostKind, text: String, consent: ShareConsent, platforms: List<DistributionPlatform>) -> Unit,
) {
    if (!open) return
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var kind by remember { mutableStateOf(PostKind.TEXT) }
    var text by remember { mutableStateOf("") }
    var consent by remember { mutableStateOf(ShareConsent()) }
    var platforms by remember {
        mutableStateOf(setOf(DistributionPlatform.FITCONNECT))
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        modifier = Modifier.testTag("create_post_sheet"),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(EliteSpace.Lg),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            Text("CREATE", style = MaterialTheme.typography.headlineSmall)
            Text("Share people, training, places, music — not a metric wall.", style = MaterialTheme.typography.bodySmall)

            Text("Type", style = MaterialTheme.typography.labelMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                listOf(
                    PostKind.TEXT,
                    PostKind.TRAINING,
                    PostKind.ACHIEVEMENT,
                    PostKind.SPOT,
                    PostKind.MUSIC,
                    PostKind.PERFORMANCE,
                ).forEach { k ->
                    TextButton(onClick = { kind = k }) {
                        Text(if (kind == k) "[${k.name}]" else k.name)
                    }
                }
            }

            androidx.compose.material3.OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("create_post_text"),
                label = { Text("What happened?") },
            )

            Text("Privacy", style = MaterialTheme.typography.labelMedium)
            ConsentRow("Training", consent.shareTraining) { consent = consent.copy(shareTraining = it) }
            ConsentRow("Sport", consent.shareSport) { consent = consent.copy(shareSport = it) }
            ConsentRow("Approximate location", consent.shareApproximateLocation) {
                consent = consent.copy(shareApproximateLocation = it)
            }
            ConsentRow("Exact location", consent.shareExactLocation) {
                consent = consent.copy(shareExactLocation = it)
            }
            ConsentRow("Music metadata", consent.shareMusic) { consent = consent.copy(shareMusic = it) }
            ConsentRow("HRV", consent.shareHrv) { consent = consent.copy(shareHrv = it) }
            ConsentRow("Route", consent.shareRoute) { consent = consent.copy(shareRoute = it) }

            Text("Publish to", style = MaterialTheme.typography.labelMedium)
            listOf(
                DistributionPlatform.FITCONNECT,
                DistributionPlatform.INSTAGRAM,
                DistributionPlatform.FACEBOOK,
                DistributionPlatform.LINKEDIN,
                DistributionPlatform.X,
            ).forEach { p ->
                ConsentRow(p.name, platforms.contains(p)) {
                    platforms = if (it) platforms + p else platforms - p
                }
            }

            TextButton(
                onClick = {
                    onPublish(kind, text, consent, platforms.toList().ifEmpty { listOf(DistributionPlatform.FITCONNECT) })
                    onDismiss()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("create_post_publish"),
            ) {
                Text("PUBLISH")
            }
        }
    }
}

@Composable
private fun ConsentRow(label: String, checked: Boolean, onChecked: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(checked = checked, onCheckedChange = onChecked)
        Text(label, style = MaterialTheme.typography.bodyMedium)
    }
}
