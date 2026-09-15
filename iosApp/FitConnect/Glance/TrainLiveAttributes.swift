import Foundation

#if canImport(ActivityKit)
import ActivityKit
#endif

struct TrainLiveAttributes: Codable, Hashable {
    var sessionId: String
    var kind: String

    struct ContentState: Codable, Hashable {
        var phase: String
        var remainingSec: Int
        var roundLabel: String
        var nextAction: String
        var heartRateLabel: String
        var title: String
        var clock: String
    }
}

#if canImport(ActivityKit)
extension TrainLiveAttributes: ActivityAttributes {}
#endif

enum TrainLivePresentation {
    static func islandCompact(phase: String, clock: String) -> (leading: String, trailing: String) {
        switch phase.uppercased() {
        case "REST":
            return ("REST", clock)
        case "WARNING":
            return ("WARN", clock)
        case "PAUSED", "INTERRUPTED":
            return ("PAUSE", clock)
        case "COMPLETING", "COMPLETE", "COMPLETED":
            return ("DONE", clock)
        default:
            return ("TRAIN", clock)
        }
    }
}
