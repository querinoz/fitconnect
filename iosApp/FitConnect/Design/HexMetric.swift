import SwiftUI

struct HexMetric: View {
    let metric: HexMetricModel

    var body: some View {
        VStack(spacing: 10) {
            ZStack {
                Hexagon()
                    .fill(metric.accent.color.opacity(0.14))
                Hexagon()
                    .stroke(metric.accent.color.opacity(0.46), lineWidth: 1.4)
                Text(metric.value)
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundStyle(EosColors.textPrimary)
            }
            .frame(width: 76, height: 76)

            Text(metric.label.uppercased())
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(metric.label) \(metric.value)")
    }
}

private struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) * 0.42
        for index in 0..<6 {
            let angle = Angle.degrees(Double(index) * 60 - 30)
            let point = CGPoint(
                x: center.x + cos(angle.radians) * radius,
                y: center.y + sin(angle.radians) * radius
            )
            if index == 0 {
                path.move(to: point)
            } else {
                path.addLine(to: point)
            }
        }
        path.closeSubpath()
        return path
    }
}
