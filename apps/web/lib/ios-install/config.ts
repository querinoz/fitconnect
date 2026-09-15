import { IOS_INSTALL_PATH, OFFICIAL_TESTFLIGHT_APP_URL, parseAllowedTestFlightUrl } from "./allowlist";
import type { IosInstallPublicConfig } from "./types";

export type { IosInstallPublicConfig } from "./types";

type EnvMap = Record<string, string | undefined>;

function cleanOptional(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "not configured" || lower === "undefined" || lower === "null") return null;
  if (lower.includes("paste_") || lower.includes("your-") || lower.includes("xxxxxxxx")) return null;
  return trimmed;
}

function siteOrigin(env: EnvMap = process.env): string {
  const raw = env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")?.trim();
  if (raw && /^https:\/\//i.test(raw) && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw;
  }
  return "https://fitconnect-phi.vercel.app";
}

export function readConfiguredTestFlightUrl(env: EnvMap = process.env): string | null {
  return parseAllowedTestFlightUrl(
    env.IOS_TESTFLIGHT_URL ?? env.IOS_INSTALL_URL ?? env.NEXT_PUBLIC_IOS_INSTALL_URL
  );
}

export function readIosInstallPublicConfig(env: EnvMap = process.env): IosInstallPublicConfig {
  const origin = siteOrigin(env);
  const installAbsoluteUrl = `${origin}${IOS_INSTALL_PATH}`;
  const destination = readConfiguredTestFlightUrl(env);
  const configured = Boolean(destination);

  return {
    configured,
    qrTarget: configured ? installAbsoluteUrl : null,
    installPath: IOS_INSTALL_PATH,
    installAbsoluteUrl,
    testflightAppUrl: OFFICIAL_TESTFLIGHT_APP_URL,
    version: cleanOptional(env.IOS_VERSION ?? env.NEXT_PUBLIC_IOS_VERSION),
    build: cleanOptional(env.IOS_BUILD ?? env.NEXT_PUBLIC_IOS_BUILD),
    betaStatus: cleanOptional(env.IOS_BETA_STATUS ?? env.NEXT_PUBLIC_IOS_BETA_STATUS),
    distributionLabel: "TestFlight"
  };
}
