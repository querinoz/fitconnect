import { NextResponse } from "next/server";
import { readConfiguredTestFlightUrl } from "@/lib/ios-install/config";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow"
};

export function GET() {
  const dest = readConfiguredTestFlightUrl();
  if (!dest) {
    return new NextResponse("TESTFLIGHT LINK NOT CONFIGURED", {
      status: 404,
      headers: {
        ...NO_STORE,
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
  const response = NextResponse.redirect(dest, 302);
  for (const [key, value] of Object.entries(NO_STORE)) {
    response.headers.set(key, value);
  }
  return response;
}
