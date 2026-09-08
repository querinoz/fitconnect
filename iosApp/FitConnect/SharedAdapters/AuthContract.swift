import Foundation

enum AppRole: String, CaseIterable, Identifiable, Hashable {
    case athlete
    case coach

    var id: String { rawValue }
    var title: String { rawValue.capitalized }
}

struct DemoUser: Identifiable, Hashable {
    let id: String
    let name: String
    let role: AppRole
    let headline: String
    let location: String
}

protocol AuthContract {
    func signIn(role: AppRole) async throws -> DemoUser
    func signOut() async
}
import Observation
import SwiftUI

enum AppRole: String, CaseIterable, Identifiable, Hashable {
    case athlete
    case coach

    var id: String { rawValue }

    var title: String {
        switch self {
        case .athlete:
            return "Athlete"
        case .coach:
            return "Coach"
        }
    }

    var accent: EosAccent {
        switch self {
        case .athlete:
            return .voltline
        case .coach:
            return .iris
        }
    }
}

protocol AuthContract {
    var localDemoLabel: String { get }
    func headline(for role: AppRole?) -> String
}

struct LocalDemoAuthAdapter: AuthContract {
    let localDemoLabel = "LOCAL_DEMO"

    func headline(for role: AppRole?) -> String {
        switch role {
        case .athlete:
            return "Performance cockpit ready to review."
        case .coach:
            return "Roster command center ready to brief."
        case nil:
            return "Choose a role and boot the Path A shell locally."
        }
    }
}

@MainActor
@Observable
final class DemoSessionStore {
    var isAuthenticated = false
    var role: AppRole?

    func signIn(as role: AppRole) {
        self.role = role
        isAuthenticated = true
    }

    func signOut() {
        role = nil
        isAuthenticated = false
    }
}
