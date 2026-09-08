import SwiftUI

struct BentoMetric: View {
    let title: String
    let value: String
    let delta: String
    let accent: Color

    init(title: String, value: String, delta: String, accent: Color = EosColors.voltline) {
        self.title = title
        self.value = value
        self.delta = delta
        self.accent = accent
    }

    var body: some View {
        GlassCard(accent: accent) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundStyle(accent)
            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(EosColors.textPrimary)
            Text(delta)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}
import SwiftUI

struct BentoMetric: View {
    let metric: DashboardMetric

    var body: some View {
        GlassCard(accent: metric.accent, padding: 16) {
            Text(metric.title.uppercased())
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(metric.value)
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .foregroundStyle(EosColors.textPrimary)
            Text(metric.change)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(metric.accent.color)
            Text(metric.detail)
                .font(.footnote)
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}
