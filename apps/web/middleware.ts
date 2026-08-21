import { NextResponse, type NextRequest } from "next/server";
import { STORAGE_KEY } from "@/lib/i18n/server";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import {
  isDemoModeEnv,
  shouldEnforceFirebaseAuth,
  hasValidDemoSessionCookie,
  hasFirebaseSessionCookie,
  isProtectedPath,
} from "@/lib/auth/middleware-auth";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";
import {
  DEMO_SESSION_COOKIE,
  isAllowedDemoSessionId
} from "@/lib/auth/demo-session";

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

  const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  if (hasValidDemoSessionCookie(demoCookie, isAllowedDemoSessionId)) {
    return NextResponse.next();
  }

  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("next", pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webmanifest|js|css|woff2)$|api/).*)"
  ]
};
