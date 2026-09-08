import SwiftUI

struct AthleteProfileView: View {
    @Bindable var session: DemoSessionStore
    let notifications: [AppNotificationItem]
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Profile keeps account actions local while the rest of Path A stays in demo mode.")

                GlassCard(accent: .voltline) {
                    Text("Maya Costa")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Climber / endurance athlete / local demo session")
                        .foregroundStyle(EosColors.textSecondary)
                    HStack(spacing: 10) {
                        chip("LOCAL_DEMO", accent: .voltline)
                        chip("Path A", accent: .iris)
                        chip("SwiftUI", accent: .telemetry)
                    }
                }

                VStack(spacing: 12) {
                    NeoControl(title: "Messages", subtitle: "Continue the coach thread and inbox surface.", systemImage: "message.badge", accent: .telemetry) { onNavigate(.messages) }
                    NeoControl(title: "Notifications", subtitle: "Review workout, queue, and coach alerts.", systemImage: "bell", accent: .warning) { onNavigate(.notifications) }
                    NeoControl(title: "Settings", subtitle: "Open local toggles and Path A platform notes.", systemImage: "gearshape", accent: .iris) { onNavigate(.settings) }
                }

                GlassCard(accent: .success) {
                    Text("LATEST ALERT")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    if let first = notifications.first {
                        Text(first.title)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(first.body)
                            .foregroundStyle(EosColors.textSecondary)
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
            }
            .padding(20)
            .padding(.bottom, 132)
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
