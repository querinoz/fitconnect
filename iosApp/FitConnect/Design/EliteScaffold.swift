import SwiftUI

struct EliteScaffold<Content: View>: View {
    let title: String
    var subtitle: String? = nil
    var sysLabel: String = "FITCONNECT"
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack {
            EosColors.floor.ignoresSafeArea()
            HoneycombBackground()
                .opacity(0.35)
                .ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    EliteZenithHeader(sysLabel: sysLabel, title: title, subtitle: subtitle)
                    LocalDemoBanner()
                    content()
                }
                .padding(16)
            }
        }
    }
}
