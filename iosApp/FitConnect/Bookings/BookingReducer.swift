import Foundation

enum BookingPhase: String {
    case idle
    case discover
    case service
    case calendar
    case confirm
    case processing
    case succeeded
    case failed
}

struct BookingDraft: Equatable {
    var coachId: String?
    var serviceId: String?
    var slotIso: String?
    var phase: BookingPhase
    var lastError: String?
}

enum BookingReducer {
    static func reduce(_ draft: BookingDraft, selectCoach coachId: String) -> BookingDraft {
        BookingDraft(coachId: coachId, serviceId: nil, slotIso: nil, phase: .service, lastError: nil)
    }

    static func confirm(_ draft: BookingDraft, stripeConfigured: Bool, dbConfigured: Bool) -> BookingDraft {
        var next = draft
        if !dbConfigured {
            next.phase = .failed
            next.lastError = "Availability database is not configured. No booking was created."
            return next
        }
        if !stripeConfigured {
            next.phase = .failed
            next.lastError = "Stripe is not configured. Payment was not taken and no booking was created."
            return next
        }
        guard draft.coachId != nil, draft.serviceId != nil, draft.slotIso != nil else {
            next.phase = .failed
            next.lastError = "Coach, service and slot are required."
            return next
        }
        next.phase = .processing
        next.lastError = nil
        return next
    }
}

enum StripeClientConfig {
    static func isPublishableKeyPresent(_ value: String?) -> Bool {
        guard let value, !value.isEmpty, !value.contains("PASTE_") else { return false }
        return value.hasPrefix("pk_")
    }
}

enum RateLimitClientPolicy {
    static let buckets = ["auth", "mcp", "zenith", "booking", "social", "webhook"]
}
