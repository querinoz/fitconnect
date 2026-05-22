"use client";

import Image from "next/image";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { EliteChip, EliteGlass } from "@/components/elite-os";
import type { UserRole } from "@/lib/auth";
import { useShellStore } from "@/lib/shell/shell-store";
import { cn } from "@/lib/utils";

export function EliteFloatingNav({
  greeting,
  name,
  avatarUrl,
  tabLabel,
  roleLabel,
  role
}: {
  greeting: string;
  name: string;
  avatarUrl: string;
  tabLabel?: string;
  roleLabel?: string;
  role: UserRole;
}) {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } =
    useShellStore();

  return (
    <header className="eos-floating-nav sticky top-0 z-30 shrink-0">
      <div className="px-3 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 sm:px-4 lg:px-eos-gutter">
        <EliteGlass
          padding="none"
          radius="control"
          className="rounded-[var(--eos-radius-modal)] px-3 py-2.5 sm:px-4"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden h-9 w-9 place-items-center rounded-[var(--eos-radius-nested)] text-eos-on-surface-muted transition hover:bg-white/8 hover:text-eos-on-surface lg:grid"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-[18px] w-[18px]" />
              ) : (
                <PanelLeftClose className="h-[18px] w-[18px]" />
              )}
            </button>

            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-[var(--eos-radius-nested)] text-eos-on-surface-muted transition hover:bg-white/8 hover:text-eos-on-surface lg:hidden"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>

            <BrandLockup
              href={role === "coach" ? "/coach/dashboard" : "/dashboard"}
              layout="inline"
              logoSize={24}
              textSize={12}
              className="hidden shrink-0 sm:flex lg:hidden"
            />

            <div className="min-w-0 flex-1">
              {roleLabel ? (
                <EliteChip
                  tone={role === "coach" ? "performance" : "telemetry"}
                  className="mb-1 px-2 py-0 text-[9px]"
                  as="span"
                >
                  {roleLabel}
                </EliteChip>
              ) : null}
              {tabLabel ? (
                <>
                  <p className="eos-label-caps text-eos-voltline">{tabLabel}</p>
                  <p className="truncate text-sm font-semibold text-eos-on-surface">
                    {name}
                  </p>
                </>
              ) : (
                <>
                  <p className="eos-label-caps">{greeting}</p>
                  <p className="truncate text-sm font-semibold text-eos-on-surface">
                    {name}
                  </p>
                </>
              )}
            </div>

            <Image
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className={cn(
                "h-9 w-9 shrink-0 rounded-full border border-eos-outline object-cover",
                role === "coach" ? "ring-1 ring-eos-performance/30" : "ring-1 ring-eos-telemetry/30"
              )}
            />
          </div>
        </EliteGlass>
      </div>
    </header>
  );
}
