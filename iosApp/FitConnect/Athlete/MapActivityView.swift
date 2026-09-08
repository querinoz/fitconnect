import SwiftUI

struct AthleteMapActivityView: View {
    let snapshot: ActivityMapSnapshot

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Map content is rendered as a local route preview so the screen is functional without MapKit setup.")

                GlassCard(accent: .telemetry) {
                    Text(snapshot.title)
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("\(snapshot.distance) / \(snapshot.duration) / \(snapshot.elevation)")
                        .foregroundStyle(EosColors.textSecondary)

                    RouteCanvas(points: snapshot.points)
                        .frame(height: 220)
                }

                ForEach(snapshot.callouts) { callout in
                    GlassCard(accent: callout.accent) {
                        Label(callout.title, systemImage: callout.systemImage)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(callout.detail)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Map Activity")
    }
}

private struct RouteCanvas: View {
    let points: [RoutePoint]

    var body: some View {
        Canvas { context, size in
            guard let first = points.first else { return }
            var path = Path()
            path.move(to: CGPoint(x: first.x * size.width, y: first.y * size.height))
            for point in points.dropFirst() {
                path.addLine(to: CGPoint(x: point.x * size.width, y: point.y * size.height))
            }
            context.stroke(path, with: .color(EosColors.telemetry), style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))
        }
        .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(EosColors.surfaceRaised))
    }
}
