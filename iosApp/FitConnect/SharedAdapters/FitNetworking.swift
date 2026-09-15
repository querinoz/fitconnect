import Foundation
#if canImport(Security)
import Security
#endif

enum KeychainStore {
    static let service = "com.fitconnect.ios"

    @discardableResult
    static func set(_ value: String, account: String) -> Bool {
        guard let data = value.data(using: .utf8) else { return false }
        delete(account: account)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data
        ]
        return SecItemAdd(query as CFDictionary, nil) == errSecSuccess
    }

    static func get(account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    @discardableResult
    static func delete(account: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }
}

enum FitAPIError: Equatable {
    case notConfigured
    case unauthorized
    case unavailable
    case timeout
    case server(Int)
}

struct FitAPIClient {
    var baseURL: URL?
    var tokenProvider: () -> String?

    func get(_ path: String) async -> Result<Data, FitAPIError> {
        guard let baseURL else { return .failure(.notConfigured) }
        guard let url = URL(string: path, relativeTo: baseURL) else { return .failure(.notConfigured) }
        var request = URLRequest(url: url)
        request.timeoutInterval = 15
        if let token = tokenProvider() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            if code == 401 { return .failure(.unauthorized) }
            if code == 503 { return .failure(.unavailable) }
            if code >= 500 { return .failure(.server(code)) }
            if code == 0 { return .failure(.timeout) }
            return .success(data)
        } catch {
            return .failure(.unavailable)
        }
    }
}

enum FitFeatureFlag {
    static var localDemo: Bool { AppSessionStore.localDemoAllowed }
    static var healthKitLive: Bool { true }
    static var combatDevMock: Bool {
        ProcessInfo.processInfo.environment["COMBAT_ALLOW_DEV_MOCK"] == "true"
    }
}

enum AnalyticsBoundary {
    static func allowed(_ event: String, containsHealth: Bool, healthSharing: Bool) -> Bool {
        if containsHealth && !healthSharing { return false }
        return !event.isEmpty
    }
}
