# FitConnect — local dev orchestration
# Usage: make start | stop | clean | status

PORT ?= 3001
export PORT

.PHONY: start stop clean clean-deep status help

ifeq ($(OS),Windows_NT)
  RUN_START  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-start.ps1 -Port $(PORT)
  RUN_STOP   = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-stop.ps1 -Port $(PORT)
  RUN_CLEAN  = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT)
  RUN_STATUS = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-status.ps1 -Port $(PORT)
  RUN_CLEAN_DEEP = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-clean.ps1 -Port $(PORT) -Deep
else
  RUN_START  = bash scripts/make-start.sh
  RUN_STOP   = bash scripts/make-stop.sh $(PORT)
  RUN_CLEAN  = bash scripts/make-clean.sh
  RUN_STATUS = bash scripts/make-status.sh
  RUN_CLEAN_DEEP = DEEP=1 bash scripts/make-clean.sh
endif

help:
	@echo FitConnect Makefile
	@echo.
	@echo   make start       Install deps if needed, start dev server on port $(PORT), run smoke tests, open browser
	@echo   make stop        Stop dev server and free port $(PORT)
	@echo   make clean       Stop, remove Docker containers, clear .next cache and dev logs
	@echo   make clean-deep  clean + remove node_modules
	@echo   make status      Show port, PID, HTTP health, Docker state
	@echo.
	@echo   Windows without GNU make:  .\make.ps1 start   or   npm run env:start
	@echo   PORT=3001 make start   Use a different port (requires package.json dev script alignment)

start:
	$(RUN_START)

stop:
	$(RUN_STOP)

clean:
	$(RUN_CLEAN)

clean-deep:
	$(RUN_CLEAN_DEEP)

status:
	$(RUN_STATUS)
