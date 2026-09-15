"use client";

import { useEffect, useRef } from "react";
import type { IosQrPath } from "@/lib/ios-install/types";
import { trackIosInstallEvent } from "@/lib/ios-install/track";

type Props = {
  qr: IosQrPath | null;
  qrFailed: boolean;
  configured: boolean;
  installUrl: string;
};

export function QrCodeCard({ qr, qrFailed, configured, installUrl }: Props) {
  const seen = useRef(false);

  useEffect(() => {
    if (!qr || seen.current) return;
    const node = document.getElementById("ios-qr");
    if (!node || typeof IntersectionObserver === "undefined") {
      trackIosInstallEvent("ios_qr_view");
      seen.current = true;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !seen.current) {
          seen.current = true;
          trackIosInstallEvent("ios_qr_view");
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [qr]);

  if (!configured) {
    return (
      <div
        id="ios-qr"
        className="flex min-h-[16rem] flex-col justify-center rounded-[var(--eos-radius-modal)] border border-[color:color-mix(in_srgb,var(--eos-alert)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--eos-floor)_88%,var(--eos-alert))] px-6 py-8 text-left"
        role="status"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--eos-alert)]">
          TestFlight link not configured
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-100">
          The iOS build must first be distributed through the configured Apple
          distribution channel. A QR code is not shown until a real TestFlight
          join URL is set.
        </p>
      </div>
    );
  }

  if (qrFailed || !qr) {
    return (
      <div
        id="ios-qr"
        className="flex min-h-[16rem] flex-col justify-center rounded-[var(--eos-radius-modal)] border border-[color:color-mix(in_srgb,var(--eos-recovery)_40%,transparent)] bg-[var(--eos-elevated)] px-6 py-8"
        role="alert"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--eos-recovery)]">
          QR generation failure
        </p>
        <p className="mt-3 text-sm text-ink-100">
          Use the install link instead. The QR graphic could not be generated
          on this page.
        </p>
        <a
          href={installUrl}
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[var(--eos-voltline)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--eos-voltline)]"
        >
          {installUrl}
        </a>
      </div>
    );
  }

  return (
    <figure id="ios-qr" className="m-0">
      <div className="mx-auto w-full max-w-[280px] rounded-[1.35rem] bg-ink-50 p-4 shadow-[0_0_0_1px_color-mix(in_srgb,var(--eos-voltline)_35%,transparent)] sm:max-w-[320px]">
        <svg
          viewBox={`0 0 ${qr.dim} ${qr.dim}`}
          className="block h-auto w-full text-ink-950"
          role="img"
          aria-label="QR code to install FitConnect on iPhone"
        >
          <title>QR code to install FitConnect on iPhone</title>
          <rect width={qr.dim} height={qr.dim} fill="var(--ink-50)" />
          <path d={qr.path} fill="var(--ink-950)" />
        </svg>
      </div>
      <figcaption className="mt-4 text-center text-sm text-ink-300">
        Scan with your iPhone camera. High-contrast code, quiet zone included.
      </figcaption>
    </figure>
  );
}
