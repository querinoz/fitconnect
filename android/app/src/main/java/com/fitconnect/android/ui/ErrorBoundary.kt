package com.fitconnect.android.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.res.stringResource
import com.fitconnect.android.R
import com.fitconnect.android.designui.atmosphere.HoneycombAtmosphere
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.Logger

/**
 * Recovery shell for foundation navigation. Compose lacks a true React-style
 * error boundary; feature screens should set [error] from effects when they
 * catch failures so users always get a retry path.
 *
 * P0 (2026-08-18): the failure state used to render stock Material 3 on a bare
 * background with hardcoded English copy ("Something went wrong" / "Retry"). It now uses
 * the Elite OS surface system and the already-localised nav_error_* / auth_retry strings,
 * so an error looks like FitConnect in every locale instead of an unbranded crash page.
 * Behaviour is unchanged: same retry path, same logging.
 */
@Composable
fun ErrorBoundary(
    logger: Logger,
    content: @Composable () -> Unit,
) {
    var error by remember { mutableStateOf<Throwable?>(null) }
    val current = error
    if (current != null) {
        LaunchedEffect(current) {
            logger.e("ErrorBoundary", "Recoverable UI failure", current)
        }
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .testTag("error_boundary"),
        ) {
            HoneycombAtmosphere(
                modifier = Modifier.fillMaxSize(),
                strokeColor = MaterialTheme.colorScheme.error,
            )
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(EliteSpace.Inset),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                EliteCard(variant = EliteCardVariant.Glass) {
                    EliteSysLabel(stringResource(R.string.app_name))
                    Spacer(modifier = Modifier.height(EliteSpace.Sm))
                    Text(
                        text = stringResource(R.string.nav_error_title),
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.error,
                    )
                    Spacer(modifier = Modifier.height(EliteSpace.Xs))
                    Text(
                        text = stringResource(R.string.nav_error_body),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(EliteSpace.Lg))
                    EliteButton(
                        label = stringResource(R.string.auth_retry),
                        onClick = { error = null },
                        contentDescription = stringResource(R.string.auth_retry),
                        modifier = Modifier.testTag("error_boundary_retry"),
                    )
                }
            }
        }
    } else {
        content()
    }
}
