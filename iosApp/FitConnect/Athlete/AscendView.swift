import SwiftUI

struct AthleteAscendView: View {
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .voltline) {
                    Text("ASCEND")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Progression from completed work.")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("XP stays at 0 until a session is saved for this identity. Combat XP is never inferred from Apple Watch acceleration.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                HStack(spacing: 12) {
                    stat("XP", "0")
                    stat("Streak", "0")
                    stat("Sessions", "\(TrainLocalStore.load().count)")
                }

                NeoControl(title: "Open TRAIN", subtitle: "Earn progression by finishing a real session.", systemImage: "figure.run", accent: .voltline) {
                    onNavigate(.workout)
                }
            }
            .padding(20)
        }
        .accessibilityIdentifier("athlete-ascend")
    }

    private func stat(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(EosColors.textPrimary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(EosColors.surfaceRaised))
    }
}
