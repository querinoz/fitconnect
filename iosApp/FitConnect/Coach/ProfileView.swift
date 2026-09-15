import SwiftUI

struct CoachProfileView: View {
    @Bindable var session: AppSessionStore
    let notifications: [AppNotificationItem]
    var onNavigate: (CoachRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .iris) {
                    Text(session.identity?.displayName ?? "Coach")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("ONE LOGIN — coach mode. Sign-out is not required to train as athlete.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                if session.identity?.modes.contains(.athlete) == true {
                    Button("Switch to Athlete") {
                        session.switchMode(to: .athlete)
                    }
                    .font(.headline)
                    .foregroundStyle(EosColors.textPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Capsule().stroke(EosColors.voltline, lineWidth: 1))
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("switch-athlete")
                }

                VStack(spacing: 12) {
                    NeoControl(title: "Programs", subtitle: "Assigned work. Empty until the API returns rows.", systemImage: "list.bullet.rectangle", accent: .voltline) { onNavigate(.programs) }
                    NeoControl(title: "Bookings", subtitle: "Approve or reject. No seed bookings.", systemImage: "calendar", accent: .telemetry) { onNavigate(.bookings) }
                    NeoControl(title: "Payouts", subtitle: "Stripe Connect state — never a fake EUR balance.", systemImage: "creditcard", accent: .warning) { onNavigate(.revenue) }
                    NeoControl(title: "Settings", subtitle: "Mode, notifications, privacy.", systemImage: "gearshape", accent: .iris) { onNavigate(.settings) }
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
}
