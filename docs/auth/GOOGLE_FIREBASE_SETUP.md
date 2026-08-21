# Google + Firebase setup (FitConnect)

**HUMAN_REQUIRED.** This file does not contain credentials. Do not paste secrets into chat or commit `google-services.json`.

Canonical identity is **Firebase Auth**. Product data is **Supabase Postgres**. Authorization is **Supabase RLS**. The bridge is **Supabase Third-Party Auth** using the Firebase ID token as the Data API access token.

Apple Sign-In is **not** part of this phase.

## 1. Firebase project

1. Create or select a Firebase project for FitConnect production (separate from playground projects).
2. Enable **Authentication**.
3. Enable providers:
   - Email/Password
   - Google
4. Do **not** enable anonymous auth for production.

## 2. Android app

1. Register an Android app with package `com.fitconnect.android` (confirm against `android/app/build.gradle.kts`).
2. Add SHA-1 and SHA-256 of the **upload** and **play-app-signing** certificates.
3. Download `google-services.json` into `android/app/google-services.json` (gitignored).
4. Set `firebase.webClientId` in `android/local.properties` to the **Web OAuth client ID** (used as Credential Manager `serverClientId`). Never hardcode it.

## 3. Google OAuth client

1. In Google Cloud Console, confirm the Firebase-managed OAuth clients exist.
2. Web client ID = Android Credential Manager server client ID.
3. Authorized origins for web:
   - `http://localhost:3001`
   - production origin (`https://fitconnect-phi.vercel.app` and any custom domain)
4. Fill Google OAuth consent screen support/contact information (Google requirement).

## 4. Web Firebase config

Set public Next.js values (these are **not** service-account secrets):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional:

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- App Check / VAPID keys for FCM (already prepared; enforcement is HUMAN)

## 5. Redirect / origin

Firebase Auth web uses popup Google sign-in. Authorized domains must include production and local dev hosts.

## 6. What engineering already implemented

- Android: Firebase Auth SDK + Credential Manager Google ID token flow.
- Web: Firebase Auth email/password + Google popup, session cookie `fc-firebase-id`.
- Both send the Firebase UID into `identity_profiles` via authorized APIs.

## 7. What this file does not do

- It does not generate SHA fingerprints.
- It does not create OAuth clients.
- It does not claim `GOOGLE_PRODUCTION = PASS`.
