import SwiftUI

struct AthleteAnalysisView: View {
    let cards: [FeatureHighlight]
    let zones: [ZoneSlice]
    var onNavigate: (AthleteRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "LOCAL_DEMO analysis mirrors the Android Discover and telemetry surfaces.")

                GlassCard(accent: .telemetry) {
                    Text("ANALYSIS")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Workload is trending high, but freshness recovers on time.")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Use the editorial cards below as the SwiftUI equivalent of the Android insight surface.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                ForEach(cards) { card in
                    GlassCard(accent: card.accent) {
                        Label(card.title, systemImage: card.systemImage)
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        Text(card.detail)
                            .font(.subheadline)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }

                GlassCard(accent: .iris) {
                    Text("ZONE BREAKDOWN")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    ForEach(zones) { zone in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(zone.name)
                                    .foregroundStyle(EosColors.textPrimary)
                                Spacer()
                                Text(zone.duration)
                                    .foregroundStyle(zone.accent.color)
                            }
                            GeometryReader { geometry in
                                Capsule()
                                    .fill(EosColors.surfaceRaised)
                                    .overlay(alignment: .leading) {
                                        Capsule()
                                            .fill(zone.accent.color)
                                            .frame(width: max(geometry.size.width * zone.share, 24))
                                    }
                            }
                            .frame(height: 8)
                        }
                    }
                }

                HStack(spacing: 12) {
                    actionCard(title: "Telemetry", systemImage: "waveform.path.ecg", accent: .telemetry) { onNavigate(.telemetry) }
                    actionCard(title: "Map", systemImage: "map", accent: .voltline) { onNavigate(.map) }
                }
            }
            .padding(20)
            .padding(.bottom, 132)
        }
    }

    private func actionCard(title: String, systemImage: String, accent: EosAccent, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: systemImage)
                    .foregroundStyle(accent.color)
                Text(title)
                    .font(.headline)
                    .foregroundStyle(EosColors.textPrimary)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(EosColors.surfaceRaised))
        }
        .buttonStyle(.plain)
    }
}
