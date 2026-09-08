import SwiftUI

struct AthleteHomeView: View {
    let snapshot: AthleteDashboardSnapshot
    let realtime: any RealtimeContract
    let offlineQueue: any OfflineQueueContract
    var onNavigate: (AthleteRoute) -> Void

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "\(realtime.statusLabel) / \(realtime.latencyLabel) / Offline queue: \(offlineQueue.pendingCount)")

                GlassCard(accent: .voltline) {
                    Text("TODAY / HOME")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(snapshot.greeting)
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text(snapshot.recovery)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                    HStack {
                        statPill(title: "Readiness", value: snapshot.readiness, accent: .voltline)
                        statPill(title: "Focus", value: snapshot.focus, accent: .telemetry)
                    }
                    HStack(spacing: 12) {
                        quickButton("Workout", systemImage: "figure.strengthtraining.traditional") { onNavigate(.workout) }
                        quickButton("Telemetry", systemImage: "waveform.path.ecg") { onNavigate(.telemetry) }
                    }
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 18) {
                        ForEach(snapshot.metrics) { metric in
                            HexMetric(metric: metric)
                        }
                    }
                    .padding(.vertical, 4)
                }

                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(snapshot.bento) { metric in
                        BentoMetric(metric: metric)
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    sectionLabel("Quick access")
                    NeoControl(title: "Discover patterns", subtitle: "Open editorial analysis cards and coaching ideas.", systemImage: "sparkle.magnifyingglass", accent: .iris) {
                        onNavigate(.discover)
                    }
                    NeoControl(title: "Route map", subtitle: "Review the planned climb trigger and cadence notes.", systemImage: "map", accent: .telemetry) {
                        onNavigate(.map)
                    }
                    NeoControl(title: "Coach messages", subtitle: "Continue the live thread from the profile shell.", systemImage: "message", accent: .success) {
                        onNavigate(.messages)
                    }
                }
            }
            .padding(20)
            .padding(.bottom, 132)
        }
    }

    private func statPill(title: String, value: String, accent: EosAccent) -> some View {
        VStack(alignment: .leading, spacing: 4) {
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

    private func quickButton(_ title: String, systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.headline)
                .foregroundStyle(EosColors.floor)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Capsule().fill(EosColors.trainGradient))
        }
        .buttonStyle(.plain)
    }

    private func sectionLabel(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.system(size: 11, weight: .medium, design: .monospaced))
            .foregroundStyle(EosColors.textSecondary)
    }
}
