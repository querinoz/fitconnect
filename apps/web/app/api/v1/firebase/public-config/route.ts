import { NextResponse } from "next/server";
import { readFirebaseWebOptions } from "@/lib/firebase/config";

/** Public Firebase web config for the FCM service worker. No secrets. */
export function GET() {
  const options = readFirebaseWebOptions();
  if (!options.app) {
    return NextResponse.json({ configured: false });
  }
  return NextResponse.json({
    configured: true,
    app: options.app
  });
}
