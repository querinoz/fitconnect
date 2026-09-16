# 21st → FitConnect integration registry (v2 slice)

| Component | Screen | Source | Source type | Integration | Zenith adaptation |
|-----------|--------|--------|-------------|-------------|-------------------|
| TelemetryStatus | Ascend, AI, cards | FitConnect | Zenith-native (21st badge/status pattern) | Honest state chip | EOS border/text tones |
| TelemetryCard | Ascend | FitConnect | Zenith-native (21st metric card pattern) | Bound to `/api/v1/readiness` + Ascend XP | BentoCard + TelemetryMetric + reduced motion |
| TelemetryMetric | (existing) Dashboard readiness | FitConnect | Prior Zenith | Unchanged | metric.land |
| AISuggestions | AIAssistant | FitConnect | Zenith-native (21st AI Suggestions catalog) | Real canned prompts → `/api/v1/ai/chat` | EOS focus rings |
| AIContextCard | AIAssistant | FitConnect | Zenith-native (21st context/citation pattern) | Readiness from `/api/v1/readiness` | Never invents metrics |
| AIStreamingState | AIAssistant | FitConnect | Zenith-native | Waiting only — not fake token stream | `prefers-reduced-motion` |
| DeviceStatusBadge | Wearables settings | FitConnect | Zenith-native | Provider API status mapping | CONNECTED only when backend says so |
| WearMetricRing | Wear readiness / HR panes | FitConnect | Compose (21st ring pattern as design intent) | `MetricAvailability` honesty | Elite Wear colors |

## 21st MCP

- Configured in `.mcp.json` as `21st-dev` → `https://21st.dev/api/mcp`
- Requires `TWENTY_FIRST_API_KEY` (see `.env.example`)
- **Runtime of the app does not depend on 21st**
- Without a key: MCP tools are **NOT VERIFIED** (v3: unauth endpoint returns **401**; key still absent)
- Landing Elite OS hero: **PRESERVED** — 21st full-hero rewrite **NOT REQUIRED** (v3 audit)

## Componentry

**NOT REQUIRED** for current runtime (unchanged).

## Manus

**OPTIONAL** external ops agent (unchanged).
