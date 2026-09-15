import SwiftUI

struct FitButton: View {
    enum Kind { case primary, secondary, destructive }
    var title: String
    var kind: Kind = .primary
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .foregroundStyle(foreground)
                .background(background)
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(.isButton)
    }

    private var foreground: Color {
        switch kind {
        case .primary: return EosColors.floor
        case .secondary: return EosColors.textPrimary
        case .destructive: return EosColors.floor
        }
    }

    @ViewBuilder
    private var background: some View {
        switch kind {
        case .primary:
            Capsule().fill(EosColors.trainGradient)
        case .secondary:
            Capsule().stroke(EosColors.stroke, lineWidth: 1)
        case .destructive:
            Capsule().fill(EosColors.alert)
        }
    }
}

struct FitCard<Content: View>: View {
    var accent: EosAccent = .voltline
    @ViewBuilder var content: () -> Content

    var body: some View {
        GlassCard(accent: accent, content: content)
    }
}

struct FitChip: View {
    var title: String
    var accent: EosAccent = .voltline

    var body: some View {
        Text(title)
            .font(.system(size: 11, weight: .medium, design: .monospaced))
            .foregroundStyle(accent.color)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(accent.color.opacity(0.14), in: Capsule())
    }
}

struct FitMetric: View {
    var title: String
    var value: String
    var accent: EosAccent = .telemetry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(EosColors.textPrimary)
                .minimumScaleFactor(0.7)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(accent.color.opacity(0.14)))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title) \(value)")
    }
}

struct FitTimer: View {
    var remainingSec: Int
    var warning: Bool = false

    var body: some View {
        Text(label)
            .font(.system(size: 56, weight: .bold, design: .monospaced))
            .foregroundStyle(warning ? EosColors.alert : EosColors.textPrimary)
            .accessibilityLabel("\(remainingSec) seconds remaining")
            .accessibilityAddTraits(.updatesFrequently)
    }

    private var label: String {
        String(format: "%d:%02d", remainingSec / 60, remainingSec % 60)
    }
}

struct FitEmptyState: View {
    var title: String
    var detail: String

    var body: some View {
        FitCard(accent: .warning) {
            Text("EMPTY")
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(title)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
            Text(detail)
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}

struct FitErrorState: View {
    var title: String
    var detail: String
    var retry: (() -> Void)?

    var body: some View {
        FitCard(accent: .alert) {
            Text("ERROR")
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(title)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
            Text(detail)
                .foregroundStyle(EosColors.textSecondary)
            if let retry {
                FitButton(title: "Retry", kind: .secondary, action: retry)
            }
        }
    }
}

struct FitSuccessState: View {
    var title: String
    var detail: String

    var body: some View {
        FitCard(accent: .success) {
            Text("OK")
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(title)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
            Text(detail)
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}

struct FitSkeleton: View {
    var body: some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(EosColors.surfaceRaised)
            .frame(height: 88)
            .accessibilityLabel("Loading")
    }
}

struct FitProgress: View {
    var value: Double
    var accent: EosAccent = .voltline

    var body: some View {
        ProgressView(value: min(max(value, 0), 1))
            .tint(accent.color)
            .accessibilityValue("\(Int(value * 100)) percent")
    }
}

struct FitStatusBanner: View {
    var title: String = "STATUS"
    var note: String = "Missing data stays missing. Cloud save is never claimed until confirmed."

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "info.circle")
                .foregroundStyle(EosColors.voltline)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
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

typealias LocalDemoBanner = FitStatusBanner
typealias FitDialog = FitErrorState
typealias FitSheet = FitCard
typealias FitTab = FitChip
typealias FitNavigation = FitChip
typealias FitTelemetry = FitMetric
typealias FitChart = FitProgress
