import Foundation
#if canImport(FirebaseCore)
import FirebaseCore
#endif
#if canImport(CryptoKit)
import CryptoKit
#endif
#if canImport(FirebaseAuth)
import FirebaseAuth
#endif
#if canImport(AuthenticationServices)
import AuthenticationServices
import UIKit
#endif

enum FirebaseBootstrap {
    static var plistPresent: Bool {
        Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil
    }

    @discardableResult
    static func configureIfPresent() -> Bool {
        guard plistPresent else { return false }
        #if canImport(FirebaseCore)
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
        return FirebaseApp.app() != nil
        #else
        return false
        #endif
    }
}

enum AppleNonce {
    static func random(length: Int = 32) -> String {
        var bytes = [UInt8](repeating: 0, count: length)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(bytes.map { charset[Int($0) % charset.count] })
    }

    static func sha256(_ input: String) -> String {
        #if canImport(CryptoKit)
        let digest = SHA256.hash(data: Data(input.utf8))
        return digest.compactMap { String(format: "%02x", $0) }.joined()
        #else
        return input
        #endif
    }
}

#if canImport(AuthenticationServices)
final class AppleSignInCoordinator: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private var continuation: CheckedContinuation<Result<IdentityProfile, AuthRuntimeError>, Never>?
    private var rawNonce: String = ""

    func signIn() async -> Result<IdentityProfile, AuthRuntimeError> {
        rawNonce = AppleNonce.random()
        let hashed = AppleNonce.sha256(rawNonce)
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = hashed
        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        return await withCheckedContinuation { continuation in
            self.continuation = continuation
            controller.performRequests()
        }
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let idToken = String(data: tokenData, encoding: .utf8)
        else {
            continuation?.resume(returning: .failure(.appleUnavailable))
            continuation = nil
            return
        }

        #if canImport(FirebaseAuth)
        let oauth = OAuthProvider.credential(withProviderID: "apple.com", idToken: idToken, rawNonce: rawNonce)
        Auth.auth().signIn(with: oauth) { [weak self] result, error in
            guard let self else { return }
            if error != nil {
                self.continuation?.resume(returning: .failure(.network))
                self.continuation = nil
                return
            }
            let uid = result?.user.uid ?? credential.user
            let name = [credential.fullName?.givenName, credential.fullName?.familyName]
                .compactMap { $0 }
                .joined(separator: " ")
            KeychainStore.set(credential.user, account: "apple-user-id")
            result?.user.getIDToken { token, _ in
                if let token {
                    KeychainStore.set(token, account: "firebase-id-token")
                }
            }
            self.continuation?.resume(returning: .success(IdentityProfile(
                firebaseUid: uid,
                displayName: name.isEmpty ? "Apple user" : name,
                email: credential.email,
                modes: [.athlete, .coach],
                provider: .signInWithApple
            )))
            self.continuation = nil
        }
        #else
        _ = idToken
        continuation?.resume(returning: .failure(.notConfigured))
        continuation = nil
        #endif
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            continuation?.resume(returning: .failure(.cancelled))
        } else {
            continuation?.resume(returning: .failure(.appleUnavailable))
        }
        continuation = nil
    }
}
#endif
