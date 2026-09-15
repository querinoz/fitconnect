import SwiftUI

struct AthleteWorkoutView: View {
    let programs: [ProgramSummary]
    @State private var snapshot = TrainSessionSnapshot.idle

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Train is the primary athlete action in Path A, not a fifth tab. Heart rate stays blank without HealthKit authorization.")

                GlassCard(accent: .voltline) {
                    Text(snapshot.phase.rawValue.uppercased())
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(snapshot.plan?.title ?? "Select a session")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text(snapshot.plan?.purpose ?? "Catalog sessions only. No invented calories, HRV, or readiness.")
                        .foregroundStyle(EosColors.textSecondary)

                    if snapshot.phase == .idle {
                        ForEach(TrainReducer.catalog) { plan in
                            Button(plan.title) {
                                snapshot = TrainReducer.reduce(snapshot, .select(plan))
                            }
                            .font(.headline)
                            .foregroundStyle(EosColors.floor)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity)
                            .background(Capsule().fill(EosColors.trainGradient))
                            .buttonStyle(.plain)
                        }
                    }

                    if snapshot.phase == .prep {
                        Button("Start session") {
                            snapshot = TrainReducer.reduce(snapshot, .start)
                        }
                        .font(.headline)
                        .foregroundStyle(EosColors.floor)
                        .padding(.vertical, 12)
                        .frame(maxWidth: .infinity)
                        .background(Capsule().fill(EosColors.trainGradient))
                        .buttonStyle(.plain)
                    }

                    if snapshot.phase == .active || snapshot.phase == .warmup {
                        Text("Work block. HealthKit HR appears only after authorization on a signed iOS device.")
                            .foregroundStyle(EosColors.textSecondary)
                        Button("Interrupt") { snapshot = TrainReducer.reduce(snapshot, .interrupt) }
                        Button("Finish") { snapshot = TrainReducer.reduce(snapshot, .finish) }
                    }

                    if snapshot.phase == .interrupted {
                        Button("Resume") { snapshot = TrainReducer.reduce(snapshot, .resume) }
                        Button("Finish") { snapshot = TrainReducer.reduce(snapshot, .finish) }
                    }

                    if snapshot.phase == .completing {
                        Text("Session kept locally until iOS persistence is signed.")
                        Button("Back to catalog") { snapshot = TrainReducer.reduce(snapshot, .reset) }
                    }
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
