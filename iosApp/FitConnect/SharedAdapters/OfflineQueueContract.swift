import Foundation

struct OfflineQueueItem: Identifiable, Hashable {
    let id: String
    let title: String
    let payloadSummary: String
    let retryWindow: String
}

protocol OfflineQueueContract {
    func pendingOperations() async -> [OfflineQueueItem]
}
import Foundation

protocol OfflineQueueContract {
    var pendingCount: Int { get }
    var statusCopy: String { get }
}

struct LocalDemoOfflineQueue: OfflineQueueContract {
    let pendingCount = 2
    let statusCopy = "Actions stay editable offline and queue for later sync."
}
