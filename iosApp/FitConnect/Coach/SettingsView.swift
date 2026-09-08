import SwiftUI

struct CoachSettingsView: View {
    let sections: [SettingsSectionModel]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Settings carry the honest macOS build caveat and coach workflow toggles.")
                SettingsForm(sections: sections)
            }
            .padding(20)
        }
        .navigationTitle("Settings")
    }
}
