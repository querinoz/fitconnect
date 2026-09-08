import SwiftUI

struct CoachCalendarView: View {
    let bookings: [BookingSummary]
    var onNavigate: (CoachRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Calendar is backed by the same booking data so it is not a dead tab.")

                GlassCard(accent: .telemetry) {
                    Text("CALENDAR")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("This week is stacked around performance reviews and race prep.")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Button("Open bookings") {
                        onNavigate(.bookings)
                    }
                    .font(.headline)
                    .foregroundStyle(EosColors.floor)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity)
                    .background(Capsule().fill(EosColors.trainGradient))
                    .buttonStyle(.plain)
                }

                ForEach(bookings) { booking in
                    BookingCard(booking: booking)
                }
            }
            .padding(20)
        }
    }
}
