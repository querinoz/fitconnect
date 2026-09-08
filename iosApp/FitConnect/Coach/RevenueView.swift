import SwiftUI

struct CoachRevenueView: View {
    let metrics: [DashboardMetric]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Revenue reuses live coach KPIs so the More stack has meaningful depth.")
                ForEach(metrics.filter { $0.id == "revenue" || $0.id == "bookings" }) { metric in
                    BentoMetric(metric: metric)
                }
            }
            .padding(20)
        }
        .navigationTitle("Revenue")
    }
}
