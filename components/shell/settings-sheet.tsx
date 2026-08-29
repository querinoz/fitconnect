"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Bell,
  Heart,
  Lock,
  Palette,
  Settings,
  Smartphone,
  User,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemePicker } from "./theme-picker";

type SettingsSheetProps = {
  open: boolean;
  onClose: () => void;
};

const SECTIONS = [
  {
    title: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings/appearance", label: "Appearance", icon: Palette }
    ]
  },
  {
    title: "Preferences",
    items: [
      { href: "/settings/appearance", label: "Notifications", icon: Bell },
      { href: "#", label: "Privacy", icon: Lock },
      { href: "#", label: "Connected devices", icon: Smartphone }
    ]
  },
  {
    title: "Health",
    items: [{ href: "/dashboard", label: "Telemetry & readiness", icon: Heart }]
  }
] as const;

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={cn(
          "absolute right-0 top-0 bottom-0 w-full max-w-sm",
          "bg-ink-900/95 border-l border-glass-border backdrop-blur-glass-lg",
          "shadow-volt-glow flex flex-col",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-volt-500" aria-hidden />
            <h2 className="font-display text-lg font-bold">Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-glass-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-2">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-200 hover:bg-glass-md transition-colors"
                      >
                        <Icon className="h-4 w-4 text-ink-400" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <section>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500 mb-3">
              Accent color
            </p>
            <ThemePicker variant="settings" />
          </section>
        </div>
      </div>
    </div>
  );
}
