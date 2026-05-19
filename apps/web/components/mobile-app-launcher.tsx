"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Smartphone,
  UserRound,
  UsersRound
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";
import { RoleDashboardPreview } from "@/components/dashboard/role-dashboard-preview";
import { validateCredentials } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useEntrance } from "@/lib/use-entrance-motion";

const DEMOS = [
  {
    role: "athlete",
    title: "Athlete dashboard",
    subtitle: "Readiness, today plan, live session and coach updates.",
    icon: UserRound,
    username: "Athlete",
    password: "Athlete",
    href: "/dashboard?demo=1"
  },
  {
    role: "coach",
    title: "Coach dashboard",
    subtitle: "Roster readiness, AI alerts and athlete follow-up flow.",
    icon: UsersRound,
    username: "Coach",
    password: "Coach",
    href: "/coach/dashboard?demo=1"
  }
] as const;

export function MobileAppLauncher() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const entrance = useEntrance(20);

  function openDemo(username: string, password: string, href: string) {
    const user = validateCredentials(username, password);
    if (!user) return;
    login(user);
    router.push(href);
  }

  return (
    <main className="min-h-dvh w-full max-w-full overflow-x-clip bg-ink-950 text-ink-100 premium-grid">
      {/* Desktop / tablet — iPhone showcase */}
      <div className="hidden md:flex min-h-dvh flex-col items-center justify-center px-6 py-12">
          <div className="mb-8 flex flex-col items-center">
            <Link
              href="/"
              className="rounded-xl focus-visible:outline-none"
              aria-label="Back to FitConnect landing page"
            >
              <MobileAppHeader />
            </Link>
          </div>
          <motion.div {...entrance} className="max-w-xl text-center">
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            Mobile app demo
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance">
            Preview the app before you sign in.
          </h1>
          <p className="mt-3 text-sm text-ink-400">
            Swipe between athlete and coach views, then launch the live demo
            with one tap.
          </p>
          </motion.div>

        <RoleDashboardPreview variant="phone" />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {DEMOS.map((demo) => (
            <Button
              key={demo.role}
              type="button"
              onClick={() =>
                openDemo(demo.username, demo.password, demo.href)
              }
            >
              Open {demo.role} app
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-ink-800"
            onClick={() => router.push("/signin")}
          >
            <Dumbbell className="h-4 w-4" aria-hidden />
            Use another account
          </Button>
        </div>
      </div>

      {/* Phone — full-width launcher (real device UX) */}
      <div className="md:hidden">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-5 sm:px-5">
          <Link
            href="/"
            className="rounded-xl focus-visible:outline-none"
            aria-label="Back to FitConnect landing page"
          >
            <MobileAppHeader
              trailing={
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-brand-300">
                  <Smartphone className="h-5 w-5" aria-hidden />
                </span>
              }
            />
          </Link>

          <section className="flex flex-1 flex-col justify-center py-8">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
              <Activity className="h-3.5 w-3.5" aria-hidden />
              Mobile app demo
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-balance">
              Choose the app view to open.
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-300">
              These buttons sign into the demo accounts and open the real
              mobile dashboard routes with the bottom dock layout.
            </p>

            <div className="mt-8 space-y-3">
              {DEMOS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() =>
                      openDemo(demo.username, demo.password, demo.href)
                    }
                    className="group w-full rounded-2xl border border-ink-800 bg-ink-900/80 p-4 text-left shadow-lg shadow-black/20 transition hover:border-brand-500/40 hover:bg-ink-900 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-volt-500 to-volt-400 text-ink-950">
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
              className="w-full border-ink-800"
              onClick={() => router.push("/signin")}
            >
              <Dumbbell className="h-4 w-4" aria-hidden />
              Use another account
            </Button>
          </footer>
        </div>
      </div>
    </main>
  );
}
