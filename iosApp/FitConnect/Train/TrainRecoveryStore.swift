import Foundation

enum TrainRecoveryStore {
    static let key = "fitconnect.train.recovery"

    static func save(_ snapshot: TrainSessionSnapshot) {
        guard snapshot.phase != .idle && snapshot.phase != .complete else {
            clear()
            return
        }
        if let data = try? JSONEncoder().encode(snapshot) {
            GlanceSharedStore.defaults().set(data, forKey: key)
        }
    }

    static func load() -> TrainSessionSnapshot? {
        guard let data = GlanceSharedStore.defaults().data(forKey: key),
              let snap = try? JSONDecoder().decode(TrainSessionSnapshot.self, from: data)
        else { return nil }
        let live: Set<TrainPhase> = [.prep, .warmup, .active, .rest, .warning, .paused, .interrupted, .substituting]
        return live.contains(snap.phase) ? snap : nil
    }

    static func clear() {
        GlanceSharedStore.defaults().removeObject(forKey: key)
    }
}
