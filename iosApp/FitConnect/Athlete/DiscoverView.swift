import SwiftUI

struct AthleteDiscoverView: View {
    let cards: [FeatureHighlight]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                FitStatusBanner(note: "Insights appear only from completed sessions and authorized HealthKit samples.")
                if cards.isEmpty {
                    FitEmptyState(title: "No insights yet", detail: "DATA UNAVAILABLE until a session is saved.")
                } else {
                    ForEach(cards) { card in
                        FitCard(accent: card.accent) {
                            Label(card.title, systemImage: card.systemImage)
                                .font(.headline)
                                .foregroundStyle(EosColors.textPrimary)
                            Text(card.detail)
                                .foregroundStyle(EosColors.textSecondary)
                        }
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Discover")
    }
}
