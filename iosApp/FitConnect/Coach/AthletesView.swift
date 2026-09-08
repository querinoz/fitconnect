import SwiftUI

struct CoachAthletesView: View {
    let athletes: [AthleteRosterCard]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Athlete roster mirrors the Android coach roster surface with local status cards.")
                ForEach(athletes) { athlete in
                    GlassCard(accent: athlete.accent) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(athlete.name)
                                    .font(.headline)
                                    .foregroundStyle(EosColors.textPrimary)
                                Text(athlete.focus)
                                    .foregroundStyle(EosColors.textSecondary)
                                Text("Next: \(athlete.nextSession)")
                                    .font(.caption)
                                    .foregroundStyle(EosColors.muted)
                            }
                            Spacer(minLength: 12)
                            Text(athlete.status.uppercased())
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
                                .foregroundStyle(athlete.accent.color)
                        }
                    }
                }
            }
            .padding(20)
        }
    }
}
