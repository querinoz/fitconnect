# CLOUD_TEST_AUTH

**Generated:** 2026-08-09 10:53 (post winget install)

- gcloud: FOUND (`C:\Users\duhqu\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`)
- Google Cloud SDK: **579.0.0**
- CLOUD_TEST_AUTH: **PENDING_HUMAN** (no credentialed accounts)
- Action: `gcloud auth login` then `gcloud config set project <PROJECT_ID>`

## Matrix (ready when auth + APK exist)

```powershell
cd android
.\gradlew :app:assembleDebug
$apk = Resolve-Path .\app\build\outputs\apk\debug\app-debug.apk
& "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" firebase test android run `
  --type instrumentation `
  --app $apk `
  --device model=Pixel2,version=30,locale=en,orientation=portrait `
  --timeout 15m
```

Maestro-on-device local alternative: `android/scripts/run-maestro-local.ps1`

This document never claims Test Lab PASS without authenticated submit evidence.
