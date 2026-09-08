import SwiftUI

struct CoachProfileView: View {
    @Bindable var session: DemoSessionStore
    let notifications: [AppNotificationItem]
    var onNavigate: (CoachRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "More groups coach profile, settings, notifications, and deeper operations.")

                GlassCard(accent: .iris) {
                    Text("Sofia Mendes")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Head coach / roster orchestration / local Path A session")
                        .foregroundStyle(EosColors.textSecondary)
                    HStack(spacing: 10) {
                        chip("LOCAL_DEMO", accent: .voltline)
                        chip("Coach", accent: .iris)
                        chip("More", accent: .telemetry)
                    }
                }

                VStack(spacing: 12) {
                    NeoControl(title: "Programs", subtitle: "Open the coach program catalogue.", systemImage: "list.bullet.rectangle", accent: .voltline) { onNavigate(.programs) }
                    NeoControl(title: "Revenue", subtitle: "See live retainers and booking KPIs.", systemImage: "creditcard", accent: .telemetry) { onNavigate(.revenue) }
                    NeoControl(title: "Settings", subtitle: "Review Path A platform notes and toggles.", systemImage: "gearshape", accent: .iris) { onNavigate(.settings) }
                }

                if let first = notifications.first {
                    GlassCard(accent: first.accent) {
                        Text("LATEST ALERT")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundStyle(EosColors.textSecondary)
                        Text(first.title)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(first.body)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }

                Button("Sign out") {
                    session.signOut()
                }
                .font(.headline)
                .foregroundStyle(EosColors.floor)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Capsule().fill(EosColors.voltline))
                .buttonStyle(.plain)
            }
            .padding(20)
        }
    }

    private func chip(_ title: String, accent: EosAccent) -> some View {
        Text(title)
            .font(.system(size: 11, weight: .medium, design: .monospaced))
            .foregroundStyle(accent.color)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(accent.color.opacity(0.14), in: Capsule())
    }
}
