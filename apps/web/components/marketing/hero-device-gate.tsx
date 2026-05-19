"use client";

import dynamic from "next/dynamic";

const DeviceShowcase = dynamic(
  () => import("./device-showcase").then((m) => m.DeviceShowcase),
  {
    ssr: false,
    loading: () => <HeroDevicePlaceholder />
  }
);

function HeroDevicePlaceholder() {
  return (
    <div
      className="mx-auto flex min-h-[min(360px,52dvh)] w-full max-w-[min(100%,340px)] items-center justify-center rounded-[2rem] bg-ink-900/40 ring-1 ring-ink-800 sm:min-h-[400px] lg:min-h-[520px]"
      aria-hidden
    >
      <div className="h-12 w-12 animate-pulse rounded-full bg-brand-500/20" />
    </div>
  );
}

/** Loads device showcase immediately — mobile UX must not wait for idle callbacks. */
export function HeroDeviceGate({ className }: { className?: string }) {
  return <DeviceShowcase className={className} />;
}
