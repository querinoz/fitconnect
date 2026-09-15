import Foundation
#if canImport(FirebaseAuth)
import FirebaseAuth
#endif
#if canImport(AuthenticationServices)
import AuthenticationServices
#endif

enum AuthRuntimeError: Error, Equatable {
    case notConfigured
    case network
    case invalidCredentials
    case appleUnavailable
}

protocol FirebaseAuthRuntime {
    var isConfigured: Bool { get }
    func signIn(email: String, password: String) async -> Result<IdentityProfile, AuthRuntimeError>
    func signInWithApple() async -> Result<IdentityProfile, AuthRuntimeError>
    func restore() async -> IdentityProfile?
    func signOut()
}

struct FirebaseAuthBridge: FirebaseAuthRuntime {
    var isConfigured: Bool { FirebaseBootstrap.plistPresent }

    func signIn(email: String, password: String) async -> Result<IdentityProfile, AuthRuntimeError> {
        guard FirebaseBootstrap.configureIfPresent() else { return .failure(.notConfigured) }
        #if canImport(FirebaseAuth)
        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            return .success(IdentityProfile(
                firebaseUid: result.user.uid,
                displayName: result.user.displayName ?? email,
                email: result.user.email,
                modes: [.athlete, .coach],
                provider: .firebaseEmail
            ))
        } catch {
            return .failure(.invalidCredentials)
        }
        #else
        return .failure(.notConfigured)
        #endif
    }

    func signInWithApple() async -> Result<IdentityProfile, AuthRuntimeError> {
        guard FirebaseBootstrap.plistPresent else { return .failure(.notConfigured) }
        #if canImport(AuthenticationServices)
        return await AppleSignInCoordinator().signIn()
        #else
        return .failure(.notConfigured)
        #endif
    }

    func restore() async -> IdentityProfile? {
        #if canImport(FirebaseAuth)
        guard let user = Auth.auth().currentUser else { return nil }
        return IdentityProfile(
            firebaseUid: user.uid,
            displayName: user.displayName ?? "Athlete",
            email: user.email,
            modes: [.athlete, .coach],
            provider: user.providerData.contains(where: { $0.providerID == "apple.com" }) ? .signInWithApple : .firebaseEmail
        )
        #else
        return nil
        #endif
    }

    func signOut() {
        #if canImport(FirebaseAuth)
        try? Auth.auth().signOut()
        #endif
        KeychainStore.delete(account: "firebase-uid")
    }
}
