#!/usr/bin/env node
/**
 * Set Vercel Production IOS_TESTFLIGHT_URL only after a real allowlisted join URL exists.
 * Never writes the URL into git. Never prints VERCEL_TOKEN.
 */
import { parseAllowedTestFlightUrl } from "./lib/testflight-join-url.mjs";

const KEY = "IOS_TESTFLIGHT_URL";

function vercelHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function teamQuery() {
  const team = process.env.VERCEL_ORG_ID || process.env.VERCEL_TEAM_ID || "";
  return team ? `teamId=${encodeURIComponent(team)}` : "";
}

export async function upsertVercelProductionEnv({ url, token, projectId, fetchImpl = fetch }) {
  const parsed = parseAllowedTestFlightUrl(url);
  if (!parsed) {
    throw new Error("refusing to set IOS_TESTFLIGHT_URL — value is not https://testflight.apple.com/join/{code}");
  }
  if (!token || !projectId) {
    return { configured: false, url: parsed, reason: "missing VERCEL_TOKEN or VERCEL_PROJECT_ID" };
  }
  const q = teamQuery();
  const listUrl = `https://api.vercel.com/v9/projects/${projectId}/env${q ? `?${q}` : ""}`;
  const listed = await fetchImpl(listUrl, { headers: vercelHeaders(token) });
  const listedJson = await listed.json().catch(() => ({}));
  if (!listed.ok) {
    throw new Error(`Vercel env list HTTP ${listed.status}`);
  }
  const existing = (listedJson.envs || listedJson || []).find?.((row) => row.key === KEY && (row.target || []).includes("production"))
    || (Array.isArray(listedJson.envs) ? listedJson.envs.find((row) => row.key === KEY) : null);

  if (existing?.id) {
    const patchUrl = `https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}${q ? `?${q}` : ""}`;
    const patched = await fetchImpl(patchUrl, {
      method: "PATCH",
      headers: vercelHeaders(token),
      body: JSON.stringify({ value: parsed, type: "encrypted", target: ["production"] })
    });
    if (!patched.ok) throw new Error(`Vercel env patch HTTP ${patched.status}`);
    return { configured: true, updated: true, url: parsed };
  }

  const createUrl = `https://api.vercel.com/v10/projects/${projectId}/env${q ? `?${q}` : ""}`;
  const created = await fetchImpl(createUrl, {
    method: "POST",
    headers: vercelHeaders(token),
    body: JSON.stringify({
      key: KEY,
      value: parsed,
      type: "encrypted",
      target: ["production"],
      comment: "TestFlight public join — never commit"
    })
  });
  if (!created.ok) throw new Error(`Vercel env create HTTP ${created.status}`);
  return { configured: true, updated: false, url: parsed };
}

function humanSteps(url) {
  console.log("HUMAN — Vercel Production environment variable");
  console.log("Screen: https://vercel.com → FitConnect project → Settings → Environment Variables");
  console.log(`Key: ${KEY}`);
  console.log("Environment: Production (only)");
  console.log("Value: the real TestFlight URL (never invent a join code)");
  if (url) console.log(`Value format: ${url}`);
  console.log("Then: Deployments → Production → Redeploy (or push to feat/elite-os-v2)");
}

async function main() {
  const raw = process.argv[2] || process.env.IOS_TESTFLIGHT_URL || "";
  const parsed = parseAllowedTestFlightUrl(raw);
  if (!parsed) {
    console.error("FAIL: pass a real https://testflight.apple.com/join/{6-32 alnum} URL. Do not invent one.");
    humanSteps("");
    process.exit(1);
  }
  const token = process.env.VERCEL_TOKEN || "";
  const projectId = process.env.VERCEL_PROJECT_ID || "";
  if (!token || !projectId) {
    console.log("VERCEL_TOKEN or VERCEL_PROJECT_ID absent in this environment — not printing any token.");
    humanSteps(parsed);
    process.exit(2);
  }
  const result = await upsertVercelProductionEnv({ url: parsed, token, projectId });
  console.log(`IOS_TESTFLIGHT_URL ${result.updated ? "updated" : "created"} on Vercel Production`);
  console.log("Redeploy production so /ios reads the new value (force-dynamic).");
}

const invoked = process.argv[1] && process.argv[1].includes("set-ios-testflight-url.mjs");
if (invoked) {
  main().catch((err) => {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  });
}
