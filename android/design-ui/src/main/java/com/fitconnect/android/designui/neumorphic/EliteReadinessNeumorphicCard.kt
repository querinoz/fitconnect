package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.designui.theme.EliteSpace

data class ReadinessTelemetry(
    val readinessPercent: Int,
    val hrvMs: Int,
    val load: Float,
    val sleepLabel: String = "7h 18m",
)

/**
 * Elite readiness card — convex index + concave biometric well on OLED floor.
 */
@Composable
fun EliteReadinessNeumorphicCard(
    telemetry: ReadinessTelemetry,
    modifier: Modifier = Modifier,
    athleteLabel: String? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(EosNeumorphicColors.Floor)
            .padding(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        if (athleteLabel != null) {
            Text(
                text = "// ATLETA_CONECTADO: $athleteLabel",
                color = EosNeumorphicColors.TextMuted,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            ReadinessIndexPanel(
                percent = telemetry.readinessPercent,
                modifier = Modifier.weight(1f),
            )
            BiometricWell(
                telemetry = telemetry,
                modifier = Modifier.weight(2f),
            )
        }
    }
}

@Composable
private fun ReadinessIndexPanel(
    percent: Int,
    modifier: Modifier = Modifier,
) {
    EosNeumorphicSurface(
        modifier = modifier.semantics {
            contentDescription = "Índice de prontidão $percent por cento"
        },
        style = EosNeumorphicStyle.Convex,
        cornerRadius = 16.dp,
    ) {
        Column(
            modifier = Modifier.padding(EliteSpace.Lg),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(
                    text = "// SYSTEM.PRONTIDÃO",
                    color = EosNeumorphicColors.TextMuted,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "ÍNDICE_PRONTIDÃO",
                    color = EosNeumorphicColors.TextPrimary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold,
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = EliteSpace.Md),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = "$percent%",
                    color = EosNeumorphicColors.Voltline,
                    fontSize = 48.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Black,
                )
                Text(
                    text = "OPTIMAL STATE",
                    color = EosNeumorphicColors.Voltline,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier
                        .padding(top = 8.dp)
                        .background(
                            EosNeumorphicColors.Voltline.copy(alpha = 0.1f),
                            RoundedCornerShape(4.dp),
                        )
                        .border(
                            1.dp,
                            EosNeumorphicColors.Voltline.copy(alpha = 0.2f),
                            RoundedCornerShape(4.dp),
                        )
                        .padding(horizontal = 8.dp, vertical = 2.dp),
                )
            }
        }
    }
}

@Composable
private fun BiometricWell(
    telemetry: ReadinessTelemetry,
    modifier: Modifier = Modifier,
) {
    EosNeumorphicSurface(
        modifier = modifier.semantics {
            contentDescription = "Telemetria HRV ${telemetry.hrvMs} milissegundos, carga ${telemetry.load}"
        },
        style = EosNeumorphicStyle.Concave,
        cornerRadius = 16.dp,
    ) {
        Column(modifier = Modifier.padding(EliteSpace.Lg)) {
            Text(
                text = "// BIOMETRIC_LOG",
                color = EosNeumorphicColors.TextMuted,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
            )
            Text(
                text = "TELEMETRY_STREAM",
                color = EosNeumorphicColors.TextPrimary,
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
            )

            Spacer(modifier = Modifier.height(EliteSpace.Md))

            TelemetryRow(label = "HRV", value = "${telemetry.hrvMs} ms", status = "NORMAL")
            TelemetryRow(label = "Carga", value = telemetry.load.toString(), status = "OPTIMAL")
            TelemetryRow(
                label = "Sono",
                value = telemetry.sleepLabel,
                status = "RESTED",
                showDivider = false,
            )
        }
    }
}

@Composable
private fun TelemetryRow(
    label: String,
    value: String,
    status: String,
    showDivider: Boolean = true,
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = label,
                color = EosNeumorphicColors.TextMuted,
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = value,
                    color = EosNeumorphicColors.TextPrimary,
                    fontSize = 14.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(end = 8.dp),
                )
                Text(
                    text = status,
                    color = EosNeumorphicColors.Voltline,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(EosNeumorphicColors.Voltline.copy(alpha = 0.1f))
                        .border(
                            1.dp,
                            EosNeumorphicColors.Voltline.copy(alpha = 0.2f),
                            RoundedCornerShape(4.dp),
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp),
                )
            }
        }
        if (showDivider) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(EosNeumorphicColors.ShadowDeep.copy(alpha = 0.4f)),
            )
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF070B14)
@Composable
private fun EliteReadinessNeumorphicCardPreview() {
    EliteReadinessNeumorphicCard(
        telemetry = ReadinessTelemetry(
            readinessPercent = 85,
            hrvMs = 68,
            load = 0.82f,
        ),
        athleteLabel = "INÊS MARTINS",
    )
}
