import SwiftUI

struct AthleteVaultView: View {
    let programs: [ProgramSummary]
    let bookings: [BookingSummary]
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Vault doubles as achievements, saved plans, and booking memory in Path A.")

                GlassCard(accent: .iris) {
                    Text("VAULT")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Your high-value training artifacts stay one tap away.")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Programs, saved sessions, and scheduled check-ins live here instead of becoming an empty achievements shell.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                ForEach(programs) { program in
                    ProgramCard(program: program)
                }

                if let nextBooking = bookings.first {
                    BookingCard(booking: nextBooking)
                }

                NeoControl(title: "Open full programs", subtitle: "Review all active blocks and completion progress.", systemImage: "list.bullet.rectangle", accent: .voltline) {
                    onNavigate(.programs)
                }
                NeoControl(title: "Open bookings", subtitle: "See the upcoming consults and confirmation state.", systemImage: "calendar.badge.clock", accent: .telemetry) {
                    onNavigate(.bookings)
                }
            }
            .padding(20)
            .padding(.bottom, 132)
        }
    }
}
