import SwiftUI

struct AthleteWorkoutView: View {
    let programs: [ProgramSummary]
    @State private var queuedWarmup = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Train is the primary athlete action in Path A, not a fifth tab.")

                GlassCard(accent: .voltline) {
                    Text("WORKOUT")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Threshold set with progressive cadence lift")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Warm-up 12m / Main set 3 x 8m / Cooldown 10m")
                        .foregroundStyle(EosColors.textSecondary)
                    Button(queuedWarmup ? "Warm-up queued" : "Queue warm-up locally") {
                        queuedWarmup.toggle()
                    }
                    .font(.headline)
                    .foregroundStyle(EosColors.floor)
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity)
                    .background(Capsule().fill(EosColors.trainGradient))
                    .buttonStyle(.plain)
                }

                ForEach(programs) { program in
                    ProgramCard(program: program)
                }
            }
            .padding(20)
        }
        .navigationTitle("Workout")
    }
}
