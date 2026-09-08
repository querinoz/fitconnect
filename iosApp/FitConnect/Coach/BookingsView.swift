import SwiftUI

struct CoachBookingsView: View {
    let bookings: [BookingSummary]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Coach bookings include consults, reviews, and lab sessions.")
                ForEach(bookings) { booking in
                    BookingCard(booking: booking)
                }
            }
            .padding(20)
        }
        .navigationTitle("Bookings")
    }
}
