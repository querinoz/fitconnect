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
