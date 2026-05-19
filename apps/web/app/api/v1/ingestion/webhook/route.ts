import { NextResponse } from "next/server";
import {
  ingestOuraWebhook,
  ingestStravaWebhook,
  ingestWhoopWebhook
} from "@/lib/ingestion";

export async function POST(req: Request) {
  const provider = new URL(req.url).searchParams.get("provider") ?? "whoop";
  const payload = (await req.json()) as Record<string, unknown>;

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
