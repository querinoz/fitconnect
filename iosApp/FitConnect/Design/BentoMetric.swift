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
