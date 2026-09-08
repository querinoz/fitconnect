import SwiftUI

struct AthleteNotificationsView: View {
    let items: [AppNotificationItem]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Notifications mirror coach cues, recovery alerts, and offline queue events.")
                ForEach(items) { item in
                    GlassCard(accent: item.accent) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(item.title)
                                    .font(.headline)
                                    .foregroundStyle(EosColors.textPrimary)
                                Text(item.body)
                                    .foregroundStyle(EosColors.textSecondary)
                            }
                            Spacer(minLength: 8)
                            Text(item.timestamp)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(item.accent.color)
                        }
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Notifications")
    }
}
