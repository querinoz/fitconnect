import SwiftUI

struct BookingCard: View {
    let booking: DemoCatalog.Booking
    let accent: Color

    init(booking: DemoCatalog.Booking, accent: Color = EosColors.telemetry) {
        self.booking = booking
        self.accent = accent
    }

    var body: some View {
        GlassCard(accent: accent) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(booking.title)
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(booking.counterpart)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                }
                Spacer()
                StatusChip(title: booking.time, accent: accent)
            }

            DetailRow(label: "Location", value: booking.location)
            Text(booking.notes)
                .font(.subheadline)
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}
import SwiftUI

struct BookingCard: View {
    let booking: BookingSummary

    var body: some View {
        GlassCard(accent: booking.accent) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(booking.title)
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(booking.time)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(booking.accent.color)
                    Text(booking.location)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                }
                Spacer(minLength: 12)
                Text(booking.status.uppercased())
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(EosColors.textPrimary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(booking.accent.color.opacity(0.18), in: Capsule())
            }
        }
    }
}
