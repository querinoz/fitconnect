/**
 * Canonical auth session states (P1-AUTH) — web + Android must map here.
 * UI must not treat undefined as authenticated or unauthenticated.
 *
 * Web resolver uses the compact AuthPhase set below.
 * Cross-surface names (SIGNED_OUT, BOOTSTRAPPING, …) are aliases in
 * `toCanonicalAuthState`.
 */
export type CanonicalAuthState =
  | "SIGNED_OUT"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "BOOTSTRAPPING"
  | "READY"
  | "AUTH_ERROR"
  | "AUTH_UNAVAILABLE"
  | "TOKEN_REFRESH"
  | "LOGOUT_PENDING";

export type AuthPhase =
  | "INITIALIZING"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "REFRESHING"
  | "ERROR"
  | "AUTH_UNAVAILABLE"
  | "LOGOUT_PENDING";

export function resolveAuthPhase(input: {
  hydrated: boolean;
  hasUser: boolean;
  refreshing?: boolean;
  error?: boolean;
  authenticating?: boolean;
  bootstrapping?: boolean;
  authUnavailable?: boolean;
  logoutPending?: boolean;
}): AuthPhase {
  if (input.authUnavailable) return "AUTH_UNAVAILABLE";
  if (input.error) return "ERROR";
  if (input.logoutPending) return "LOGOUT_PENDING";
  if (!input.hydrated) return "INITIALIZING";
  if (input.authenticating) return "AUTHENTICATING";
  if (input.refreshing) return "REFRESHING";
  if (input.bootstrapping && input.hasUser) return "AUTHENTICATING";
  if (input.hasUser) return "AUTHENTICATED";
  return "UNAUTHENTICATED";
}

/** Map web AuthPhase onto the cross-surface canonical state machine. */
export function toCanonicalAuthState(
  phase: AuthPhase,
  extras?: { bootstrapping?: boolean; ready?: boolean }
): CanonicalAuthState {
  if (extras?.bootstrapping) return "BOOTSTRAPPING";
  if (extras?.ready && phase === "AUTHENTICATED") return "READY";
  switch (phase) {
    case "UNAUTHENTICATED":
      return "SIGNED_OUT";
    case "INITIALIZING":
    case "AUTHENTICATING":
      return "AUTHENTICATING";
    case "AUTHENTICATED":
      return "AUTHENTICATED";
    case "REFRESHING":
      return "TOKEN_REFRESH";
    case "AUTH_UNAVAILABLE":
      return "AUTH_UNAVAILABLE";
    case "LOGOUT_PENDING":
      return "LOGOUT_PENDING";
    case "ERROR":
      return "AUTH_ERROR";
  }
}

/** Safe, non-sensitive auth error codes for UI. */
export type AuthErrorCode =
  | "invalid_credentials"
  | "empty_credentials"
  | "unauthorized"
  | "auth_not_configured"
  | "network"
  | "forbidden"
  | "unknown";

export function mapAuthErrorMessage(code: AuthErrorCode): string {
  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or password.";
    case "empty_credentials":
      return "Enter your email and password.";
    case "unauthorized":
      return "Your session expired. Sign in again.";
    case "auth_not_configured":
      return "Sign-in is temporarily unavailable.";
    case "network":
      return "Network unavailable. Try again when you are online.";
    case "forbidden":
      return "You do not have access to this resource.";
    default:
      return "Something went wrong. Try again.";
  }
}
