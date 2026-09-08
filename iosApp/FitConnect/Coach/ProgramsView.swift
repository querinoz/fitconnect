import SwiftUI

struct CoachProgramsView: View {
    let programs: [ProgramSummary]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Programs reflect coach-facing cohort progress rather than athlete-only detail.")
                ForEach(programs) { program in
                    ProgramCard(program: program)
                }
            }
            .padding(20)
        }
        .navigationTitle("Programs")
    }
}
