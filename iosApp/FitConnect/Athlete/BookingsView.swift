import SwiftUI

struct AthleteBookingsView: View {
    let bookings: [BookingSummary]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Bookings are athlete-facing here so consults and check-ins are not lost behind coach-only navigation.")
                ForEach(bookings) { booking in
                    BookingCard(booking: booking)
                }
            }
            .padding(20)
        }
        .navigationTitle("Bookings")
    }
}
