import SwiftUI
import WidgetKit
#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(AppIntents)
import AppIntents
#endif

private let eosFloor = Color(red: 7 / 255, green: 11 / 255, blue: 20 / 255)
private let eosVolt = Color(red: 200 / 255, green: 1, blue: 0)

struct GlanceEntry: TimelineEntry {
    let date: Date
    let snapshot: GlanceSnapshot
}

struct GlanceProvider: TimelineProvider {
    func placeholder(in context: Context) -> GlanceEntry {
        GlanceEntry(date: Date(), snapshot: .idle)
    }

    func getSnapshot(in context: Context, completion: @escaping (GlanceEntry) -> Void) {
        completion(GlanceEntry(date: Date(), snapshot: GlanceSharedStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GlanceEntry>) -> Void) {
        let snap = GlanceSharedStore.load()
        let minutes = WidgetTimelinePolicy.reloadMinutes(isLive: snap.isLive)
        let next = Date().addingTimeInterval(TimeInterval(minutes * 60))
        completion(Timeline(entries: [GlanceEntry(date: Date(), snapshot: snap)], policy: .after(next)))
    }
}

struct GlanceCard: View {
    let kicker: String
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(kicker)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(eosVolt)
            Text(title)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .minimumScaleFactor(0.7)
            Text(subtitle)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(.white.opacity(0.72))
                .minimumScaleFactor(0.8)
            Spacer(minLength: 0)
        }
        .padding(14)
        .containerBackground(for: .widget) { eosFloor }
    }
}

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectToday", provider: GlanceProvider()) { entry in
            let snap = GlancePrivacy.redact(entry.snapshot, surface: .widget, defaults: GlanceSharedStore.defaults())
            GlanceCard(kicker: "TODAY", title: snap.sport, subtitle: "\(snap.durationMin) min · UP NEXT \(snap.nextAction)")
                .widgetURL(URL(string: FitDeepLink.train))
        }
        .configurationDisplayName("Today")
        .description("Today's training at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct TrainWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectTrain", provider: GlanceProvider()) { entry in
            let snap = entry.snapshot
            GlanceCard(kicker: "TRAIN", title: snap.title, subtitle: "\(snap.sport) · \(snap.durationMin) min")
                .widgetURL(URL(string: FitDeepLink.train))
        }
        .configurationDisplayName("TRAIN")
        .description("Open the recommended session.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct RecoveryWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectRecovery", provider: GlanceProvider()) { entry in
            let snap = GlancePrivacy.redact(entry.snapshot, surface: .widget, defaults: GlanceSharedStore.defaults())
            let value = snap.recoveryHRV == "HIDDEN" ? "HIDDEN" : snap.recoveryHRV
            GlanceCard(kicker: "RECOVERY", title: value, subtitle: "Sleep \(snap.recoverySleep)")
                .widgetURL(URL(string: FitDeepLink.recovery))
        }
        .configurationDisplayName("Recovery")
        .description("Real recovery only. Missing stays missing.")
        .supportedFamilies([.systemSmall])
    }
}

struct ProgressWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectProgress", provider: GlanceProvider()) { entry in
            let snap = entry.snapshot
            GlanceCard(kicker: "PROGRESS", title: snap.xp == 0 ? "No XP yet" : "\(snap.xp) XP", subtitle: snap.streak == 0 ? "No streak" : "Streak \(snap.streak)")
                .widgetURL(URL(string: FitDeepLink.ascend))
        }
        .configurationDisplayName("Progress")
        .description("Persisted XP and streak only.")
        .supportedFamilies([.systemSmall])
    }
}

struct MartialArtsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectMartialArts", provider: GlanceProvider()) { entry in
            let snap = entry.snapshot
            let title = snap.kind == "fight" ? snap.title : "Fight Mode"
            GlanceCard(kicker: "MARTIAL ARTS", title: title, subtitle: snap.roundLabel.isEmpty ? "Open catalog" : snap.roundLabel)
                .widgetURL(URL(string: FitDeepLink.martialArts))
        }
        .configurationDisplayName("Martial Arts")
        .description("Next fight-mode session.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct CoachWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectCoach", provider: GlanceProvider()) { entry in
            GlanceCard(kicker: "COACH", title: entry.snapshot.coachNext, subtitle: "No athlete health on this surface")
                .widgetURL(URL(string: FitDeepLink.coach))
        }
        .configurationDisplayName("Coach")
        .description("Next booking. Never private athlete health.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct DeviceWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "FitConnectDevice", provider: GlanceProvider()) { entry in
            GlanceCard(kicker: "DEVICE", title: entry.snapshot.deviceStatus, subtitle: "Sync \(entry.snapshot.syncStatus)")
                .widgetURL(URL(string: FitDeepLink.connections))
        }
        .configurationDisplayName("Device")
        .description("Watch, HealthKit and other connections.")
        .supportedFamilies([.systemSmall])
    }
}

struct TrainLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TrainLiveAttributes.self) { context in
            lockScreen(context.state)
        } dynamicIsland: { context in
            let compact = TrainLivePresentation.islandCompact(phase: context.state.phase, clock: context.state.clock)
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(compact.leading)
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundStyle(eosVolt)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(compact.trailing)
                        .font(.system(size: 22, weight: .bold, design: .monospaced))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(context.state.roundLabel)
                        Text(context.state.nextAction)
                            .foregroundStyle(.secondary)
                        liveButtons(phase: context.state.phase)
                    }
                    .font(.caption)
                }
            } compactLeading: {
                Text(compact.leading).font(.caption.weight(.semibold)).foregroundStyle(eosVolt)
            } compactTrailing: {
                Text(compact.trailing).font(.caption.monospacedDigit())
            } minimal: {
                Text(String(compact.leading.prefix(1)))
            }
        }
    }

    @ViewBuilder
    private func lockScreen(_ state: TrainLiveAttributes.ContentState) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(state.title)
                .font(.system(size: 13, weight: .semibold, design: .monospaced))
                .foregroundStyle(eosVolt)
            Text(state.clock)
                .font(.system(size: 34, weight: .bold, design: .monospaced))
            Text([state.roundLabel, state.nextAction].filter { !$0.isEmpty }.joined(separator: " · "))
                .font(.caption)
                .foregroundStyle(.secondary)
            if state.heartRateLabel != "HIDDEN" {
                Text("HR \(state.heartRateLabel)")
                    .font(.caption2)
            }
            liveButtons(phase: state.phase)
        }
        .padding(16)
        .activityBackgroundTint(eosFloor)
        .activitySystemActionForegroundColor(.white)
    }

    @ViewBuilder
    private func liveButtons(phase: String) -> some View {
        #if canImport(AppIntents)
        HStack {
            if phase.uppercased() == "PAUSED" || phase.uppercased() == "INTERRUPTED" {
                Button(intent: ResumeTrainIntent()) { Text("Resume") }
            } else {
                Button(intent: PauseTrainIntent()) { Text("Pause") }
            }
            if phase.uppercased() == "REST" {
                Button(intent: SkipRestIntent()) { Text("Skip rest") }
            }
            Button(intent: OpenTrainIntent()) { Text("Open") }
        }
        .tint(eosVolt)
        #endif
    }
}

@main
struct FitConnectWidgets: WidgetBundle {
    var body: some Widget {
        TodayWidget()
        TrainWidget()
        RecoveryWidget()
        ProgressWidget()
        MoreFitConnectWidgets()
    }
}

struct MoreFitConnectWidgets: WidgetBundle {
    var body: some Widget {
        MartialArtsWidget()
        CoachWidget()
        DeviceWidget()
        TrainLiveActivityWidget()
    }
}
