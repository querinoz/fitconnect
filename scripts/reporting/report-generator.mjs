/**
 * ReportGenerator — builds a concise WhatsApp-safe Phase 17 summary.
 * Never interpolates secrets or local filesystem paths into the outbound text.
 */

const DEFAULT_RECIPIENT_HINT = "+351933169643";

/**
 * @param {Record<string, unknown>} status
 * @returns {string}
 */
export function buildWhatsAppSummary(status) {
  const phase = String(status.phase ?? "PHASE 17");
  const overall = String(status.overall ?? "BLOCKED");
  const tests = String(status.tests ?? "PENDING");
  const build = String(status.build ?? "PENDING");
  const emulator = String(status.emulator ?? "BLOCKED");
  const watchos = String(status.watchos ?? "PENDING_ENVIRONMENT");
  const deleted = Number(status.obsoleteFilesRemoved ?? 0);
  const merged = Number(status.duplicateComponentsMerged ?? 0);
  const security = Number(status.securityFindings ?? 0);
  const pending = Array.isArray(status.pendingHuman)
    ? status.pendingHuman.map((line) => `- ${line}`).join("\n")
    : "- (none)";
  const reportPath = String(status.reportRepoPath ?? "docs/phase-17/PHASE_17_FINAL_REPORT.md");

  return [
    `FITCONNECT — ${phase}`,
    "",
    `STATUS: ${overall}`,
    "",
    `Repository cleanup: ${status.repository ?? "PENDING"}`,
    `Android: ${status.android ?? "PENDING"}`,
    `Web App: ${status.webApp ?? "PENDING"}`,
    `Landing: ${status.landing ?? "PENDING"}`,
    `watchOS: ${watchos}`,
    `Tests: ${tests}`,
    `Build: ${build}`,
    `Emulator: ${emulator}`,
    "",
    `Deleted:`,
    `${deleted} obsolete files`,
    "",
    `Merged:`,
    `${merged} duplicate components`,
    "",
    `Security findings:`,
    `${security}`,
    "",
    `Pending Human:`,
    pending,
    "",
    `Full report generated:`,
    reportPath
  ].join("\n");
}

export function defaultRecipient() {
  return process.env.WHATSAPP_RECIPIENT?.trim() || DEFAULT_RECIPIENT_HINT;
}

export function loadWhatsAppEnv(env = process.env) {
  return {
    provider: String(env.WHATSAPP_PROVIDER ?? "").trim().toLowerCase(),
    phoneNumberId: String(env.WHATSAPP_PHONE_NUMBER_ID ?? "").trim(),
    accessToken: String(env.WHATSAPP_ACCESS_TOKEN ?? "").trim(),
    recipient: String(env.WHATSAPP_RECIPIENT ?? DEFAULT_RECIPIENT_HINT).trim(),
    twilioSid: String(env.TWILIO_ACCOUNT_SID ?? "").trim(),
    twilioToken: String(env.TWILIO_AUTH_TOKEN ?? "").trim(),
    twilioFrom: String(env.TWILIO_WHATSAPP_FROM ?? "").trim()
  };
}

export function classifyWhatsAppReadiness(cfg) {
  if (!cfg.provider) {
    return { ok: false, reason: "WHATSAPP_PROVIDER unset" };
  }
  if (cfg.provider === "meta") {
    if (!cfg.phoneNumberId || !cfg.accessToken) {
      return { ok: false, reason: "Meta Cloud credentials missing" };
    }
    return { ok: true, reason: "meta" };
  }
  if (cfg.provider === "twilio") {
    if (!cfg.twilioSid || !cfg.twilioToken || !cfg.twilioFrom) {
      return { ok: false, reason: "Twilio credentials missing" };
    }
    return { ok: true, reason: "twilio" };
  }
  return { ok: false, reason: `Unknown WHATSAPP_PROVIDER=${cfg.provider}` };
}
