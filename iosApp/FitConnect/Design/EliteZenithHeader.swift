import SwiftUI

struct EliteZenithHeader: View {
    let sysLabel: String
    let title: String
    var subtitle: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(sysLabel.uppercased())
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(EosColors.voltline)
                Spacer()
            }
            Text(title)
                .font(.title2.bold())
                .foregroundStyle(EosColors.textPrimary)
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(EosColors.textSecondary)
            }
            HoneycombDividerLine()
        }
        .padding(.bottom, 4)
        .accessibilityElement(children: .combine)
    }
}

struct HoneycombDividerLine: View {
    var body: some View {
        Rectangle()
            .fill(EosColors.voltline.opacity(0.28))
            .frame(height: 1)
            .overlay(
                Hexagon()
                    .stroke(EosColors.voltline.opacity(0.45), lineWidth: 1)
                    .frame(width: 10, height: 10)
            )
    }
}

private struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let c = CGPoint(x: rect.midX, y: rect.midY)
        let r = min(rect.width, rect.height) / 2
        for i in 0..<6 {
            let a = CGFloat(i) * .pi / 3 - .pi / 2
            let p = CGPoint(x: c.x + cos(a) * r, y: c.y + sin(a) * r)
            if i == 0 { path.move(to: p) } else { path.addLine(to: p) }
        }
        path.closeSubpath()
        return path
    }
}
