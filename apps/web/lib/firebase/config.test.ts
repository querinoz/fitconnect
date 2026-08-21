import { describe, expect, it } from "vitest";
import { isFirebaseWebConfigured, readFirebaseWebOptions } from "./config";

const complete = {
  ...process.env,
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyTest",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "fitconnect.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "fitconnect",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "fitconnect.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc"
};

describe("readFirebaseWebOptions", () => {
  it("returns null app when incomplete", () => {
    const options = readFirebaseWebOptions({
      ...process.env,
      NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyTest",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: undefined,
      NEXT_PUBLIC_FIREBASE_APP_ID: undefined
    });
    expect(options.app).toBeNull();
    expect(
      isFirebaseWebConfigured({
        ...process.env,
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
        NEXT_PUBLIC_FIREBASE_APP_ID: undefined
      })
    ).toBe(false);
  });

  it("returns public app config without secrets", () => {
    const options = readFirebaseWebOptions({
      ...complete,
      NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: "recaptcha-site",
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: "vapid",
      NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER: "enterprise"
    });
    expect(options.app?.projectId).toBe("fitconnect");
    expect(options.vapidKey).toBe("vapid");
    expect(options.appCheckSiteKey).toBe("recaptcha-site");
    expect(options.appCheckProvider).toBe("enterprise");
    expect(JSON.stringify(options)).not.toMatch(/SECRET|private|serviceAccount/i);
  });

  it("treats placeholder values as unset", () => {
    const options = readFirebaseWebOptions({
      ...complete,
      NEXT_PUBLIC_FIREBASE_API_KEY: "your-api-key"
    });
    expect(options.app).toBeNull();
  });
});
