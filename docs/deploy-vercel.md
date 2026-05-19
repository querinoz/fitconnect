# FitConnect — Vercel deploy (step-by-step)

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- Node 20 + pnpm (already in repo)
- GitHub repo: `querinoz/fitconnect`

## Step 1 — Login (one time)

```powershell
cd d:\fitconnect
pnpm dlx vercel@latest login
```

Complete the browser device flow when prompted.

## Step 2 — Link project

From the **monorepo root** (`D:\fitconnect`):

```powershell
pnpm vercel:link
```

- **Scope:** Querinoz Studio  
- **Link to existing project?** Yes → `fitconnect`  
- Creates `.vercel/project.json` at repo root (gitignored)

If the project was linked from `apps/web` with wrong Root Directory, run once:

```powershell
.\scripts\vercel-fix-monorepo.ps1
```

This sets **Root Directory = `apps/web`** (required for Next.js in a pnpm monorepo).

## Step 3 — Environment variables

In [Vercel Dashboard → Project → Settings → Environment Variables](https://vercel.com/docs/projects/environment-variables), add at minimum:

| Variable | Value (demo) |
|----------|----------------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `NEXT_PUBLIC_REALTIME_PROVIDER` | `broadcast` |

Copy optional keys from `.env.example` when connecting Supabase/Neon/Stripe.

Or use the helper script:

```powershell
.\scripts\vercel-setup.ps1
```

## Step 4 — Preview deploy

```powershell
# always from monorepo root — uploads full repo
pnpm deploy:vercel
```

## Step 5 — Production deploy

```powershell
pnpm deploy:vercel:prod
```

Production URL: **https://fitconnect-querinoz.vercel.app** (after first successful deploy).

## Step 6 — GitHub integration (recommended)

1. Vercel Dashboard → **Add New Project** → Import `querinoz/fitconnect`
2. **Root Directory:** `apps/web`
3. Framework: Next.js (auto-detected)
4. Build command (from `apps/web/vercel.json`): `cd ../.. && pnpm turbo build --filter=@fitconnect/web`
5. Install command: `cd ../.. && pnpm install`

Every push to `main` deploys automatically.

## Step 7 — CI deploy secrets (optional)

For `.github/workflows/vercel-deploy.yml`:

| GitHub secret | Where to find |
|---------------|----------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

Create GitHub **environment** named `production` and add the secrets.

## Verify

```bash
curl https://<your-deployment>/api/health
pnpm test:e2e:voltline   # against preview URL: set baseURL in playwright if needed
```

Demo accounts after deploy:

- `ines@fitconnect.local` / Athlete → `/dashboard?demo=1`
- `tomas@fitconnect.local` / Coach → `/coach/dashboard?demo=1`
- `marina@fitconnect.local` / Marina → multi-sport athlete dashboard
- `admin@fitconnect.local` / Admin → `/admin`
