import Foundation
#if canImport(AuthenticationServices)
import AuthenticationServices
#endif

enum AppleCredentialGate {
    static func verifyIfNeeded() {
        #if canImport(AuthenticationServices)
        guard let userID = KeychainStore.get(account: "apple-user-id") else { return }
        ASAuthorizationAppleIDProvider().getCredentialState(forUserID: userID) { state, _ in
            if state == .revoked || state == .notFound {
                KeychainStore.delete(account: "apple-user-id")
                KeychainStore.delete(account: "firebase-id-token")
            }
        }
        #endif
    }
}
