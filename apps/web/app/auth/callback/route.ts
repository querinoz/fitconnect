import { NextResponse } from "next/server";

/** Legacy Supabase Auth callback. Canonical identity is Firebase Auth (popup / SDK). */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/signin";
  const target = next.startsWith("/") ? next : "/signin";
  return NextResponse.redirect(`${origin}${target}`);
}
