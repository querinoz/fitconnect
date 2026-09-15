import SwiftUI

struct AthleteFeedView: View {
    var onNavigate: (AthleteRoute) -> Void
    @State private var loadState: String = "empty"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                FitCard(accent: .iris) {
                    Text("FEED")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Squad, not a metrics dashboard.")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Strava activities never appear here. Heart rate, HRV, sleep and impact stay off the social surface unless you explicitly share them.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                if loadState == "offline" {
                    FitErrorState(
                        title: "Feed unavailable",
                        detail: "Network failed. Nothing was published.",
                        retry: { loadState = "empty" }
                    )
                } else {
                    FitEmptyState(
                        title: "No squad posts yet",
                        detail: "An empty feed is honest. Posts appear only after persistence succeeds."
                    )
                }

                NeoControl(title: "Messages", subtitle: "Coach threads stay in inbox. Publication is never faked.", systemImage: "message", accent: .telemetry) {
                    onNavigate(.messages)
                }
            }
            .padding(20)
            .padding(.bottom, 28)
        }
        .accessibilityIdentifier("athlete-feed")
    }
}
