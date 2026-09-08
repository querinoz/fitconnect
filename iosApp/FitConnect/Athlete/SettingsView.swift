import SwiftUI

struct AthleteSettingsView: View {
    let sections: [SettingsSectionModel]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                LocalDemoBanner(note: "Settings expose real local toggles and honest build-status copy.")
                SettingsForm(sections: sections)
            }
            .padding(20)
        }
        .navigationTitle("Settings")
    }
}
