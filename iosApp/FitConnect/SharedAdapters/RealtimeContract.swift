import Foundation

struct RealtimeSnapshot: Identifiable, Hashable {
    let id: String
    let channel: String
    let freshness: String
    let listeners: Int
}

protocol RealtimeContract {
    func channelSnapshots() async -> [RealtimeSnapshot]
}
import Foundation

protocol RealtimeContract {
    var statusLabel: String { get }
    var latencyLabel: String { get }
    var accent: EosAccent { get }
}

struct LocalDemoRealtime: RealtimeContract {
    let statusLabel = "Live telemetry link"
    let latencyLabel = "42 ms local relay"
    let accent = EosAccent.telemetry
}
