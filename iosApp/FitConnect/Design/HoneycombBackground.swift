import SwiftUI

struct HoneycombBackground: View {
    let accent: Color

    init(accent: Color = EosColors.voltline) {
        self.accent = accent
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [EosColors.floor, EosColors.floor.opacity(0.96), Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Canvas { context, size in
                let hexRadius: CGFloat = 24
                let xStep = hexRadius * 1.7
                let yStep = hexRadius * 1.5

                for row in stride(from: 0.0, through: size.height + yStep, by: yStep) {
                    for column in stride(from: 0.0, through: size.width + xStep, by: xStep) {
                        let offset = Int(row / yStep).isMultiple(of: 2) ? 0.0 : xStep / 2
                        let center = CGPoint(x: column + offset, y: row)
                        let path = hexagonPath(center: center, radius: hexRadius)
                        context.stroke(
                            path,
                            with: .color(accent.opacity(0.08)),
                            lineWidth: 0.7
                        )
                    }
                }
            }

            RadialGradient(
                colors: [EosColors.telemetry.opacity(0.14), .clear],
                center: .topTrailing,
                startRadius: 40,
                endRadius: 320
            )
            .blur(radius: 8)
        }
        .ignoresSafeArea()
    }

    private func hexagonPath(center: CGPoint, radius: CGFloat) -> Path {
        Path { path in
            for index in 0..<6 {
                let angle = CGFloat(index) * (.pi / 3) - (.pi / 6)
                let point = CGPoint(
                    x: center.x + cos(angle) * radius,
                    y: center.y + sin(angle) * radius
                )
                if index == 0 {
                    path.move(to: point)
                } else {
                    path.addLine(to: point)
                }
            }
            path.closeSubpath()
        }
    }
}
import SwiftUI

struct HoneycombBackground: View {
    var accent: EosAccent = .voltline

    var body: some View {
        ZStack {
            EosColors.heroGradient
                .ignoresSafeArea()

            RadialGradient(
                colors: [accent.color.opacity(0.22), .clear],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 320
            )
            .ignoresSafeArea()

            Canvas { context, size in
                let cell = min(size.width, size.height) / 9
                guard cell > 12 else { return }

                let stroke = accent.color.opacity(0.12)
                let rows = Int(size.height / (cell * 0.78)) + 2
                let cols = Int(size.width / cell) + 2

                for row in 0..<rows {
                    for col in 0..<cols {
                        let x = CGFloat(col) * cell + (row.isMultiple(of: 2) ? 0 : cell / 2)
                        let y = CGFloat(row) * cell * 0.78
                        var path = Path()
                        let radius = cell * 0.34
                        for index in 0..<6 {
                            let angle = Angle.degrees(Double(index) * 60 - 30)
                            let point = CGPoint(
                                x: x + cos(angle.radians) * radius,
                                y: y + sin(angle.radians) * radius
                            )
                            if index == 0 {
                                path.move(to: point)
                            } else {
                                path.addLine(to: point)
                            }
                        }
                        path.closeSubpath()
                        context.stroke(path, with: .color(stroke), lineWidth: 1)
                    }
                }
            }
            .ignoresSafeArea()
        }
    }
}
