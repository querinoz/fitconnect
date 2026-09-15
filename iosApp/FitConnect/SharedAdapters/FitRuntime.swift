import Foundation

enum FitRuntimeEnvironment: String, Equatable {
    case localDevelopment = "development"
    case localDemo = "local_demo"
    case test = "test"
    case production = "production"
}

enum FitRuntime {
    static let productionAPI = URL(string: "https://fitconnect-phi.vercel.app")!

    static var isDebugBuild: Bool {
        #if DEBUG
        true
        #else
        false
        #endif
    }

    static var isSimulator: Bool {
        #if targetEnvironment(simulator)
        true
        #else
        false
        #endif
    }

    static func environment(
        isDebug: Bool = isDebugBuild,
        localDemoAllowed: Bool = FitRuntime.localDemoAllowed(),
        bundle: Bundle = .main
    ) -> FitRuntimeEnvironment {
        if let raw = bundle.object(forInfoDictionaryKey: "FITCONNECT_ENV") as? String,
           let env = FitRuntimeEnvironment(rawValue: raw) {
            if env == .localDemo && !localDemoAllowed { return .production }
            return env
        }
        if !isDebug { return .production }
        if localDemoAllowed { return .localDemo }
        return .localDevelopment
    }

    static func localDemoAllowed(
        isDebug: Bool = isDebugBuild,
        env: [String: String] = ProcessInfo.processInfo.environment,
        defaults: UserDefaults = .standard
    ) -> Bool {
        guard isDebug else { return false }
        return env["FITCONNECT_LOCAL_DEMO"] == "true" || defaults.bool(forKey: "fitconnect.localDemo")
    }

    static func apiBaseURL(
        bundle: Bundle = .main,
        isSimulator: Bool = isSimulator
    ) -> URL {
        let raw = (bundle.object(forInfoDictionaryKey: "FITCONNECT_API_BASE_URL") as? String)?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if let raw, let url = URL(string: raw), isAllowedOnDevice(url, isSimulator: isSimulator) {
            return url
        }
        return productionAPI
    }

    static func isAllowedOnDevice(_ url: URL, isSimulator: Bool) -> Bool {
        let host = (url.host ?? "").lowercased()
        if host.isEmpty { return false }
        let loopback = host == "localhost" || host == "127.0.0.1" || host == "::1"
        if loopback { return isSimulator }
        return true
    }
}
