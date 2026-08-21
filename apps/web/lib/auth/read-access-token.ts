import { cookies, headers } from "next/headers";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";

export function bearerFromHeader(value: string | null | undefined): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export async function readAccessToken(request?: Request): Promise<string | null> {
  if (request) {
    const fromHeader = bearerFromHeader(request.headers.get("authorization"));
    if (fromHeader) return fromHeader;
    const fromCookie = cookieValue(request.headers.get("cookie"), FIREBASE_ID_COOKIE);
    if (fromCookie) return fromCookie;
  }

  try {
    const h = await headers();
    const fromHeader = bearerFromHeader(h.get("authorization"));
    if (fromHeader) return fromHeader;
  } catch {
    /* not in a Next request context */
  }

  try {
    const jar = await cookies();
    return jar.get(FIREBASE_ID_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}
