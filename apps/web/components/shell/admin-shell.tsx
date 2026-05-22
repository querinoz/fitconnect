"use client";

import type { ReactNode } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { MarketingNav } from "@/components/nav/marketing-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

/** Elite OS admin surface — marketing nav, floor canvas, tab rail. */
export function AdminShell({ children, className }: AdminShellProps) {
  return (
    <>
      <DemoBanner />
      <MarketingNav minimal />
      <div className={cn("eos-floor relative min-h-dvh text-ink-100", className)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-eos-iris/10 via-eos-voltline/5 to-transparent"
        />
        <main id="main" className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <AdminNav />
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </>
  );
}
