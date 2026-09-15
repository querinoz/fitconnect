import SwiftUI

struct AthleteDashboardView: View {
    let snapshot: AthleteDashboardSnapshot
    let realtime: any RealtimeContract
    let offlineQueue: any OfflineQueueContract
    let healthKit: any HealthKitContract
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .telemetry) {
                    Text("DASHBOARD")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(snapshot.greeting)
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Realtime: \(realtime.statusLabel). Queue: \(offlineQueue.pendingCount).")
                        .foregroundStyle(EosColors.textSecondary)
                }

                HStack(spacing: 12) {
                    ForEach(snapshot.metrics.prefix(4)) { metric in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(metric.label.uppercased())
                                .font(.system(size: 10, weight: .medium, design: .monospaced))
                                .foregroundStyle(EosColors.textSecondary)
                            Text(metric.value)
                                .font(.title3.bold())
                                .foregroundStyle(EosColors.textPrimary)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(metric.accent.color.opacity(0.14)))
                    }
                }

                ForEach(snapshot.bento) { card in
                    BentoMetric(metric: card)
                }

                NeoControl(title: "Recovery", subtitle: "Show only HealthKit or wearable facts.", systemImage: "heart", accent: .success) {
                    onNavigate(.recovery)
                }
                NeoControl(title: "Connections", subtitle: "Apple Health, Watch, WHOOP, Oura, Garmin, Strava.", systemImage: "link", accent: .iris) {
                    onNavigate(.connections)
                }
                NeoControl(title: "Zenith", subtitle: "Context from identity and completed work. No diagnosis.", systemImage: "sparkles", accent: .voltline) {
                    onNavigate(.zenith)
                }

                let capability = healthKit.capability()
                Text(capability.detail)
                    .font(.footnote)
                    .foregroundStyle(EosColors.muted)
            }
            .padding(20)
        }
        .accessibilityIdentifier("athlete-dashboard")
    }
}
