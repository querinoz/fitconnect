import Foundation
#if canImport(AppIntents)
import AppIntents
#endif

#if canImport(AppIntents)
struct PauseTrainIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Pause"
    static var isDiscoverable: Bool = false
    func perform() async throws -> some IntentResult {
        GlanceSharedStore.enqueue(.pause)
        return .result()
    }
}

struct ResumeTrainIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Resume"
    static var isDiscoverable: Bool = false
    func perform() async throws -> some IntentResult {
        GlanceSharedStore.enqueue(.resume)
        return .result()
    }
}

struct SkipRestIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Skip rest"
    static var isDiscoverable: Bool = false
    func perform() async throws -> some IntentResult {
        GlanceSharedStore.enqueue(.skipRest)
        return .result()
    }
}

struct OpenTrainIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Open TRAIN"
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        return .result()
    }
}
#endif
