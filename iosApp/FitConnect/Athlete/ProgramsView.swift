import SwiftUI

struct AthleteProgramsView: View {
    let programs: [ProgramSummary]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Programs stay athlete-specific and local to this demo shell.")
                ForEach(programs) { program in
                    ProgramCard(program: program)
                }
            }
            .padding(20)
        }
        .navigationTitle("Programs")
    }
}
