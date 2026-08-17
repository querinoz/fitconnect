# Firebase Auth — Human Configuration

**Never paste secrets into chat, git, or tickets.**

`android/app/google-services.json` is gitignored. Do not commit it.

## Package names

| Build | Application ID |
| --- | --- |
| Release | `com.fitconnect.android` |
| Debug | `com.fitconnect.android.debug` |

Register **both** Android apps in the same Firebase project if debug Google Sign-In is required.

## Checklist (human)

1. Create / select a Firebase project (do not invent IDs in the repo).
2. Add Android apps with the package names above.
3. Enable Authentication providers:
   - Email/Password (with email verification)
   - Google
   - Apple
4. Download `google-services.json` into `android/app/google-services.json` (local only).
5. SHA-1 and SHA-256:
   - Debug: `keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey`
   - Release: fingerprints from the **production** upload keystore (gitignored `android/keystore.properties`)
6. Google Cloud / Firebase: create the **Web** OAuth client ID (Credential Manager `setServerClientId`). Not the Android client ID.
7. Put the web client ID in gitignored `android/local.properties`:

```
firebase.webClientId=….apps.googleusercontent.com
```

   or CI env `FITCONNECT_GOOGLE_WEB_CLIENT_ID`.

8. Apple:
   - Apple Developer: Services ID, Return URL from Firebase Console Apple provider help
   - Firebase Authentication → Sign-in method → Apple
   - Team ID, Key ID, private key stay in Firebase Console — **never** in the Android app
9. Email templates / action URL: use a domain you control. Do not add Android intent filters that auto-login from untrusted links.
10. Production signing: `android/keystore.properties` + real `.jks` (gitignored). `assembleRelease` is fail-closed without them.

## What the agent will never do

- Invent Firebase project IDs, OAuth client IDs, SHA fingerprints, Apple keys, or `google-services.json`
- Commit secrets
- Mark Google/Apple production E2E as PASS without a real configured run
