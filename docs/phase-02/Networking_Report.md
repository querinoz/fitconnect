# Phase 02 — Networking Report

## Single stack

`OkHttpApiClient` is the only HTTP entry point:

- GET / POST / PUT / DELETE  
- Auth interceptor (bearer)  
- `TokenAuthenticator` refresh + session clear on failure  
- Timeouts from `AppConfig`  
- `cancelAll()` for cancellation  
- Kill switch via `FeatureFlag.KILL_SWITCH_NETWORK`  
- Lightweight GET response cache when offline sync flag enabled  
- Error mapping → `AppError`

## Additional ports

| Port | Purpose |
|------|---------|
| `TrpcPort` / `HttpTrpcPort` | tRPC boundary over same ApiClient |
| `RealtimeClient` / `NoOpRealtimeClient` | Realtime subscribe/publish contract |
| `ConnectivityMonitor` | Online/offline StateFlow |

## Gaps

- No certificate pinning  
- No OkHttp EventListener metrics sink yet  
- Realtime vendor not selected/wired  
- Request queue for mutations while offline goes through `OfflineCoordinator`, not automatic HTTP interception
