import Foundation

protocol OfflineQueueContract {
    var pendingCount: Int { get }
    var statusCopy: String { get }
}

struct LocalDemoOfflineQueue: OfflineQueueContract {
    let pendingCount = 2
    let statusCopy = "Actions stay editable offline and queue for later sync."
}
