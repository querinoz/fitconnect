import { NextResponse, type NextRequest } from "next/server";
import { STORAGE_KEY } from "@/lib/i18n/server";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import {
  isDemoModeEnv,
  shouldEnforceFirebaseAuth,
  hasFirebaseSessionCookie,
  isProtectedPath,
} from "@/lib/auth/middleware-auth";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";

function isLang(value: string | null): value is Lang {
  return value !== null && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const langParam = request.nextUrl.searchParams.get("lang");
  if (langParam && isLang(langParam)) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("lang");
    const response = NextResponse.redirect(clean);
    response.cookies.set(STORAGE_KEY, langParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return response;
  }

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const demoMode = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE);
  const firebaseConfigured = isFirebaseWebConfigured();

  if (!shouldEnforceFirebaseAuth({ demoMode, firebaseConfigured })) {
    return NextResponse.next();
  }

  const firebaseCookie = request.cookies.get(FIREBASE_ID_COOKIE)?.value;
  if (hasFirebaseSessionCookie(firebaseCookie)) {
    return NextResponse.next();
  }

  // SECURITY: the demo-session cookie is NOT an authentication factor. We only
  // reach this point when shouldEnforceFirebaseAuth() is true, i.e. demo mode
  // is OFF and Firebase is configured -- so honouring it here let anyone set
  // `fc-demo-session=user-x` in the browser and walk into every protected page.
  // Demo deployments skip this whole block at the shouldEnforceFirebaseAuth
  // check above.
  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("next", pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webmanifest|js|css|woff2)$|api/).*)"
  ]
};
