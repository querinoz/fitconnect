import SwiftUI

struct LocalDemoBanner: View {
    var note: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "bolt.badge.clock")
                .foregroundStyle(EosColors.voltline)
            VStack(alignment: .leading, spacing: 2) {
                Text("LOCAL_DEMO")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(EosColors.voltline)
                Text(note)
                    .font(.footnote)
                    .foregroundStyle(EosColors.textSecondary)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(EosColors.surfaceRaised))
        .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(EosColors.voltline.opacity(0.22), lineWidth: 1))
    }
}
