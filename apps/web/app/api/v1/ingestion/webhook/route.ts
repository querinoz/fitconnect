import { NextResponse } from "next/server";
import {
  ingestOuraWebhook,
  ingestStravaWebhook,
  ingestWhoopWebhook
} from "@/lib/ingestion";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isInsecurePlaceholderSecret, isProductionSecurityMode } from "@/lib/security/runtime";

function ingestionSecret(): string | null {
  const value = process.env.INGESTION_WEBHOOK_SECRET?.trim() || process.env.INTEGRATION_AUTH_SECRET?.trim();
  if (isInsecurePlaceholderSecret(value)) return null;
  return value ?? null;
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "ingestion");
  if (limited) return limited;

  const secret = ingestionSecret();
  if (!secret) {
    if (isProductionSecurityMode() || process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
      return NextResponse.json({ error: "ingestion_not_configured" }, { status: 503 });
    }
  } else {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const provider = new URL(req.url).searchParams.get("provider") ?? "whoop";
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  let result;
  switch (provider) {
    case "oura":
      result = ingestOuraWebhook(payload);
      break;
    case "strava":
      result = ingestStravaWebhook(payload);
      break;
    case "whoop":
    default:
      result = ingestWhoopWebhook(payload);
      break;
  }

  return NextResponse.json(result);
}
