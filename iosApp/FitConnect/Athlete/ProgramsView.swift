import SwiftUI

struct AthleteProgramsView: View {
    let programs: [ProgramSummary]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                FitStatusBanner(note: "Programs stay empty until the API returns rows for this identity.")
                ForEach(programs) { program in
                    ProgramCard(program: program)
                }
            }
            .padding(20)
        }
        .navigationTitle("Programs")
    }
}
