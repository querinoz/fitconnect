import SwiftUI

struct AthleteProfileView: View {
    @Bindable var session: AppSessionStore
    let notifications: [AppNotificationItem]
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .voltline) {
                    Text(session.identity?.displayName ?? "Athlete")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text(session.identity?.firebaseUid ?? "unsigned")
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    HStack(spacing: 10) {
                        chip(session.identity?.provider.rawValue.uppercased() ?? "NONE", accent: .voltline)
                        chip("Athlete mode", accent: .iris)
                    }
                }

                if session.identity?.modes.contains(.coach) == true {
                    Button("Switch to Coach") {
                        session.switchMode(to: .coach)
                    }
                    .font(.headline)
                    .foregroundStyle(EosColors.textPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Capsule().stroke(EosColors.iris, lineWidth: 1))
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("switch-coach")
                }

                VStack(spacing: 12) {
                    NeoControl(title: "Connections", subtitle: "HealthKit, Watch, WHOOP, Oura, Garmin, Strava.", systemImage: "link", accent: .telemetry) { onNavigate(.connections) }
                    NeoControl(title: "Booking", subtitle: "Native checkout. No fake success.", systemImage: "calendar", accent: .voltline) { onNavigate(.bookings) }
                    NeoControl(title: "Zenith", subtitle: "MCP-backed recommendations. No diagnosis.", systemImage: "sparkles", accent: .iris) { onNavigate(.zenith) }
                    NeoControl(title: "Settings", subtitle: "Privacy for HR, HRV, sleep and impact.", systemImage: "gearshape", accent: .warning) { onNavigate(.settings) }
                }

                Button("Sign out") {
                    FirebaseAuthBridge().signOut()
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
            .padding(.bottom, 28)
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
