import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { STORAGE_KEY } from "@/lib/i18n/server";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/coach",
  "/sessions",
  "/inbox",
  "/my-coach",
  "/profile",
  "/settings",
  "/admin"
];

function isLang(value: string | null): value is Lang {
  return value !== null && (SUPPORTED_LANGS as string[]).includes(value);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
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

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  const isProduction = process.env.VERCEL_ENV === "production";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isProduction && (demoMode || !url || !key)) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname);
    signIn.searchParams.set("error", demoMode ? "demo-disabled" : "auth-unconfigured");
    return NextResponse.redirect(signIn);
  }

  if (demoMode || !url || !key) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webmanifest|js|css|woff2)$|api/).*)"
  ]
};
