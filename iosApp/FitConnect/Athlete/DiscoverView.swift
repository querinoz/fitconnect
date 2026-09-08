import SwiftUI

struct AthleteDiscoverView: View {
    let cards: [FeatureHighlight]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Discover is a deeper editorial read of the same athlete analysis surface.")
                GlassCard(accent: .telemetry) {
                    Text("DISCOVER")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("New performance angles")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("This screen gives Path A a real downstream destination from Home and Analysis instead of a dead-end stub.")
                        .foregroundStyle(EosColors.textSecondary)
                }
                ForEach(cards) { card in
                    GlassCard(accent: card.accent) {
                        Label(card.title, systemImage: card.systemImage)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(card.detail)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Discover")
    }
}
