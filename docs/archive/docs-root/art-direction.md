# FitConnect Art Direction — Media & Imagery

> Fixed creative direction for Higgsfield, ImageKit, and in-app photography.

## Visual DNA

- **Floor:** obsidian deep `#070B14`, blue-black not warm black.
- **Key light:** volt rim `#C8FF00` — athletic, electric, never neon-on-neon.
- **Fill:** teal telemetry `#00DDB4` / `#3CD7FF` for data/live contexts.
- **Lens:** 35–50mm equivalent, shallow depth, fine 35mm grain.
- **Contrast:** high; shadows hold detail; no flat stock lighting.
- **People:** performance athletes and coaches — effort, focus, no cheesy smiles.
- **Forbidden:** watermarks, embedded text, generic gym stock, white SaaS templates.

## Prompt template (Higgsfield / CLI)

```
[subject], obsidian background #070B14, rim light electric lime #C8FF00,
subtle teal fill #00DDB4, cinematic 35mm, fine film grain, high contrast,
performance photography, no text, no watermark
```

## Asset registry

| Asset ID | Prompt summary | Model | Destination | Status |
|----------|----------------|-------|-------------|--------|
| hero-cinematic-v1 | Athlete readiness, volt rim | TBD | ImageKit `/hero/` | Planned |
| coach-portraits | Matched lighting set | TBD | ImageKit `/coaches/` | Planned |

*Update this table when generating assets. Never commit raw AI files to `public/` — upload to ImageKit first.*

## ImageKit pipeline

1. Upload to folder (`/brand`, `/hero`, `/coaches`, `/features`, `/og`).
2. Serve via `lib/media/imagekit.ts` loader with `f-auto,q-auto,dpr-auto`.
3. Coach portraits: `fo-face` smart crop.
4. OG images: dynamic text overlay transformations.

## Environment

```bash
NEXT_PUBLIC_IMAGEKIT_URL=https://ik.imagekit.io/your-id
IMAGEKIT_PRIVATE_KEY=...   # server only
```

See `apps/web/lib/media/imagekit.ts` and `.env.example`.
