import SwiftUI

struct CoachOverviewView: View {
    let snapshot: CoachOverviewSnapshot
    let offlineQueue: any OfflineQueueContract
    var onNavigate: (CoachRoute) -> Void

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Coach shell is local-only. Offline queue: \(offlineQueue.pendingCount) action(s).")

                GlassCard(accent: .iris) {
                    Text("OVERVIEW")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(snapshot.focus)
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("\(snapshot.coachName) / \(snapshot.rosterCount) / Utilization \(snapshot.utilization)")
                        .foregroundStyle(EosColors.textSecondary)
                }

                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(snapshot.metrics) { metric in
                        BentoMetric(metric: metric)
                    }
                }

                ForEach(snapshot.priorities) { item in
                    GlassCard(accent: item.accent) {
                        Label(item.title, systemImage: item.systemImage)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(item.detail)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }

                VStack(spacing: 12) {
                    NeoControl(title: "Programs", subtitle: "Open the coach program surface and cohort progress.", systemImage: "list.bullet.rectangle", accent: .voltline) {
                        onNavigate(.programs)
                    }
                    NeoControl(title: "Bookings", subtitle: "Review consults and performance reviews.", systemImage: "calendar.badge.clock", accent: .telemetry) {
                        onNavigate(.bookings)
                    }
                    NeoControl(title: "Notifications", subtitle: "Inspect red-flag alerts and queue updates.", systemImage: "bell.badge", accent: .alert) {
                        onNavigate(.notifications)
                    }
                }
            }
            .padding(20)
        }
    }
}
