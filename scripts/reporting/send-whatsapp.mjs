#!/usr/bin/env node
/**
 * Send a Phase 17 summary via an official WhatsApp provider.
 * If credentials are missing: exit 0 with WHATSAPP = PENDING_HUMAN.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWhatsAppSummary,
  classifyWhatsAppReadiness,
  loadWhatsAppEnv
} from "./report-generator.mjs";
import { createWhatsAppProvider } from "./whatsapp-provider.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATUS_PATH = path.join(ROOT, "docs/phase-17/STATUS.json");
const ATTEMPT_PATH = path.join(ROOT, "docs/phase-17/WHATSAPP_LAST_ATTEMPT.json");

function loadDotEnvWhatsApp() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key.startsWith("WHATSAPP_") && !key.startsWith("TWILIO_")) continue;
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function writeAttempt(payload) {
  fs.mkdirSync(path.dirname(ATTEMPT_PATH), { recursive: true });
  fs.writeFileSync(ATTEMPT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}

loadDotEnvWhatsApp();

const status = fs.existsSync(STATUS_PATH)
  ? JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"))
  : { overall: "BLOCKED", pendingHuman: ["STATUS.json missing"] };

const body = buildWhatsAppSummary(status);
const cfg = loadWhatsAppEnv(process.env);
const ready = classifyWhatsAppReadiness(cfg);

if (!ready.ok) {
  console.log("WHATSAPP = PENDING_HUMAN");
  console.log(`reason: ${ready.reason}`);
  console.log("Configure official Meta Cloud or Twilio credentials. See docs/phase-17/WHATSAPP_SETUP.md");
  writeAttempt({
    status: "PENDING_HUMAN",
    reason: ready.reason,
    provider: cfg.provider || null,
    recipientConfigured: Boolean(cfg.recipient),
    sentAt: null
  });
  process.exit(0);
}

const provider = createWhatsAppProvider(cfg);
try {
  await provider.sendText(cfg.recipient, body);
  console.log("WHATSAPP = SENT");
  writeAttempt({
    status: "SENT",
    provider: cfg.provider,
    recipientConfigured: true,
    documentUploaded: false,
    sentAt: new Date().toISOString()
  });
} catch {
  console.log("WHATSAPP = FAILED");
  console.log("Official provider rejected the request. Credentials were not printed.");
  writeAttempt({
    status: "FAILED",
    provider: cfg.provider,
    recipientConfigured: true,
    sentAt: new Date().toISOString()
  });
  process.exit(0);
}
