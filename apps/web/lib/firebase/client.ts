import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
  type AppCheck
} from "firebase/app-check";
import { getMessaging, getToken, isSupported, type Messaging } from "firebase/messaging";
import { readFirebaseWebOptions } from "./config";

let app: FirebaseApp | null = null;
let appCheck: AppCheck | null = null;
let messaging: Messaging | null = null;
let started = false;

function debugWindow(): Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean } {
  return window as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean };
}

/**
 * Client-only Firebase init. Safe to call repeatedly. No-ops without public config.
 * Does not prompt for notification permission — call [getWebPushToken] from a user gesture.
 */
export async function initFirebaseClient(): Promise<FirebaseApp | null> {
  if (typeof window === "undefined") return null;
  const options = readFirebaseWebOptions();
  if (!options.app) return null;
  if (started && app) return app;

  app = getApps().length > 0 ? getApp() : initializeApp(options.app);

  if (!appCheck && options.appCheckSiteKey) {
    if (options.appCheckDebugToken && process.env.NODE_ENV !== "production") {
      debugWindow().FIREBASE_APPCHECK_DEBUG_TOKEN = options.appCheckDebugToken;
    }
    const provider =
      options.appCheckProvider === "enterprise"
        ? new ReCaptchaEnterpriseProvider(options.appCheckSiteKey)
        : new ReCaptchaV3Provider(options.appCheckSiteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true
    });
  }

  started = true;
  return app;
}

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export async function getWebPushToken(): Promise<string | null> {
  const firebaseApp = await initFirebaseClient();
  if (!firebaseApp || !(await isSupported())) return null;
  const options = readFirebaseWebOptions();
  if (!options.vapidKey) return null;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/"
  });
  messaging = messaging ?? getMessaging(firebaseApp);
  return getToken(messaging, {
    vapidKey: options.vapidKey,
    serviceWorkerRegistration: registration
  });
}
