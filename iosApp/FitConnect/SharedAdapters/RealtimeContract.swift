import Foundation

protocol RealtimeContract {
    var statusLabel: String { get }
    var latencyLabel: String { get }
    var accent: EosAccent { get }
}

struct LocalDemoRealtime: RealtimeContract {
    let statusLabel = "Not connected"
    let latencyLabel = "No live sample"
    let accent = EosAccent.telemetry
}
