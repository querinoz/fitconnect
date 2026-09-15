import SwiftUI

struct CoachRevenueView: View {
    let metrics: [DashboardMetric]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Payouts stay NOT CONNECTED until Stripe Connect is configured. No fake EUR.")
                ForEach(metrics.filter { $0.id == "revenue" || $0.id == "bookings" }) { metric in
                    BentoMetric(metric: metric)
                }
            }
            .padding(20)
        }
        .navigationTitle("Revenue")
    }
}
