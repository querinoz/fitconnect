import Foundation

#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif
#if canImport(BackgroundTasks)
import BackgroundTasks
#endif

enum TrainLiveActivityController {
    static func sync(snapshot: GlanceSnapshot) {
        let defaults = GlanceSharedStore.defaults()
        let redacted = GlancePrivacy.redact(snapshot, surface: .liveActivity, defaults: defaults)
        GlanceSharedStore.save(snapshot)
        #if canImport(WidgetKit)
        WidgetCenter.shared.reloadAllTimelines()
        #endif
        #if canImport(ActivityKit)
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        let state = TrainLiveAttributes.ContentState(
            phase: redacted.phase,
            remainingSec: redacted.remainingSec,
            roundLabel: redacted.roundLabel,
            nextAction: redacted.nextAction,
            heartRateLabel: redacted.heartRateLabel,
            title: redacted.title,
            clock: redacted.clock
        )
        let content = ActivityContent(state: state, staleDate: Date().addingTimeInterval(120))
        if snapshot.isLive {
            if let activity = Activity<TrainLiveAttributes>.activities.first {
                Task { await activity.update(content) }
            } else {
                let attrs = TrainLiveAttributes(sessionId: snapshot.sessionId, kind: snapshot.kind)
                _ = try? Activity.request(attributes: attrs, content: content)
            }
        } else {
            Task {
                for activity in Activity<TrainLiveAttributes>.activities {
                    await activity.end(content, dismissalPolicy: .immediate)
                }
            }
        }
        #endif
    }
}

enum FitBackgroundRefresh {
    static let identifier = "com.fitconnect.ios.refresh"

    static func register() {
        #if canImport(BackgroundTasks)
        BGTaskScheduler.shared.register(forTaskWithIdentifier: identifier, using: nil) { task in
            schedule()
            #if canImport(WidgetKit)
            WidgetCenter.shared.reloadAllTimelines()
            #endif
            task.setTaskCompleted(success: true)
        }
        #endif
    }

    static func schedule() {
        #if canImport(BackgroundTasks)
        let request = BGAppRefreshTaskRequest(identifier: identifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 60 * 60)
        try? BGTaskScheduler.shared.submit(request)
        #endif
    }
}
