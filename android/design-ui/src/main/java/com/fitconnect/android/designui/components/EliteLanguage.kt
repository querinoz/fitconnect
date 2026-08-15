package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.i18n.AppLocale

@Composable
fun EliteLanguagePicker(
    locale: AppLocale,
    onLocaleChange: (AppLocale) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("language_picker"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EliteSysLabel("LANGUAGE")
        Text(
            "Interface language",
            style = MaterialTheme.typography.titleMedium,
        )
        EliteFlowRow(spacing = EliteSpace.Xs) {
            AppLocale.entries.forEach { value ->
                EliteChip(
                    label = value.displayName,
                    selected = locale == value,
                    onClick = { onLocaleChange(value) },
                    modifier = Modifier.testTag("language_${value.bcp47}"),
                )
            }
        }
    }
}
