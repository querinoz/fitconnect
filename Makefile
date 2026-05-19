# FitConnect — local dev orchestration
# Usage: make start | make dev | make setup | make stop | make status
#
# Windows (native):  npm run env:start
# Windows (Git Bash): make start
# WSL / macOS / Linux: make start

PORT      ?= 3001
LOG_FILE   = apps/web/.next/dev.log
PID_FILE   = apps/web/.next/prod.pid
TUNNEL_LOG = apps/web/.next/tunnel.log
TUNNEL_PID = apps/web/.next/tunnel.pid

export PORT

.PHONY: help setup dev start prod stop clean clean-deep status tunnel test build typecheck \
        _deps _kill_port _build _start_prod _wait_ready _smoke _tunnel _open

# ── OS detection ───────────────────────────────────────────────────────────────
ifeq ($(OS),Windows_NT)
  IS_WINDOWS := 1
  SETUP_CMD  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-setup.ps1
  START_CMD  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-start.ps1 -Port $(PORT) -SkipSetup
  STOP_CMD   = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-stop.ps1 -Port $(PORT)
  STATUS_CMD = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-status.ps1 -Port $(PORT)
  CLEAN_CMD  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT)
else
  UNAME := $(shell uname -s 2>/dev/null || echo Unix)
  SETUP_CMD  = bash scripts/make-setup.sh
  START_CMD  = SKIP_SETUP=1 PORT=$(PORT) bash scripts/make-start.sh
  STOP_CMD   = bash scripts/make-stop.sh $(PORT)
  STATUS_CMD = bash scripts/make-status.sh $(PORT)
  CLEAN_CMD  = bash scripts/make-clean.sh $(PORT)
  ifeq ($(UNAME),Darwin)
    OPEN_CMD    = open
    NEW_TAB_CMD = osascript -e 'tell app "Terminal" to do script "cloudflared tunnel --url http://localhost:$(PORT)"'
  else
    OPEN_CMD    = xdg-open 2>/dev/null || true
    NEW_TAB_CMD = cloudflared tunnel --url http://localhost:$(PORT) > $(TUNNEL_LOG) 2>&1 &
  endif
endif

# ── help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  FitConnect — Makefile"
	@echo ""
	@echo "  make start       Setup + dev server on :$(PORT) (recommended)"
	@echo "  make dev         Alias for make start"
	@echo "  make setup       Install deps, .env.local, Prisma generate, optional DB seed"
	@echo "  make prod        Production build + server + tunnel + smoke (slower)"
	@echo "  make stop        Stop dev/prod server and free port"
	@echo "  make status      Server, port, and route health checks"
	@echo "  make test        Run Vitest unit tests"
	@echo "  make build       Production build only"
	@echo "  make typecheck   TypeScript check"
	@echo "  make clean       Stop + remove .next and dev state"
	@echo "  make clean-deep  clean + remove node_modules"
	@echo "  make tunnel      Cloudflare tunnel (server must already be running)"
	@echo ""
	@echo "  PORT=3002 make start   Use a different port"
	@echo "  Windows native: npm run env:start"
	@echo ""

# ── Primary dev flow ───────────────────────────────────────────────────────────
setup:
	@$(SETUP_CMD)

dev start: setup
	@$(START_CMD)

# ── Production demo flow (build + tunnel) ─────────────────────────────────────
prod: _deps setup _kill_port _build _start_prod _wait_ready _smoke _tunnel _open
	@echo ""
	@echo "✅  FitConnect production server is online!"
	@echo "   Local  → http://localhost:$(PORT)"
	@if [ -f $(TUNNEL_LOG) ]; then \
	  URL=$$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' $(TUNNEL_LOG) | head -1); \
	  [ -n "$$URL" ] && echo "   Mobile → $$URL" || echo "   Mobile → (tunnel starting — run 'make tunnel')"; \
	fi

test:
	@pnpm run test

build:
	@pnpm run build

typecheck:
	@pnpm run typecheck

# ── prod internals ────────────────────────────────────────────────────────────
_deps:
	@echo "› Checking dependencies..."
	@[ -d node_modules ] && echo "  node_modules OK" || pnpm install

_kill_port:
	@echo "› Freeing port $(PORT)..."
	@$(STOP_CMD) 2>/dev/null || true
	@-fuser -k $(PORT)/tcp 2>/dev/null || true
	@-kill $$(cat $(TUNNEL_PID) 2>/dev/null) 2>/dev/null || true
	@sleep 1

_build:
	@echo "› Production build..."
	@pnpm run build 2>&1 | tail -8
	@echo "  Build complete ✓"

_start_prod:
	@echo "› Starting production server on 0.0.0.0:$(PORT)..."
	@mkdir -p apps/web/.next
	@PORT=$(PORT) pnpm --filter @fitconnect/web start > $(LOG_FILE) 2>&1 &
	@echo $$! > $(PID_FILE)
	@echo "  PID: $$(cat $(PID_FILE))"

_wait_ready:
	@echo "› Waiting for server..."
	@for i in $$(seq 1 60); do \
	  if curl -sf http://localhost:$(PORT) > /dev/null 2>&1; then \
	    echo "  Ready after $${i}s ✓"; \
	    exit 0; \
	  fi; \
	  printf "."; \
	  sleep 1; \
	done; \
	echo ""; \
	echo "❌ Server did not start in 60s — see $(LOG_FILE)"; \
	tail -20 $(LOG_FILE); \
	exit 1

_smoke:
	@echo "› Smoke tests..."
	@node scripts/smoke-test.mjs http://localhost:$(PORT)
	@node scripts/mobile-pwa-check.mjs http://localhost:$(PORT)

_tunnel:
ifndef IS_WINDOWS
	@echo "› Starting Cloudflare tunnel..."
	@which cloudflared > /dev/null 2>&1 || { \
	  echo "  cloudflared not found — install from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"; \
	  exit 0; \
	}
	@$(NEW_TAB_CMD)
	@echo "  Waiting for tunnel URL..."
	@for i in $$(seq 1 20); do \
	  URL=$$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' $(TUNNEL_LOG) 2>/dev/null | head -1); \
	  if [ -n "$$URL" ]; then \
	    echo "  📱 Mobile URL: $$URL"; \
	    exit 0; \
	  fi; \
	  printf "."; \
	  sleep 2; \
	done; \
	echo ""; \
	echo "  ⚠️  Tunnel URL not ready yet"
else
	@echo "› Tunnel: run 'cloudflared tunnel --url http://localhost:$(PORT)' in a separate terminal"
endif

_open:
ifndef IS_WINDOWS
	@$(OPEN_CMD) http://localhost:$(PORT) 2>/dev/null || true
endif

tunnel:
ifndef IS_WINDOWS
	@which cloudflared > /dev/null 2>&1 || { echo "Install cloudflared first"; exit 1; }
	@echo "› Tunnel → http://localhost:$(PORT)"
	@cloudflared tunnel --url http://localhost:$(PORT) 2>&1 | tee $(TUNNEL_LOG)
else
	@echo "Run: cloudflared tunnel --url http://localhost:$(PORT)"
endif

# ── stop / clean / status ─────────────────────────────────────────────────────
stop:
	@$(STOP_CMD)
	@rm -f $(PID_FILE) $(TUNNEL_PID)
	@echo "✅  Stopped"

clean:
	@$(CLEAN_CMD)

clean-deep:
ifdef IS_WINDOWS
	@powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT) -Deep
else
	@$(CLEAN_CMD)
	@echo "› Removing node_modules..."
	@rm -rf node_modules
	@echo "✅  Deep clean complete"
endif

status:
	@$(STATUS_CMD)
