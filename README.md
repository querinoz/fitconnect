# FitConnect

Marketplace platform that connects athletes and enthusiasts to specialised personal trainers across **10 sports** (yoga, strength, surf, climbing, martial arts, running, swimming, cycling, CrossFit, boxing).

## Features

- **Marketing landing page** with hero, sports strip, feature grid, featured trainers, how-it-works, pricing, FAQs and call-to-action.
- **Discover** (`/discover`) with live filtering by sport, modality, price and free-text search.
- **Trainer profile** (`/trainer/[id]`) with cover, bio, verified certifications, reviews and booking sidebar.
- **For-trainers** landing (`/trainer`) with perks and onboarding CTA.
- **Athlete dashboard** (`/dashboard`) with weekly training volume bar chart, VO₂max trend, upcoming sessions, current goal and KPI tiles.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v3, Framer Motion, lucide-react
- Recharts for analytics, Radix primitives + custom UI library
- 100% browser-side data (seeded demo content in `lib/data.ts`) — no backend required to run

## Run

```bash
npm install
npm run dev      # http://localhost:3001
```

## Deploy

- **Vercel:** import this folder, click deploy. No env vars required.
- **Docker:** see `../../README.md` for the standard Node host instructions.
