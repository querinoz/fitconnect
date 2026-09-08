import SwiftUI

struct ProgramCard: View {
    let program: ProgramSummary

    var body: some View {
        GlassCard(accent: program.accent) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(program.title)
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(program.focus)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Coach: \(program.coach) / \(program.duration)")
                        .font(.caption)
                        .foregroundStyle(EosColors.muted)
                }
                Spacer(minLength: 12)
                Text("\(Int(program.progress * 100))%")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(program.accent.color)
            }

            ProgressView(value: program.progress)
                .tint(program.accent.color)
        }
    }
}
