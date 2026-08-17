package com.fitconnect.android.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import com.fitconnect.android.R
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.AuthRepository
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun RoleSelectScreen(
    authRepository: AuthRepository,
    onSelected: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(EliteSpace.Xl)
            .testTag("screen_role_select"),
        verticalArrangement = Arrangement.Center,
    ) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel(stringResource(R.string.auth_role_overline))
            Text(
                text = "FITCONNECT",
                style = MaterialTheme.typography.displayMedium,
            )
            Text(
                text = stringResource(R.string.auth_role_title),
                style = MaterialTheme.typography.headlineSmall,
            )
            Text(
                text = stringResource(R.string.auth_role_body),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            EliteButton(
                label = stringResource(R.string.auth_role_athlete),
                onClick = {
                    scope.launch {
                        when (authRepository.assignRole(UserRole.ATHLETE)) {
                            is AppResult.Ok -> onSelected()
                            is AppResult.Err -> Unit
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("role_select_athlete"),
            )
            EliteButton(
                label = stringResource(R.string.auth_role_coach),
                variant = EliteButtonVariant.Secondary,
                onClick = {
                    scope.launch {
                        when (authRepository.assignRole(UserRole.COACH)) {
                            is AppResult.Ok -> onSelected()
                            is AppResult.Err -> Unit
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("role_select_coach"),
            )
            Spacer(modifier = Modifier.height(EliteSpace.Sm))
        }
    }
}
