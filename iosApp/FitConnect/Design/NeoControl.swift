import SwiftUI

struct NeoControl: View {
    let title: String
    let subtitle: String
    let systemImage: String
    var accent: EosAccent = .voltline
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: systemImage)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(accent.color)
                    .frame(width: 42, height: 42)
                    .background(Circle().fill(EosColors.surfaceRaised))
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                        .lineLimit(2)
                }
                Spacer(minLength: 0)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(EosColors.surfaceRaised))
            .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(accent.color.opacity(0.24), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}
