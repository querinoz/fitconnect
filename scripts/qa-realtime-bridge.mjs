#!/usr/bin/env node
/** Two-step realtime bridge smoke against a running dev server. */

const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3001";
const channel = "athlete:qa-bridge-user";
const token = process.env.QA_FIREBASE_TOKEN ?? "";

async function main() {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const payload = {
    kind: "live-tick",
    athleteId: "qa-bridge-user",
    hr: 142,
    pace: 5.1,
    cadence: 168,
    elapsedSec: 30,
    at: new Date().toISOString()
  };

  const post = await fetch(`${base}/api/v1/realtime/bridge`, {
    method: "POST",
    headers,
    body: JSON.stringify({ channel, payload })
  });
  if (!post.ok) {
    console.error("POST failed", post.status, await post.text());
    process.exit(1);
  }
  const { at } = await post.json();

  const get = await fetch(`${base}/api/v1/realtime/bridge?channel=${encodeURIComponent(channel)}&since=0`, {
    headers
  });
  if (!get.ok) {
    console.error("GET failed", get.status, await get.text());
    process.exit(1);
  }
  const body = await get.json();
  const hit = body.messages?.some((m) => m.at === at && m.payload?.kind === "live-tick");
  if (!hit) {
    console.error("No matching live-tick in bridge buffer", body);
    process.exit(1);
  }
  console.log("REALTIME_BRIDGE_PASS", { at, count: body.messages.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
