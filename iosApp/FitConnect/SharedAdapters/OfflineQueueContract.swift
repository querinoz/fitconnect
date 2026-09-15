import Foundation

protocol OfflineQueueContract {
    var pendingCount: Int { get }
    var statusCopy: String { get }
}

struct LocalDemoOfflineQueue: OfflineQueueContract {
    var pendingCount: Int { TrainLocalStore.load().filter { $0.saveStatus != SaveStatus.saved.rawValue }.count }
    let statusCopy = "Sessions stay on-device until the API confirms save. Pending is never invented."
}
