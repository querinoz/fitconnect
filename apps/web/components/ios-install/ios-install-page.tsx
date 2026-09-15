"use client";

import { useEffect, useState } from "react";
import { QrCodeCard } from "./qr-code-card";
import { InstallButton } from "./install-button";
import { BuildStatus } from "./build-status";
import { SetupChecklist } from "./setup-checklist";
import { CapabilityNotes, DeviceCompatibility, InstallationHelp } from "./installation-help";
import { trackIosInstallEvent } from "@/lib/ios-install/track";
import type { IosInstallPublicConfig, IosQrPath } from "@/lib/ios-install/types";

type Props = {
  config: IosInstallPublicConfig;
  qr: IosQrPath | null;
  qrFailed: boolean;
};

export function IosInstallPage({ config, qr, qrFailed }: Props) {
  const [isAppleMobile, setIsAppleMobile] = useState(false);

  useEffect(() => {
    setIsAppleMobile(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    trackIosInstallEvent("ios_page_view", { configured: config.configured });
  }, [config.configured]);

  return (
    <main
      id="main"
      className="relative mx-auto w-full max-w-5xl overflow-x-clip px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,calc(env(safe-area-inset-top)+5.5rem))] sm:px-6"
    >
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--eos-voltline)]">
          FitConnect™
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--eos-telemetry)]">
          iOS · BUILD • TEST • TRAIN
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[0.95] text-ink-50 sm:text-6xl">
          Install FitConnect on iPhone
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">
          {config.configured
            ? "Scan the QR code with your iPhone camera, or tap install."
            : "This is the official FitConnect iOS installation hub. TestFlight is not configured yet."}
        </p>
        {config.betaStatus ? (
          <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--eos-iris)]">
            {config.betaStatus}
          </p>
        ) : (
          <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
            iPhone 14 Pro
          </p>
        )}
      </header>

      <section
        aria-labelledby="ios-install-card-heading"
        className="mt-10 grid items-start gap-8 overflow-x-clip rounded-[calc(var(--eos-radius-modal)+0.35rem)] border border-white/10 bg-[color:color-mix(in_srgb,var(--eos-floor)_55%,var(--eos-elevated))] p-5 sm:p-8 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]"
      >
        <div className="order-2 min-w-0 lg:order-1">
          <QrCodeCard
            qr={qr}
            qrFailed={qrFailed}
            configured={config.configured}
            installUrl={config.installAbsoluteUrl}
          />
          <div className="mt-4">
            <DeviceCompatibility isAppleMobile={isAppleMobile} />
          </div>
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <h2 id="ios-install-card-heading" className="font-display text-2xl text-ink-50">
            Scan or tap to install
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            {isAppleMobile
              ? "Open the installation link on this device."
              : "Scan the QR code with your iPhone."}
          </p>
          <div className="mt-6">
            <InstallButton config={config} isAppleMobile={isAppleMobile} />
          </div>
          <div className="mt-8">
            <InstallationHelp />
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-6">
        <BuildStatus
          version={config.version}
          build={config.build}
          betaStatus={config.betaStatus}
        />
        <SetupChecklist />
        <CapabilityNotes />
      </div>
    </main>
  );
}
