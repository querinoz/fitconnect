#!/usr/bin/env bash
# FitConnect — bootstrap local environment (Unix / Git Bash)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

step() { echo "==> $*"; }

command -v node >/dev/null || { echo "Node.js required"; exit 1; }

if [[ ! -f .env.local ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env.local
    step "Created .env.local from .env.example (demo mode defaults)"
  else
    echo ".env.example not found — skipping env bootstrap"
  fi
else
  step ".env.local present"
fi

if [[ ! -d node_modules ]]; then
  step "Installing npm dependencies"
  npm install
else
  step "node_modules OK"
fi

step "Generating Prisma client"
npm run db:generate

has_real_db=0
if [[ -f .env.local ]]; then
  db_url="$(grep -E '^\s*DATABASE_URL\s*=' .env.local | head -1 | sed -E 's/^\s*DATABASE_URL\s*=\s*//' | tr -d "\"'" || true)"
  if [[ -n "$db_url" && "$db_url" != *"user:pass@host"* && "$db_url" != *"your-project"* ]]; then
    has_real_db=1
  fi
fi

if [[ "$has_real_db" -eq 1 ]]; then
  step "DATABASE_URL detected — syncing schema and seeding"
  npm run db:push || echo "db:push failed — continuing in demo/seed fallback mode"
  npm run db:seed || echo "db:seed failed — continuing with in-memory demo data"
else
  step "No real DATABASE_URL — demo mode (seed data from lib/dashboard/seed.ts)"
fi

echo "Setup complete."
