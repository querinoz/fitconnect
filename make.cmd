@echo off
REM Windows CMD entry — same as Makefile targets
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*
