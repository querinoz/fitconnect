import SwiftUI

struct AthleteTelemetryView: View {
    let realtime: any RealtimeContract
    let zones: [ZoneSlice]
    let healthKit: any HealthKitContract

    var body: some View {
        let capability = healthKit.capability()

        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .telemetry) {
                    Text("TELEMETRY")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Live samples only. Missing stays missing.")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("\(realtime.statusLabel) · \(realtime.latencyLabel)")
                        .foregroundStyle(EosColors.textSecondary)
                    HStack(spacing: 12) {
                        metricCard(title: "Heart rate", value: "MISSING", accent: .alert)
                        metricCard(title: "Cadence", value: "MISSING", accent: .telemetry)
                        metricCard(title: "Power", value: "MISSING", accent: .voltline)
                    }
                }

                if zones.isEmpty {
                    GlassCard(accent: .iris) {
                        Text("ZONE ENGINE")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundStyle(EosColors.textSecondary)
                        Text("No zone minutes until a workout with HR samples exists.")
                            .foregroundStyle(EosColors.textSecondary)
                    }
                } else {
                    GlassCard(accent: .iris) {
                        Text("ZONE ENGINE")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundStyle(EosColors.textSecondary)
                        ForEach(zones) { zone in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(zone.name)
                                        .foregroundStyle(EosColors.textPrimary)
                                    Spacer()
                                    Text(zone.duration)
                                        .foregroundStyle(zone.accent.color)
                                }
                                ProgressView(value: zone.share)
                                    .tint(zone.accent.color)
                            }
                        }
                    }
                }

                GlassCard(accent: .warning) {
                    Text(capability.title.uppercased())
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(capability.status)
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(capability.detail)
                        .foregroundStyle(EosColors.textSecondary)
                    Text(capability.buildNote)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(EosColors.warning)
                }
            }
            .padding(20)
        }
        .navigationTitle("Telemetry")
    }

    private func metricCard(title: String, value: String, accent: EosAccent) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(value)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(accent.color.opacity(0.14)))
    }
}
