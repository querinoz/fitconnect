"use client";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

let client: ConvexHttpClient | null = null;

/** ConvexReactClient throws unless the address is an absolute http(s) URL. */
export function isAbsoluteHttpUrl(value: string | undefined | null): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function readConvexUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const url = env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? null;
  return isAbsoluteHttpUrl(url) ? url : null;
}

export function getConvexHttpClient(): ConvexHttpClient | null {
  const url = readConvexUrl();
  if (!url) return null;
  try {
    if (!client) client = new ConvexHttpClient(url);
    return client;
  } catch {
    return null;
  }
}

export function isConvexConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return readConvexUrl(env) !== null;
}

export { api };
