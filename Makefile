# FitConnect — local dev orchestration
# Usage: make start | stop | clean | status | android | all

PORT ?= 3001
export PORT

.PHONY: start stop clean clean-deep status help android all open-apps

ifeq ($(OS),Windows_NT)
  RUN_START  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-start.ps1 -Port $(PORT)
  RUN_STOP   = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-stop.ps1 -Port $(PORT)
  RUN_CLEAN  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT)
  RUN_STATUS = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-status.ps1 -Port $(PORT)
  RUN_CLEAN_DEEP = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT) -Deep
  RUN_ANDROID = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/android-emulator-open.ps1 -Port $(PORT)
else
  RUN_START  = bash scripts/make-start.sh
  RUN_STOP   = bash scripts/make-stop.sh $(PORT)
  RUN_CLEAN  = bash scripts/make-clean.sh
  RUN_STATUS = bash scripts/make-status.sh
  RUN_CLEAN_DEEP = DEEP=1 bash scripts/make-clean.sh
  RUN_ANDROID = bash scripts/android-emulator-open.sh
endif

help:
	@echo FitConnect Makefile
	@echo.
	@echo   make start       Install deps if needed, start Next.js on port $(PORT), smoke, open browser
	@echo   make android     Open FitConnect PWA in Android emulator Chrome (adb required)
	@echo   make all         start + android (web + emulator PWA)
	@echo   make open-apps   Print URLs for Landing / Athlete / Coach / Mobile / QR
	@echo   make stop        Stop dev server and free port $(PORT)
	@echo   make clean       Stop, remove Docker containers, clear .next cache and dev logs
	@echo   make clean-deep  clean + remove node_modules
	@echo   make status      Show port, PID, HTTP health, Docker state
	@echo.
	@echo   Windows without GNU make:  .\make.ps1 start   or   npm run env:start
	@echo   PORT=3001 make start   Use a different port (requires package.json dev script alignment)
	@echo.
	@echo   NOTE: This repo is the Next.js web/PWA. There is no native Android APK here.
	@echo         Android emulator loads the PWA via Chrome at http://10.0.2.2:$(PORT)/mobile

start:
	$(RUN_START)

android:
	$(RUN_ANDROID)

all: start android

open-apps:
	@echo ""
	@echo "FitConnect surfaces (dev server on $(PORT)):"
	@echo "  [01] Landing     http://localhost:$(PORT)/"
	@echo "  [02] Sign-in     http://localhost:$(PORT)/signin"
	@echo "  [03] Athlete     http://localhost:$(PORT)/feed"
	@echo "  [04] Coach       http://localhost:$(PORT)/coach/dashboard"
	@echo "  [05] Discover    http://localhost:$(PORT)/discover"
	@echo "  [06] Profile     http://localhost:$(PORT)/profile"
	@echo "  [07] Mobile      http://localhost:$(PORT)/mobile"
	@echo "  [08] Mobile QR   http://localhost:$(PORT)/mobile/qr"
	@echo "  [09] Emulator    make android  (Chrome → http://10.0.2.2:$(PORT)/mobile)"
	@echo ""
	@echo "Demo: ines@fitconnect.local / Athlete   |   Coach / Coach"

stop:
	$(RUN_STOP)

clean:
	$(RUN_CLEAN)

clean-deep:
	$(RUN_CLEAN_DEEP)

status:
	$(RUN_STATUS)
