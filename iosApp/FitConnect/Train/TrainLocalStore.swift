import Foundation

struct PersistedTrainSession: Codable, Equatable {
    var sessionId: String
    var planId: String
    var phase: String
    var elapsedSec: Int
    var sets: Int
    var saveStatus: String
    var updatedAt: TimeInterval
}

enum TrainLocalStore {
    static let key = "fitconnect.train.sessions"

    static func load() -> [PersistedTrainSession] {
        guard let data = UserDefaults.standard.data(forKey: key),
              let rows = try? JSONDecoder().decode([PersistedTrainSession].self, from: data)
        else { return [] }
        return rows
    }

    static func upsert(_ row: PersistedTrainSession) {
        var rows = load().filter { $0.sessionId != row.sessionId }
        rows.insert(row, at: 0)
        if let data = try? JSONEncoder().encode(rows.prefix(50).map { $0 }) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}

enum SyncStatus: String {
    case synced
    case pending
    case retry
    case failed
}

struct TrainSyncQueue {
    private(set) var pending: [PersistedTrainSession] = TrainLocalStore.load().filter {
        $0.saveStatus == SaveStatus.savePending.rawValue || $0.saveStatus == SaveStatus.failed.rawValue
    }

    mutating func enqueue(_ session: PersistedTrainSession) {
        pending.removeAll { $0.sessionId == session.sessionId }
        pending.append(session)
        TrainLocalStore.upsert(session)
    }

    func status(for sessionId: String) -> SyncStatus {
        guard let row = TrainLocalStore.load().first(where: { $0.sessionId == sessionId }) else {
            return .pending
        }
        switch row.saveStatus {
        case SaveStatus.saved.rawValue: return .synced
        case SaveStatus.failed.rawValue: return .failed
        case SaveStatus.localOnly.rawValue: return .retry
        default: return .pending
        }
    }
}
