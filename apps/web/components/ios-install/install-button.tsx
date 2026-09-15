"use client";

import Link from "next/link";
import { useState } from "react";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { trackIosInstallEvent } from "@/lib/ios-install/track";
import type { IosInstallPublicConfig } from "@/lib/ios-install/types";

type Props = {
  config: IosInstallPublicConfig;
  isAppleMobile: boolean;
};

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function InstallButton({ config, isAppleMobile }: Props) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const [shareFailed, setShareFailed] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(config.installAbsoluteUrl);
    setCopied(ok ? "copied" : "failed");
    if (ok) trackIosInstallEvent("ios_copy_link");
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  const onShare = async () => {
    setShareFailed(false);
    if (!navigator.share) {
      setShareFailed(true);
      return;
    }
    try {
      await navigator.share({
        title: "FitConnect™ for iPhone",
        text: "Install and test FitConnect on iPhone.",
        url: config.installAbsoluteUrl
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      if (name !== "AbortError") setShareFailed(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {config.configured ? (
        <VoltButton asChild className="h-12 w-full cursor-pointer text-[13px] tracking-[0.12em]">
          <a
            href={config.installPath}
            onClick={() => trackIosInstallEvent("ios_install_click", { appleMobile: isAppleMobile })}
          >
            {isAppleMobile ? "OPEN INSTALLATION LINK" : "INSTALL ON IPHONE"}
          </a>
        </VoltButton>
      ) : (
        <VoltButton
          disabled
          variant="subtle"
          aria-disabled="true"
          className="h-12 w-full cursor-not-allowed text-[13px] tracking-[0.12em]"
        >
          INSTALL UNAVAILABLE
        </VoltButton>
      )}

      {config.configured ? (
        <a
          href="#ios-qr"
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--eos-iris)_45%,transparent)] px-5 text-[13px] font-semibold tracking-[0.12em] text-[var(--eos-iris)] transition-colors duration-200 hover:border-[var(--eos-iris)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--eos-voltline)]"
        >
          SCAN QR CODE
        </a>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {config.configured ? (
          <button
            type="button"
            onClick={() => void onCopy()}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/10 px-4 text-xs font-semibold tracking-wide text-ink-100 transition-colors duration-200 hover:border-[var(--eos-voltline)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--eos-voltline)]"
          >
            {copied === "copied" ? "Copied" : "Copy install link"}
          </button>
        ) : null}
        {config.configured ? (
          <button
            type="button"
            onClick={() => void onShare()}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-white/10 px-4 text-xs font-semibold tracking-wide text-ink-100 transition-colors duration-200 hover:border-[var(--eos-telemetry)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--eos-voltline)]"
          >
            Share FitConnect iOS
          </button>
        ) : null}
      </div>
      {copied === "failed" ? (
        <p className="text-xs text-[var(--eos-recovery)]" role="status">
          Clipboard unavailable. Select the install URL below and copy it manually.
        </p>
      ) : null}
      {shareFailed ? (
        <p className="text-xs text-ink-300" role="status">
          Share is not available here. Copy the install link instead.
        </p>
      ) : null}

      {config.configured ? (
        <p className="break-all font-mono text-[11px] leading-relaxed text-ink-300">
          <span className="sr-only">Install URL: </span>
          <Link
            href={config.installPath}
            className="cursor-pointer text-[var(--eos-telemetry)] underline-offset-4 hover:underline"
          >
            {config.installAbsoluteUrl}
          </Link>
        </p>
      ) : null}

      <a
        href={config.testflightAppUrl}
        rel="noopener noreferrer"
        onClick={() => trackIosInstallEvent("ios_testflight_click")}
        className="inline-flex min-h-11 cursor-pointer items-center text-xs font-medium text-ink-300 underline-offset-4 hover:text-[var(--eos-voltline)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--eos-voltline)]"
      >
        Get TestFlight on the App Store
      </a>
    </div>
  );
}
