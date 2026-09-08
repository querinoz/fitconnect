# Platform capability matrix — FitConnect Zenith Social Performance Network

> FitConnect owns the source of truth. Zapier / platform APIs are **distribution / automation** only.
> Verify against official docs before production enablement. Last reviewed: 2026-09-08.

## Architecture rule

```text
FitConnect DB → Event → Automation Engine → (optional) Zapier → External platform
```

Strava: **personal sync only**. Never social feed / ranking / shared map (AGENTS.md §1).

Spotify: **metadata + deep link only**. Never copy/sync/embed protected audio.

---

## Capability matrix

| Platform   | Text | Image | Video | Link | Activity | Music meta | Location | Direct API | Zapier |
| ---------- | ---: | ----: | ----: | ---: | -------: | ---------: | -------: | ---------: | -----: |
| FitConnect |    ✓ |     ✓ |     ✓ |    ✓ |        ✓ |          ✓ |        ✓ |          ✓ |      — |
| Instagram  |    ✓ |     ✓ |     ✓ |    ~ |        ✕ |          ✓ |        ✓ |    Business |      ✓ |
| Facebook   |    ✓ |     ✓ |     ✓ |    ✓ |        ✕ |          ✓ |        ✓ |       Meta |      ✓ |
| X          |    ✓ |     ✓ |     ✓ |    ✓ |        ✕ |          ✓ |        ✕ |          ✓ |      ✓ |
| TikTok     |    ~ |     ✕ |     ✓ |    ✓ |        ✕ |          ✓ |        ✕ |          ✓ |      ✓ |
| LinkedIn   |    ✓ |     ✓ |     ✓ |    ✓ |        ✕ |          ✕ |        ✕ |          ✓ |      ✓ |
| Threads    |    ✓ |     ✓ |     ✓ |    ✓ |        ✕ |          ✓ |        ✕ |       Meta |      ✓ |
| YouTube    |    ~ |     ✕ |     ✓ |    ✓ |        ✕ |          ✓ |        ✕ |          ✓ |      ✓ |
| Pinterest  |    ✓ |     ✓ |     ✕ |    ✓ |        ✕ |          ✕ |        ✓ |          ✓ |      ✓ |
| Bluesky    |    ✓ |     ✓ |     ✕ |    ✓ |        ✕ |          ✓ |        ✕ |         AT |      ~ |
| Spotify    |    — |     — |     — |    ✓ |        — | read-only* |        — |    OAuth |      ✓ |
| Strava     |    — |     — |     — |    — | personal |          — | personal |    OAuth |      ✓ |
| Zapier     |    ✓ |     ✓ |     ✓ |    ✓ |        ✓ |          ✓ |        ✓ |        MCP |      ✓ |

\*Currently playing via Spotify Web API OAuth; commercial-use and audio sync restrictions apply — share **link/metadata only**.

---

## Scopes & restrictions (summary)

### Spotify
- OAuth scopes for currently-playing / recently-played metadata.
- Do **not** download audio, mirror DRM content, or claim Spotify as FitConnect CDN.
- User opt-in per post for music sharing.

### Strava
- OAuth for athlete's own activities → FitConnect canonical activity (Health Connect preferred core).
- **Never** publish Strava-sourced rows to social surfaces (DB `is_social_eligible` + client filter).

### Instagram / Meta
- Instagram for Business publishing via Zapier or Graph API with business account.
- Capability varies by media type; validate before queue publish.

### Zapier MCP
- Configure via official Zapier MCP server setup (user OAuth).
- Expose least-privilege actions only.
- Never store third-party tokens in git / logs.

### Google Maps / Places
- Maps SDK markers/overlays; Places for discovery.
- API keys in secure config / CI secrets — never source.

### Health Connect
- Runtime permissions; show connected / denied / last sync.
- No silent health publish to Feed.

---

## Distribution job states

`QUEUED → PROCESSING → PUBLISHED`  
Failure: `PROCESSING → FAILED → RETRY` (bounded, idempotent).

One platform failure must not fail the FitConnect post.

---

## Fallback strategy

| If unavailable | Fallback |
| -------------- | -------- |
| Zapier down | Queue + retry; FitConnect post remains |
| Platform API denied | Mark job FAILED; user reconnects in Connections |
| Spotify scope missing | Hide music UI; no metadata attach |
| Maps key missing | List/nearby without live tiles; fail closed on Places |
