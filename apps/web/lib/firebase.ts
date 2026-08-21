export {
  isFirebaseWebConfigured,
  readFirebaseWebOptions,
  type FirebasePublicConfig,
  type FirebaseWebOptions
} from "./firebase/config";

/** Client-only. Safe to import from Server Components — loads Firebase in the browser. */
export async function initFirebaseClient() {
  const { initFirebaseClient: start } = await import("./firebase/client");
  return start();
}

export async function getWebPushToken() {
  const { getWebPushToken: token } = await import("./firebase/client");
  return token();
}
