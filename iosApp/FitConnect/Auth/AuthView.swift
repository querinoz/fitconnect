import SwiftUI

struct AuthView: View {
    @Bindable var session: AppSessionStore
    let services: AppServices
    @State private var email = ""
    @State private var password = ""
    @State private var busy = false
    private let firebase = FirebaseAuthBridge()

    var body: some View {
        ZStack {
            HoneycombBackground(accent: .iris)

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("FitConnect")
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                            .foregroundStyle(EosColors.textPrimary)
                        Text(services.auth.headline(for: nil))
                            .font(.title3)
                            .foregroundStyle(EosColors.textSecondary)
                    }

                    configurationCard

                    if services.auth.configurationState() == .localDemoAllowed {
                        Button("Continue LOCAL_DEMO") {
                            session.signInLocalDemo()
                        }
                        .font(.headline)
                        .foregroundStyle(EosColors.floor)
                        .padding(.vertical, 14)
                        .frame(maxWidth: .infinity)
                        .background(Capsule().fill(EosColors.voltline))
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("auth-local-demo")
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        TextField("Email", text: $email)
                            .textContentType(.username)
                            .textInputAutocapitalization(.never)
                            .padding(14)
                            .background(RoundedRectangle(cornerRadius: 16).fill(EosColors.surfaceRaised))
                        SecureField("Password", text: $password)
                            .textContentType(.password)
                            .padding(14)
                            .background(RoundedRectangle(cornerRadius: 16).fill(EosColors.surfaceRaised))
                        Button("Sign in with email") {
                            Task { await signInEmail() }
                        }
                        .font(.headline)
                        .foregroundStyle(EosColors.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Capsule().stroke(EosColors.stroke, lineWidth: 1))
                        .buttonStyle(.plain)
                        .disabled(busy)
                    }

                    Button("Sign in with Apple") {
                        Task { await signInApple() }
                    }
                    .font(.headline)
                    .foregroundStyle(EosColors.floor)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Capsule().fill(Color.white))
                    .buttonStyle(.plain)
                    .disabled(busy)
                    .accessibilityIdentifier("auth-apple")

                    if let err = session.lastAuthError {
                        Text(err)
                            .foregroundStyle(EosColors.alert)
                    }

                    Text("Athlete and Coach are modes of one identity. There is no separate coach login.")
                        .font(.footnote)
                        .foregroundStyle(EosColors.muted)
                }
                .padding(20)
            }
        }
    }

    @ViewBuilder
    private var configurationCard: some View {
        let state = services.auth.configurationState()
        GlassCard(accent: state == .notConfigured ? .warning : .voltline) {
            Text("ONE LOGIN")
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(state == .notConfigured
                 ? "Firebase is not configured on this device. Copy GoogleService-Info.plist from the example template. Sign-in will not be faked."
                 : "Firebase remains the canonical IdP. Sign in with Apple is offered when the Apple capability is present.")
                .foregroundStyle(EosColors.textPrimary)
        }
    }

    private func signInEmail() async {
        busy = true
        defer { busy = false }
        let result = await firebase.signIn(email: email, password: password)
        switch result {
        case .success(let identity):
            session.completeSignIn(identity: identity)
        case .failure(let error):
            session.lastAuthError = message(error)
        }
    }

    private func signInApple() async {
        busy = true
        defer { busy = false }
        let result = await firebase.signInWithApple()
        switch result {
        case .success(let identity):
            session.completeSignIn(identity: identity)
        case .failure(let error):
            session.lastAuthError = message(error)
        }
    }

    private func message(_ error: AuthRuntimeError) -> String {
        switch error {
        case .notConfigured:
            return "Firebase Auth is not configured."
        case .network:
            return "Network error. Session was not created."
        case .invalidCredentials:
            return "Invalid credentials."
        case .appleUnavailable:
            return "Sign in with Apple requires a signed Apple capability on a real device or simulator with Xcode."
        case .cancelled:
            return "Sign in with Apple was cancelled."
        }
    }
}
