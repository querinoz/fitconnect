"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
      className="mx-auto flex min-h-[280px] max-w-[420px] items-center justify-center rounded-[3rem] bg-ink-900/40 ring-1 ring-ink-800 sm:min-h-[360px] lg:min-h-[560px]"
      aria-hidden
    >
      <div className="h-12 w-12 animate-pulse rounded-full bg-brand-500/20" />
    </div>
  );
}

/**
 * On mobile, defer the heavy DeviceShowcase (MobileAppPreview) until idle or
 * deep scroll so Lighthouse initial load stays lean. Desktop loads immediately.
 */
export function HeroDeviceGate({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (desktop) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const onIdle = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(onIdle, { timeout: 8000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = setTimeout(onIdle, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!ready) return <HeroDevicePlaceholder />;
  return <DeviceShowcase className={className} />;
}
