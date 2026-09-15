import Foundation
import Observation

enum AppRole: String, CaseIterable, Identifiable, Hashable {
    case athlete
    case coach

    var id: String { rawValue }

    var title: String {
        switch self {
        case .athlete: return "Athlete"
        case .coach: return "Coach"
        }
    }

    var accent: EosAccent {
        switch self {
        case .athlete: return .voltline
        case .coach: return .iris
        }
    }
}

enum AuthProvider: String, Hashable {
    case firebaseEmail
    case signInWithApple
    case localDemo
    case none
}

enum AuthConfigurationState: String, Hashable {
    case firebaseReady
    case localDemoAllowed
    case notConfigured
}

protocol AuthContract {
    var localDemoLabel: String { get }
    func headline(for role: AppRole?) -> String
    func configurationState() -> AuthConfigurationState
}

struct FitConnectAuthAdapter: AuthContract {
    let localDemoLabel = "LOCAL_DEMO"

    func headline(for role: AppRole?) -> String {
        switch role {
        case .athlete:
            return "One login. Athlete mode is active."
        case .coach:
            return "One login. Coach mode is active."
        case nil:
            return "ONE LOGIN. Sign in once. Switch Athlete and Coach without signing out."
        }
    }

    func configurationState() -> AuthConfigurationState {
        if AppSessionStore.localDemoAllowed {
            return .localDemoAllowed
        }
        if Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil {
            return .firebaseReady
        }
        return .notConfigured
    }
}

struct IdentityProfile: Hashable {
    var firebaseUid: String
    var displayName: String
    var email: String?
    var modes: Set<AppRole>
    var provider: AuthProvider
}

@MainActor
@Observable
final class AppSessionStore {
    var isAuthenticated = false
    var role: AppRole?
    var identity: IdentityProfile?
    var lastAuthError: String?
    var pendingDeepLink: String?

    var activeMode: AppRole? { role }

    static var localDemoAllowed: Bool {
        let env = ProcessInfo.processInfo.environment["FITCONNECT_LOCAL_DEMO"] == "true"
        let defaults = UserDefaults.standard.bool(forKey: "fitconnect.localDemo")
        return env || defaults
    }

    func completeSignIn(identity: IdentityProfile, active: AppRole = .athlete) {
        self.identity = identity
        role = identity.modes.contains(active) ? active : identity.modes.first
        isAuthenticated = true
        lastAuthError = nil
        KeychainStore.set(identity.firebaseUid, account: "firebase-uid")
        persist()
    }

    func signInLocalDemo() {
        guard Self.localDemoAllowed else {
            lastAuthError = "LOCAL_DEMO is off. Firebase Auth is required."
            return
        }
        completeSignIn(
            identity: IdentityProfile(
                firebaseUid: "local-demo",
                displayName: "Local athlete",
                email: nil,
                modes: [.athlete, .coach],
                provider: .localDemo
            ),
            active: .athlete
        )
    }

    func switchMode(to next: AppRole) {
        guard isAuthenticated, identity?.modes.contains(next) == true else { return }
        role = next
        persist()
    }

    func signOut() {
        identity = nil
        role = nil
        isAuthenticated = false
        lastAuthError = nil
        UserDefaults.standard.removeObject(forKey: "fitconnect.session")
    }

    func restore() {
        guard let data = UserDefaults.standard.data(forKey: "fitconnect.session"),
              let raw = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let uid = raw["uid"] as? String,
              let name = raw["name"] as? String,
              let provider = AuthProvider(rawValue: raw["provider"] as? String ?? "none"),
              let mode = AppRole(rawValue: raw["mode"] as? String ?? "athlete")
        else { return }
        if provider == .localDemo && !Self.localDemoAllowed { return }
        completeSignIn(
            identity: IdentityProfile(
                firebaseUid: uid,
                displayName: name,
                email: raw["email"] as? String,
                modes: [.athlete, .coach],
                provider: provider
            ),
            active: mode
        )
    }

    private func persist() {
        guard let identity else { return }
        let payload: [String: Any] = [
            "uid": identity.firebaseUid,
            "name": identity.displayName,
            "email": identity.email ?? "",
            "provider": identity.provider.rawValue,
            "mode": role?.rawValue ?? AppRole.athlete.rawValue
        ]
        if let data = try? JSONSerialization.data(withJSONObject: payload) {
            UserDefaults.standard.set(data, forKey: "fitconnect.session")
        }
    }
}
