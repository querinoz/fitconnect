"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Smartphone, UserRound, UsersRound, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FitConnectLogo } from "@/components/brand/fitconnect-logo";
import { validateCredentials } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";

const DEMOS = [
  {
    role: "athlete",
    title: "Athlete — Social Feed",
    subtitle: "HOME feed, discover, squads and profile with Elite OS shell.",
    icon: UserRound,
    username: "Athlete",
    password: "Athlete",
    href: "/feed"
  },
  {
    role: "coach",
    title: "Coach dashboard",
    subtitle: "Roster readiness, AI alerts and athlete follow-up flow.",
    icon: UsersRound,
    username: "Coach",
    password: "Coach",
    href: "/coach/dashboard"
  }
] as const;

export function MobileAppLauncher() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  function openDemo(username: string, password: string, href: string) {
    const user = validateCredentials(username, password);
    if (!user) return;
    login(user);
    router.push(href);
  }

  return (
    <main className="min-h-dvh bg-ink-950 text-ink-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 py-5">
        <header className="flex items-center justify-between">
          <FitConnectLogo variant="full" href="/" />
          <Link
            href="/mobile/qr"
            aria-label="QR code para telemóvel"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-glass-border bg-glass-md text-volt-500 hover:bg-glass-hi transition-colors"
          >
            <QrCode className="h-5 w-5" aria-hidden />
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-volt-500/30 bg-glass-volt px-3 py-1 text-xs font-semibold text-volt-300">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            Mobile app demo
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-balance">
            Choose the app view to open.
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-300">
            Sign in with demo accounts and open the real mobile shell with dock
            navigation.
          </p>

          <Button asChild variant="outline" className="mt-6 w-full border-glass-border">
            <Link href="/mobile/qr">
              <QrCode className="h-4 w-4" aria-hidden />
              Abrir no telemóvel (QR code)
            </Link>
          </Button>

          <div className="mt-6 space-y-3">
            {DEMOS.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() =>
                    openDemo(demo.username, demo.password, demo.href)
                  }
                  className="group w-full rounded-glass border border-glass-border bg-glass-md p-4 text-left transition hover:border-volt-500/40 hover:bg-glass-hi focus-visible:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-grad-pulse text-ink-950">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-50">
                        {demo.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-ink-400">
                        {demo.subtitle}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="safe-area-pb">
          <Button
            type="button"
            variant="outline"
            className="w-full border-glass-border"
            onClick={() => router.push("/signin")}
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            Use another account
          </Button>
        </footer>
      </div>
    </main>
  );
}
