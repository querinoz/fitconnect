import Foundation

enum McpClientBoundary {
    static let gatewayPath = "/api/v1/mcp"
    static let arbitraryExternalToolsAllowed = false

    static func toolAllowed(_ name: String, catalog: Set<String>) -> Bool {
        catalog.contains(name)
    }
}

enum CombatMLPipeline {
    static let prototypeModelId = "fitconnect.combat.technique.unvalidated"
    static let productionValidated = false

    static func evaluate(predictions: [Bool], labels: [Bool]) -> (precision: Double, recall: Double, f1: Double)? {
        guard predictions.count == labels.count, !labels.isEmpty else { return nil }
        var tp = 0, fp = 0, fn = 0
        for (p, y) in zip(predictions, labels) {
            if p && y { tp += 1 }
            else if p && !y { fp += 1 }
            else if !p && y { fn += 1 }
        }
        let precision = tp + fp == 0 ? 0 : Double(tp) / Double(tp + fp)
        let recall = tp + fn == 0 ? 0 : Double(tp) / Double(tp + fn)
        let f1 = precision + recall == 0 ? 0 : 2 * precision * recall / (precision + recall)
        return (precision, recall, f1)
    }
}
