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
