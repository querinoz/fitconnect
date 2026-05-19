"use client";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

let client: ConvexHttpClient | null = null;

export function getConvexHttpClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!url) return null;
  if (!client) client = new ConvexHttpClient(url);
  return client;
}

export function isConvexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL?.trim());
}

export { api };
