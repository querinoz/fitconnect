import SwiftUI

struct RecoveryView: View {
    let healthKit: any HealthKitContract

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .success) {
                    Text("RECOVERY")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("What happened · what it means · what to do")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Nothing below is invented. Apple Watch and HealthKit samples appear only after authorization.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                metric("HRV", "MISSING", "No SDNN sample. Do not derive readiness from an empty store.")
                metric("Sleep", "MISSING", "Sleep analysis is a separate HealthKit permission.")
                metric("Resting HR", "MISSING", "Resting heart rate is not estimated from a round timer.")
                metric("Training load", "MISSING", "Load waits for completed sessions with confirmed duration.")

                let auth = healthKit.authorizationModel()
                Text(auth.limitedHistoryNote)
                    .font(.footnote)
                    .foregroundStyle(EosColors.muted)
            }
            .padding(20)
        }
        .navigationTitle("Recovery")
    }

    private func metric(_ title: String, _ value: String, _ meaning: String) -> some View {
        GlassCard(accent: .iris) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(value)
                .font(.title.bold())
                .foregroundStyle(EosColors.textPrimary)
            Text(meaning)
                .foregroundStyle(EosColors.textSecondary)
        }
    }
}

enum WearableConnection: String, CaseIterable, Identifiable {
    case appleHealth = "Apple Health"
    case appleWatch = "Apple Watch"
    case whoop = "WHOOP"
    case oura = "Oura"
    case garmin = "Garmin"
    case strava = "Strava"

    var id: String { rawValue }

    var status: String {
        "NOT CONNECTED"
    }

    var detail: String {
        switch self {
        case .appleHealth:
            return "HealthKit capability is in the iOS target. Authorize per metric on a signed device."
        case .appleWatch:
            return "Companion Watch app uses HKWorkoutSession so an active workout can continue in background."
        case .whoop:
            return "OAuth lives on the server. Recovery is never derived from unsupported webhook fields."
        case .oura:
            return "OAuth + sleep/readiness/activity when tokens exist. Empty otherwise."
        case .garmin:
            return "Partner approval is required. Without it the tile stays NOT CONNECTED."
        case .strava:
            return "Import is private. Strava sessions never enter the social feed."
        }
    }
}

struct ConnectionsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Connect, authorize, sync, disconnect. No fake hardware handshake.")
                    .foregroundStyle(EosColors.textSecondary)
                ForEach(WearableConnection.allCases) { item in
                    GlassCard(accent: .telemetry) {
                        HStack {
                            Text(item.rawValue)
                                .font(.headline)
                                .foregroundStyle(EosColors.textPrimary)
                            Spacer()
                            Text(item.status)
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
                                .foregroundStyle(EosColors.warning)
                        }
                        Text(item.detail)
                            .foregroundStyle(EosColors.textSecondary)
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("Connections")
    }
}

struct ZenithNativeView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .iris) {
                    Text("ZENITH")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Data → context → reasoning → recommendation → action")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text(ZenithIOSContext.briefing(disciplineId: "boxing", presentMetrics: []))
                        .foregroundStyle(EosColors.textSecondary)
                }
                Text("Zenith uses the FitConnect MCP gateway. Arbitrary community tools are not allowed. No health diagnosis.")
                    .foregroundStyle(EosColors.muted)
            }
            .padding(20)
        }
        .navigationTitle("Zenith")
    }
}

struct NativeBookingView: View {
    @State private var draft = BookingDraft(coachId: nil, serviceId: nil, slotIso: nil, phase: .discover, lastError: nil)

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .voltline) {
                    Text("BOOKING")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("Discover → coach → service → calendar → confirm")
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                    Text(draft.lastError ?? "Stripe not configured and the availability database is empty. Confirm will not fake success.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                Button("Select coach (catalog)") {
                    draft = BookingReducer.reduce(draft, selectCoach: "coach-demo")
                    draft.serviceId = "session-60"
                    draft.slotIso = "unavailable"
                }
                .buttonStyle(.plain)
                .foregroundStyle(EosColors.voltline)

                Button("Confirm") {
                    draft = BookingReducer.confirm(draft, stripeConfigured: false, dbConfigured: false)
                }
                .font(.headline)
                .foregroundStyle(EosColors.floor)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Capsule().fill(EosColors.voltline))
                .buttonStyle(.plain)
                .accessibilityIdentifier("booking-confirm")
            }
            .padding(20)
        }
        .navigationTitle("Booking")
    }
}
