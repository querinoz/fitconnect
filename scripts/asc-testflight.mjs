#!/usr/bin/env node
/**
 * App Store Connect + TestFlight helper.
 *
 * Official API: https://developer.apple.com/documentation/appstoreconnectapi
 * JWT: ES256, aud=appstoreconnect-v1, exp ≤ 20 minutes.
 *
 * Never prints: issuer ID, key ID together with the private key, JWT, or .p8 body.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllowedTestFlightUrl } from "./lib/testflight-join-url.mjs";

const API = "https://api.appstoreconnect.apple.com";
const BUNDLE_ID = "com.fitconnect.ios";
const WATCH_BUNDLE_ID = "com.fitconnect.ios.watchkitapp";
const WIDGET_BUNDLE_ID = "com.fitconnect.ios.widgets";
const SKU = "fitconnect-ios";
const APP_NAME = "FitConnect";
const INTERNAL_GROUP = "Owner";
const EXTERNAL_GROUP = "Public Testers";
const MARKETING_DEFAULT = process.env.FITCONNECT_MARKETING_VERSION || "0.1.0";

const SECRET_NAMES = [
  "APPLE_TEAM_ID",
  "APP_STORE_CONNECT_API_KEY_ID",
  "APP_STORE_CONNECT_ISSUER_ID",
  "APP_STORE_CONNECT_API_KEY_P8",
  "IOS_GOOGLE_SERVICE_INFO_PLIST"
];

export function secretPresence(env = process.env) {
  const out = {};
  for (const name of SECRET_NAMES) {
    const raw = env[name];
    out[name] = Boolean(raw && String(raw).trim());
  }
  return out;
}

export function nextBuildNumber(existing, floor) {
  const nums = (existing || [])
    .map((v) => Number.parseInt(String(v), 10))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const maxExisting = nums.length ? Math.max(...nums) : 0;
  const minFloor = Number.parseInt(String(floor ?? 1), 10);
  const base = Number.isFinite(minFloor) && minFloor > 0 ? minFloor : 1;
  return Math.max(maxExisting + 1, base);
}

export function signAscJwt({ keyId, issuerId, privateKeyPem, nowSec }) {
  if (!keyId || !issuerId || !privateKeyPem) {
    throw new Error("ASC JWT requires key id, issuer id, and private key");
  }
  if (String(privateKeyPem).includes("BEGIN PRIVATE KEY") === false && !String(privateKeyPem).includes("BEGIN EC PRIVATE KEY")) {
    throw new Error("ASC private key is not a PEM");
  }
  const now = nowSec ?? Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: String(keyId), typ: "JWT" };
  const payload = {
    iss: String(issuerId),
    iat: now,
    exp: now + 20 * 60,
    aud: "appstoreconnect-v1"
  };
  const encoded = `${b64urlJson(header)}.${b64urlJson(payload)}`;
  const sign = crypto.createSign("SHA256");
  sign.update(encoded);
  sign.end();
  const sig = sign.sign({ key: privateKeyPem, dsaEncoding: "ieee-p1363" });
  return `${encoded}.${sig.toString("base64url")}`;
}

function b64urlJson(obj) {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}

function normalizeP8(raw) {
  let text = String(raw || "").trim().replace(/\r/g, "");
  if (text.includes("\\n")) text = text.replace(/\\n/g, "\n");
  if (!text.includes("BEGIN PRIVATE KEY") && !text.includes("BEGIN EC PRIVATE KEY")) {
    const body = text.replace(/\s+/g, "");
    const lines = body.match(/.{1,64}/g) || [];
    text = `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----`;
  }
  if (!text.endsWith("\n")) text += "\n";
  return text;
}

function readPrivateKey(env = process.env) {
  const inline = env.APP_STORE_CONNECT_API_KEY_P8;
  if (inline && inline.trim()) return normalizeP8(inline);
  const keyPath = env.APP_STORE_CONNECT_API_KEY_PATH;
  if (keyPath && fs.existsSync(keyPath)) {
    return normalizeP8(fs.readFileSync(keyPath, "utf8"));
  }
  return "";
}

function credentials(env = process.env) {
  return {
    keyId: String(env.APP_STORE_CONNECT_API_KEY_ID || "").trim(),
    issuerId: String(env.APP_STORE_CONNECT_ISSUER_ID || "").trim(),
    privateKeyPem: readPrivateKey(env)
  };
}

function hasAscCreds(env = process.env) {
  const c = credentials(env);
  return Boolean(c.keyId && c.issuerId && c.privateKeyPem);
}

async function ascFetch(pathname, { method = "GET", body } = {}, env = process.env) {
  const creds = credentials(env);
  if (!creds.keyId || !creds.issuerId || !creds.privateKeyPem) {
    throw new Error("missing App Store Connect API credentials (names only: APP_STORE_CONNECT_API_KEY_ID, APP_STORE_CONNECT_ISSUER_ID, APP_STORE_CONNECT_API_KEY_P8)");
  }
  const token = signAscJwt(creds);
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text: text.slice(0, 2000) };
}

function appleErrors(json) {
  const errs = json?.errors;
  if (!Array.isArray(errs) || !errs.length) return "";
  return errs
    .map((e) => [e.status, e.code, e.title, e.detail].filter(Boolean).join(" "))
    .join(" | ");
}

async function findApp(env = process.env) {
  const q = new URLSearchParams({
    "filter[bundleId]": BUNDLE_ID,
    limit: "5"
  });
  const res = await ascFetch(`/v1/apps?${q}`, {}, env);
  if (!res.ok) {
    return { app: null, error: appleErrors(res.json) || `apps lookup HTTP ${res.status}` };
  }
  const app = res.json?.data?.[0] || null;
  return { app, error: null };
}

async function listBundleIds(env = process.env) {
  const q = new URLSearchParams({
    "filter[identifier]": [BUNDLE_ID, WATCH_BUNDLE_ID, WIDGET_BUNDLE_ID].join(","),
    limit: "50"
  });
  const res = await ascFetch(`/v1/bundleIds?${q}`, {}, env);
  if (!res.ok) return { items: [], error: appleErrors(res.json) || `bundleIds HTTP ${res.status}` };
  return { items: res.json?.data || [], error: null };
}

async function ensureBundleId(identifier, name, env) {
  const listed = await listBundleIds(env);
  const existing = listed.items.find((b) => b.attributes?.identifier === identifier);
  if (existing) return { id: existing.id, created: false };
  const res = await ascFetch(
    "/v1/bundleIds",
    {
      method: "POST",
      body: {
        data: {
          type: "bundleIds",
          attributes: { identifier, name, platform: "IOS" }
        }
      }
    },
    env
  );
  if (res.status === 409) {
    const again = await listBundleIds(env);
    const found = again.items.find((b) => b.attributes?.identifier === identifier);
    if (found) return { id: found.id, created: false };
  }
  if (!res.ok || !res.json?.data?.id) {
    throw new Error(`bundle ID ${identifier}: ${appleErrors(res.json) || `HTTP ${res.status}`}`);
  }
  return { id: res.json.data.id, created: true };
}

async function ensureAppRecord(env = process.env) {
  const found = await findApp(env);
  if (found.app) return { app: found.app, created: false };
  const iosBundle = await ensureBundleId(BUNDLE_ID, APP_NAME, env);
  await ensureBundleId(WATCH_BUNDLE_ID, `${APP_NAME} Watch`, env);
  await ensureBundleId(WIDGET_BUNDLE_ID, `${APP_NAME} Widgets`, env);
  const res = await ascFetch(
    "/v1/apps",
    {
      method: "POST",
      body: {
        data: {
          type: "apps",
          attributes: {
            name: APP_NAME,
            primaryLocale: "en-US",
            sku: SKU
          },
          relationships: {
            bundleId: { data: { type: "bundleIds", id: iosBundle.id } }
          }
        }
      }
    },
    env
  );
  if (!res.ok) {
    throw new Error(`create app: ${appleErrors(res.json) || `HTTP ${res.status}`}`);
  }
  return { app: res.json.data, created: true };
}

async function listBuildVersions(appId, env = process.env) {
  const q = new URLSearchParams({
    "filter[app]": appId,
    "fields[builds]": "version,processingState,uploadedDate",
    sort: "-uploadedDate",
    limit: "50"
  });
  const res = await ascFetch(`/v1/builds?${q}`, {}, env);
  if (!res.ok) throw new Error(appleErrors(res.json) || `builds HTTP ${res.status}`);
  return res.json?.data || [];
}

async function resolveNextBuild(env = process.env) {
  const floor = env.GITHUB_RUN_NUMBER || env.CURRENT_PROJECT_VERSION || "1";
  if (!hasAscCreds(env)) {
    return { next: nextBuildNumber([], floor), appId: null, appFound: false, reason: "no ASC credentials" };
  }
  const found = await findApp(env);
  if (!found.app) {
    return {
      next: nextBuildNumber([], floor),
      appId: null,
      appFound: false,
      reason: found.error || "app record missing"
    };
  }
  const builds = await listBuildVersions(found.app.id, env);
  const versions = builds.map((b) => b.attributes?.version).filter(Boolean);
  return {
    next: nextBuildNumber(versions, floor),
    appId: found.app.id,
    appFound: true,
    existing: versions.slice(0, 8)
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollBuild({ appId, build, timeoutMs, intervalMs }, env = process.env) {
  const deadline = Date.now() + (timeoutMs ?? 40 * 60 * 1000);
  const interval = intervalMs ?? 45_000;
  let last = null;
  while (Date.now() < deadline) {
    const builds = await listBuildVersions(appId, env);
    const match =
      builds.find((b) => String(b.attributes?.version) === String(build)) || builds[0] || null;
    last = match;
    const state = match?.attributes?.processingState || "UNKNOWN";
    console.log(`ASC processing: build=${match?.attributes?.version || "?"} state=${state}`);
    if (state === "VALID" || state === "FAILED" || state === "INVALID" || state === "EXPIRED") {
      return { state, build: match };
    }
    await sleep(interval);
  }
  return { state: last?.attributes?.processingState || "TIMEOUT", build: last };
}

async function listBetaGroups(appId, env = process.env) {
  const q = new URLSearchParams({
    "filter[app]": appId,
    "fields[betaGroups]":
      "name,isInternalGroup,publicLinkEnabled,publicLink,publicLinkId,publicLinkLimitEnabled",
    limit: "50"
  });
  const res = await ascFetch(`/v1/betaGroups?${q}`, {}, env);
  if (!res.ok) throw new Error(appleErrors(res.json) || `betaGroups HTTP ${res.status}`);
  return res.json?.data || [];
}

async function createBetaGroup(appId, { name, isInternal, publicLinkEnabled }, env = process.env) {
  const res = await ascFetch(
    "/v1/betaGroups",
    {
      method: "POST",
      body: {
        data: {
          type: "betaGroups",
          attributes: {
            name,
            isInternalGroup: Boolean(isInternal),
            hasAccessToAllBuilds: Boolean(isInternal),
            publicLinkEnabled: Boolean(publicLinkEnabled),
            publicLinkLimitEnabled: false
          },
          relationships: {
            app: { data: { type: "apps", id: appId } }
          }
        }
      }
    },
    env
  );
  if (!res.ok) throw new Error(`${name}: ${appleErrors(res.json) || `HTTP ${res.status}`}`);
  return res.json.data;
}

async function enablePublicLink(groupId, env = process.env) {
  const res = await ascFetch(
    `/v1/betaGroups/${groupId}`,
    {
      method: "PATCH",
      body: {
        data: {
          type: "betaGroups",
          id: groupId,
          attributes: { publicLinkEnabled: true, publicLinkLimitEnabled: false }
        }
      }
    },
    env
  );
  if (!res.ok) throw new Error(appleErrors(res.json) || `publicLink PATCH HTTP ${res.status}`);
  return res.json.data;
}

async function assignBuildToGroup(groupId, buildId, env = process.env) {
  const res = await ascFetch(
    `/v1/betaGroups/${groupId}/relationships/builds`,
    {
      method: "POST",
      body: { data: [{ type: "builds", id: buildId }] }
    },
    env
  );
  if (!res.ok && res.status !== 409) {
    throw new Error(appleErrors(res.json) || `assign build HTTP ${res.status}`);
  }
}

async function submitBetaReview(buildId, env = process.env) {
  const res = await ascFetch(
    "/v1/betaAppReviewSubmissions",
    {
      method: "POST",
      body: {
        data: {
          type: "betaAppReviewSubmissions",
          relationships: {
            build: { data: { type: "builds", id: buildId } }
          }
        }
      }
    },
    env
  );
  if (res.status === 409) {
    return { submitted: false, reason: "already submitted or not eligible yet" };
  }
  if (!res.ok) {
    return { submitted: false, reason: appleErrors(res.json) || `HTTP ${res.status}` };
  }
  return { submitted: true, id: res.json?.data?.id };
}

function publicLinkFromGroup(group) {
  const attrs = group?.attributes || {};
  const raw = attrs.publicLink || (attrs.publicLinkId ? `https://testflight.apple.com/join/${attrs.publicLinkId}` : "");
  return parseAllowedTestFlightUrl(raw);
}

async function ensureGroupsAndLink(appId, buildId, env = process.env) {
  let groups = await listBetaGroups(appId, env);
  let internal = groups.find((g) => g.attributes?.isInternalGroup) || groups.find((g) => g.attributes?.name === INTERNAL_GROUP);
  let external =
    groups.find((g) => g.attributes?.name === EXTERNAL_GROUP && !g.attributes?.isInternalGroup) ||
    groups.find((g) => !g.attributes?.isInternalGroup);

  if (!internal) {
    try {
      internal = await createBetaGroup(appId, { name: INTERNAL_GROUP, isInternal: true, publicLinkEnabled: false }, env);
    } catch (err) {
      console.log(`WARN internal group: ${err.message}`);
    }
  }
  if (!external) {
    try {
      external = await createBetaGroup(appId, { name: EXTERNAL_GROUP, isInternal: false, publicLinkEnabled: true }, env);
    } catch (err) {
      console.log(`WARN external group: ${err.message}`);
    }
  }

  if (buildId && internal?.id) {
    try {
      await assignBuildToGroup(internal.id, buildId, env);
      console.log(`assigned build to internal group ${INTERNAL_GROUP}`);
    } catch (err) {
      console.log(`WARN assign internal: ${err.message}`);
    }
  }
  if (buildId && external?.id) {
    try {
      await assignBuildToGroup(external.id, buildId, env);
      console.log(`assigned build to external group ${EXTERNAL_GROUP}`);
    } catch (err) {
      console.log(`WARN assign external: ${err.message}`);
    }
  }

  let link = publicLinkFromGroup(external);
  if (external?.id && !link) {
    try {
      const updated = await enablePublicLink(external.id, env);
      link = publicLinkFromGroup(updated);
    } catch (err) {
      console.log(`WARN public link: ${err.message}`);
    }
  }

  let review = null;
  if (buildId && external?.id) {
    review = await submitBetaReview(buildId, env);
    if (review.submitted) console.log("beta app review submission created");
    else console.log(`beta review: ${review.reason}`);
  }

  return { internal, external, publicLink: link, review };
}

function writeGithubOutput(map) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  const lines = Object.entries(map)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.appendFileSync(file, `${lines}\n`, "utf8");
}

function cmd() {
  return process.argv[2] || "probe";
}

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return "";
  return process.argv[i + 1] || "";
}

async function main() {
  const action = cmd();
  if (action === "probe") {
    const presence = secretPresence();
    for (const [name, ok] of Object.entries(presence)) {
      console.log(`${name} present: ${ok}`);
    }
    const ready = Object.values(presence).every(Boolean);
    console.log(`upload_secrets_ready: ${ready}`);
    console.log(`asc_api_ready: ${hasAscCreds()}`);
    process.exit(ready ? 0 : 2);
  }

  if (action === "next-build") {
    const result = await resolveNextBuild();
    console.log(`APP_FOUND=${result.appFound}`);
    if (result.appId) console.log(`APP_ID=${result.appId}`);
    if (result.reason) console.log(`REASON=${result.reason}`);
    console.log(`NEXT_BUILD=${result.next}`);
    console.log(`MARKETING_VERSION=${MARKETING_DEFAULT}`);
    writeGithubOutput({
      app_found: String(result.appFound),
      app_id: result.appId || "",
      next_build: String(result.next)
    });
    process.stdout.write("");
    return;
  }

  if (action === "ensure") {
    const { app, created } = await ensureAppRecord();
    console.log(`APP_ID=${app.id}`);
    console.log(`APP_CREATED=${created}`);
    console.log(`BUNDLE_ID=${BUNDLE_ID}`);
    writeGithubOutput({ app_id: app.id, app_created: String(created) });
    return;
  }

  if (action === "poll" || action === "after-upload") {
    const found = await findApp();
    if (!found.app) {
      console.error(`FAIL: no App Store Connect app for ${BUNDLE_ID}`);
      if (found.error) console.error(found.error);
      process.exit(1);
    }
    const build = flag("build") || process.env.CURRENT_PROJECT_VERSION || process.env.GITHUB_RUN_NUMBER;
    if (!build) {
      console.error("FAIL: pass --build N");
      process.exit(1);
    }
    const polled = await pollBuild({ appId: found.app.id, build });
    console.log(`PROCESSING_STATE=${polled.state}`);
    writeGithubOutput({ processing_state: polled.state, build_id: polled.build?.id || "" });
    if (polled.state === "FAILED" || polled.state === "INVALID") {
      console.error("FAIL: App Store Connect processing failed. Fix the reported issue, increment the build, upload again.");
      process.exit(1);
    }
    if (polled.state !== "VALID") {
      console.log("WAITING FOR APPLE PROCESSING — CI will not invent a TestFlight link.");
      writeGithubOutput({ public_link: "" });
      process.exit(0);
    }
    const dist = await ensureGroupsAndLink(found.app.id, polled.build.id);
    if (dist.publicLink) {
      console.log(`PUBLIC_LINK=${dist.publicLink}`);
      writeGithubOutput({ public_link: dist.publicLink });
    } else {
      console.log("PUBLIC_LINK= (Apple has not issued a join URL yet — usually after beta review)");
      writeGithubOutput({ public_link: "" });
    }
    return;
  }

  if (action === "public-link") {
    const found = await findApp();
    if (!found.app) {
      console.error(`FAIL: no app for ${BUNDLE_ID}`);
      process.exit(1);
    }
    const groups = await listBetaGroups(found.app.id);
    const links = groups.map(publicLinkFromGroup).filter(Boolean);
    if (!links.length) {
      console.log("PUBLIC_LINK=");
      console.log("No TestFlight public join URL exists yet. Do not invent one.");
      process.exit(2);
    }
    console.log(`PUBLIC_LINK=${links[0]}`);
    writeGithubOutput({ public_link: links[0] });
    return;
  }

  console.error(`unknown command: ${action}`);
  process.exit(1);
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((err) => {
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  });
}

export { hasAscCreds, BUNDLE_ID, APP_NAME, SKU };
