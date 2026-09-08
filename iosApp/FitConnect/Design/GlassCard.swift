import SwiftUI

struct GlassCard<Content: View>: View {
    var accent: EosAccent = .voltline
    var padding: CGFloat = 18
    @ViewBuilder var content: Content

    init(accent: EosAccent = .voltline, padding: CGFloat = 18, @ViewBuilder content: () -> Content) {
        self.accent = accent
        self.padding = padding
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            content
        }
        .padding(padding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(EosColors.surface)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(accent.color.opacity(0.28), lineWidth: 1)
        )
        .shadow(color: accent.color.opacity(0.16), radius: 24, x: 0, y: 10)
    }
}
