"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Compass,
  LayoutDashboard,
  PlayCircle,
  Search,
  Settings,
  UsersRound,
  X
} from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  section: "navigation" | "actions";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  keywords?: string[];
};

type CommandPaletteProps = {
  role: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function fuzzyMatch(query: string, item: CommandItem): boolean {
  if (!query.trim()) return true;
  const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => hay.includes(term));
}

export function CommandPalette({ role, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const cp = useLocale().commandPalette;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const dashboardHref = role === "coach" ? "/coach/dashboard" : "/dashboard";
  const demoHref =
    role === "coach" ? "/coach/dashboard?demo=1" : "/dashboard?demo=1";

  const items = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = [
      {
        id: "dashboard",
        label: cp.goDashboard,
        section: "navigation",
        icon: LayoutDashboard,
        href: dashboardHref,
        keywords: ["home", "today", "g d"]
      },
      {
        id: "sessions",
        label: cp.goSessions,
        section: "navigation",
        icon: Calendar,
        href: role === "coach" ? "/coach/sessions" : "/sessions",
        keywords: ["calendar", "g s"]
      },
      {
        id: "discover",
        label: cp.goDiscover,
        section: "navigation",
        icon: Compass,
        href: "/discover",
        keywords: ["coaches", "find"]
      },
      {
        id: "settings",
        label: cp.goSettings,
        section: "navigation",
        icon: Settings,
        href: "/settings/appearance",
        keywords: ["theme", "motion", "appearance"]
      }
    ];

    if (role === "coach") {
      nav.splice(2, 0, {
        id: "roster",
        label: cp.goRoster,
        section: "navigation",
        icon: UsersRound,
        href: "/coach/roster",
        keywords: ["athletes", "team"]
      });
    }

    const actions: CommandItem[] = [
      {
        id: "demo",
        label: cp.openDemo,
        section: "actions",
        icon: PlayCircle,
        href: demoHref,
        keywords: ["demo", "panel", "widgets"]
      }
    ];

    return [...nav, ...actions];
  }, [cp, dashboardHref, demoHref, role]);

  const filtered = useMemo(
    () => items.filter((item) => fuzzyMatch(query, item)),
    [items, query]
  );

  const runItem = useCallback(
    (item: CommandItem) => {
      onOpenChange(false);
      setQuery("");
      if (item.href) router.push(item.href);
      else item.action?.();
    },
    [onOpenChange, router]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      runItem(filtered[active]!);
    }
  };

  const sections = [
    { key: "navigation" as const, label: cp.navigation },
    { key: "actions" as const, label: cp.actions }
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[200] bg-eos-floor/75 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-[14vh] z-[201] w-[min(calc(100%-2rem),32rem)] -translate-x-1/2 overflow-hidden rounded-[var(--eos-radius-modal)] border border-eos-outline bg-eos-elevated shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] focus:outline-none"
          onKeyDown={onKeyDown}
        >
          <Dialog.Title className="sr-only">{cp.placeholder}</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-eos-outline px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-eos-on-surface-muted" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={cp.placeholder}
              className="min-w-0 flex-1 bg-transparent text-sm text-eos-on-surface outline-none placeholder:text-eos-on-surface-subtle"
              aria-label={cp.placeholder}
            />
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-[var(--eos-radius-control)] text-eos-on-surface-muted transition hover:bg-white/5 hover:text-eos-on-surface"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[min(50vh,360px)] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-eos-on-surface-muted">
                {cp.noResults}
              </p>
            ) : (
              sections.map(({ key, label }) => {
                const group = filtered.filter((i) => i.section === key);
                if (!group.length) return null;
                return (
                  <div key={key} className="mb-2">
                    <p className="px-3 py-1.5 eos-label-caps text-eos-on-surface-subtle">
                      {label}
                    </p>
                    <ul role="listbox">
                      {group.map((item) => {
                        const idx = filtered.indexOf(item);
                        const Icon = item.icon;
                        return (
                          <li key={item.id} role="option" aria-selected={idx === active}>
                            <button
                              type="button"
                              onClick={() => runItem(item)}
                              onMouseEnter={() => setActive(idx)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-[var(--eos-radius-control)] px-3 py-2.5 text-left text-sm transition",
                                idx === active
                                  ? "bg-eos-voltline/12 text-eos-on-surface"
                                  : "text-eos-on-surface-muted hover:bg-white/5 hover:text-eos-on-surface"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0 text-eos-voltline" aria-hidden />
                              <span>{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-eos-outline px-4 py-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-eos-on-surface-subtle">
              {cp.hint} · g d · g s
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Global ⌘K / Ctrl+K + vim-style g→d / g→s shortcuts. */
export function useCommandPaletteShortcut(onOpen: () => void) {
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPending = () => {
      pendingRef.current = null;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
        clearPending();
        return;
      }

      if (typing) return;

      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingRef.current = "g";
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(clearPending, 800);
        return;
      }

      if (pendingRef.current === "g") {
        clearPending();
        if (e.key === "d") {
          e.preventDefault();
          window.location.href =
            window.location.pathname.startsWith("/coach")
              ? "/coach/dashboard"
              : "/dashboard";
        } else if (e.key === "s") {
          e.preventDefault();
          window.location.href = window.location.pathname.startsWith("/coach")
            ? "/coach/sessions"
            : "/sessions";
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearPending();
    };
  }, [onOpen]);
}

export function CommandPaletteHost({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  useCommandPaletteShortcut(openPalette);

  return <CommandPalette role={role} open={open} onOpenChange={setOpen} />;
}
