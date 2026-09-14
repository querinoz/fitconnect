# Tooling inventory

Machine-readable twin: `.cursor/tooling-policy.json`. Refresh after installing or dropping a tool. Never put secrets here.

| Tool | Category | Source | License | OSS | Free | Local/SaaS | Credentials | Used for | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cursor Rules / Skills / Plugins | Agent | Cursor | proprietary host | no | yes (editor) | local | none | governance | required |
| Playwright CLI | Web E2E | microsoft/playwright | Apache-2.0 | yes | yes | local | none | e2e, visual, landing-motion | required |
| Playwright MCP | Web explore | `@playwright/mcp` in `.mcp.json` | Apache-2.0 | yes | yes | local | none | exploratory browser | approved |
| Chrome DevTools / cursor-ide-browser | Web debug | Cursor + Chromium | mixed | partial | yes | local | none | console, network, a11y snapshot | approved |
| Lighthouse CI script | Web perf | `scripts/lighthouse-mobile.mjs` | Apache-2.0 engine | yes | yes | local | none | mobile perf gate | required |
| GitHub CLI (`gh`) | Release | cli/cli | MIT | yes | yes | local | `GH_TOKEN` via git credential | Actions, PRs | required |
| GitHub MCP | Release | optional official | MIT | yes | yes | SaaS | token | not installed in-repo | deferred — `gh` is enough, least privilege |
| Vercel CLI | Release | vercel | proprietary CLI | no | free tier | SaaS | GitHub `production` env `VERCEL_*` | Pull/Build/Deploy | required |
| Supabase migrations | Backend | `supabase/migrations` + `pnpm db:supabase:*` | Apache-2.0 client | yes | hosted DB | mixed | `DATABASE_URL` | schema/RLS | required |
| Supabase MCP | Backend | optional official | Apache-2.0 | yes | hosted | SaaS | DB token | not connected | deferred — too easy to point at prod |
| Figma MCP + plugin | Design | Figma × Cursor | proprietary | no | plan limits | SaaS | Figma auth | design-to-code when files exist | approved when designs exist |
| Firebase plugin | Auth/mobile | Cursor plugin | proprietary | no | yes | SaaS | project auth | Android/web Firebase | approved |
| Maestro | Mobile E2E | mobile-dev-inc/maestro official installer (`https://get.maestro.mobile.dev`) | Apache-2.0 | yes | yes | local | none | Android/iOS/web journeys | installed 2.10.0 on this Windows host; flows in `.maestro/` |
| Android SDK / Gradle / Compose | Android | Google | mixed | partial | SDK free | local | keystore for release | native app | required |
| Detekt / ktlint / Kover | Android quality | OSS | Apache/MIT | yes | yes | local | none | lint/coverage | required in Android CI where wired |
| ADB / emulator | Android runtime | Google | mixed | n/a | yes | local | none | install/launch | required for UX claims |
| Xcode / Simulator / SwiftLint | iOS | Apple + OSS | mixed/MIT | partial | Xcode on macOS | local | Apple Developer for device | SwiftUI | macOS-only; do not fake on Windows |
| Trivy | Security | aquasecurity/trivy | Apache-2.0 | yes | yes | local | none | vuln/license scan | approved; run in security workflow |
| Semgrep CE | Security | semgrep | LGPL | yes | yes | local | none | SAST | used via `.github/workflows/sast.yml` |
| Context7 MCP | Docs | mcp.context7.com | hosted | no | usage limits | SaaS | none in repo | library docs | approved |
| Firecrawl MCP | Research | `.mcp.json` | hosted | no | API paid | SaaS | `FIRECRAWL_API_KEY` | scrape | optional; human key; not prod trust |
| Perplexity MCP | Research | `.mcp.json` | hosted | no | API paid | SaaS | `PERPLEXITY_API_KEY` | research | optional; human key; not prod trust |
| Chrome MCP HTTP | Browser | `127.0.0.1:12306` | local bridge | n/a | n/a | local | none | only if human runs bridge | optional |
| Terra / Spike / ROOK | Aggregators | n/a | paid | n/a | no | SaaS | n/a | **not core** | disabled adapters only |
| Expo / React Native | Mobile UI | n/a | MIT | yes | yes | local | n/a | archived Path A | do not reintroduce for Android UI |

## Intentionally not installed

| Tool | Reason |
| --- | --- |
| Random community MCP servers | Untrusted filesystem/network/prod access |
| GitHub MCP with a production PAT in `.mcp.json` | `gh` already authenticated; extra token surface |
| Supabase MCP against production | Destructive risk; use migrations + least-privilege SQL locally |
| Paid a11y SaaS | axe-core / Lighthouse / platform APIs are enough |
| Datadog / Sentry MCP | Observability is product config, not an agent execution bridge |
