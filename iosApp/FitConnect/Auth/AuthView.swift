import SwiftUI

struct AuthView: View {
    @Bindable var session: DemoSessionStore
    let services: AppServices

    var body: some View {
        ZStack {
            HoneycombBackground(accent: .iris)

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("FitConnect")
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                            .foregroundStyle(EosColors.textPrimary)
                        Text(services.auth.headline(for: session.role))
                            .font(.title3)
                            .foregroundStyle(EosColors.textSecondary)
                    }

                    LocalDemoBanner(note: "Path A boots local SwiftUI flows only. Expo is archived and external physical iOS builds remain blocked.")

                    GlassCard(accent: .voltline) {
                        Text("ATHLETE INTELLIGENCE")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundStyle(EosColors.textSecondary)
                        Text("Mirror the Android feature surface with real SwiftUI destinations, local demo data, and honest integration boundaries.")
                            .font(.headline)
                            .foregroundStyle(EosColors.textPrimary)
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(DemoCatalog.athleteDashboard.metrics) { metric in
                                    HexMetric(metric: metric)
                                }
                            }
                        }
                    }

                    VStack(spacing: 14) {
                        roleButton(for: .athlete, subtitle: "Open Today, Analysis, Vault, Profile and the Train action.")
                        roleButton(for: .coach, subtitle: "Open Overview, Athletes, Calendar, Inbox and More.")
                    }
                }
                .padding(20)
            }
        }
    }

    private func roleButton(for role: AppRole, subtitle: String) -> some View {
        Button {
            session.signIn(as: role)
        } label: {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: role == .athlete ? "figure.run" : "person.3")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(role.accent.color)
                    .frame(width: 46, height: 46)
                    .background(Circle().fill(EosColors.surfaceRaised))
                VStack(alignment: .leading, spacing: 4) {
                    Text("Continue as \(role.title)")
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(EosColors.textSecondary)
                }
                Spacer(minLength: 0)
                Image(systemName: "arrow.right")
                    .foregroundStyle(EosColors.textSecondary)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(EosColors.surfaceRaised))
            .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(role.accent.color.opacity(0.24), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}
