"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { BrandLockup } from "@/components/brand/brand-lockup";
import { RoleDashboardPreview } from "@/components/dashboard/role-dashboard-preview";
import { validateCredentials } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useEntrance } from "@/lib/use-entrance-motion";
import { useLocale } from "@/lib/i18n-provider";

export function MobileAppLauncher() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const entrance = useEntrance(20);
  const l = useLocale().mobileApp.launcher;

  useEffect(() => {
    document.title = l.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", l.metaDescription);
  }, [l.metaTitle, l.metaDescription]);

  const demos = [
    {
      role: "athlete" as const,
      title: l.athleteTitle,
      subtitle: l.athleteSubtitle,
      icon: UserRound,
      username: "Athlete",
      password: "Athlete",
      href: "/dashboard?demo=1",
      cta: l.openAthlete
    },
    {
      role: "coach" as const,
      title: l.coachTitle,
      subtitle: l.coachSubtitle,
      icon: UsersRound,
      username: "Coach",
      password: "Coach",
      href: "/coach/dashboard?demo=1",
      cta: l.openCoach
    }
  ];

  function openDemo(username: string, password: string, href: string) {
    const user = validateCredentials(username, password);
    if (!user) return;
    login(user);
    router.push(href);
  }

  return (
    <main className="min-h-dvh w-full max-w-full overflow-x-clip bg-ink-950 text-ink-100 premium-grid">
      <div className="hidden md:flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="rounded-xl focus-visible:outline-none" aria-label={l.backHomeAria}>
            <BrandLockup logoSize={38} textSize={17} tagline layout="stack" />
          </Link>
        </div>
        <motion.div {...entrance} className="max-w-xl text-center">
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            {l.badge}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance">
            {l.titleDesktop}
          </h1>
          <p className="mt-3 text-sm text-ink-400">{l.subtitleDesktop}</p>
        </motion.div>

        <RoleDashboardPreview variant="phone" />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {demos.map((demo) => (
            <Button
              key={demo.role}
              type="button"
              onClick={() => openDemo(demo.username, demo.password, demo.href)}
            >
              {demo.cta}
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
            {l.useAnotherAccount}
          </Button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-5 sm:px-5">
          <Link
            href="/"
            className="rounded-xl focus-visible:outline-none"
            aria-label={l.backHomeAria}
          >
            <BrandLockup logoSize={38} textSize={17} tagline layout="stack" />
          </Link>

          <section className="flex flex-1 flex-col justify-center py-8">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
              <Activity className="h-3.5 w-3.5" aria-hidden />
              {l.badge}
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-balance">
              {l.titleMobile}
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-300">{l.subtitleMobile}</p>

            <div className="mt-8 space-y-3">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => openDemo(demo.username, demo.password, demo.href)}
                    className="group w-full rounded-2xl border border-ink-800 bg-ink-900/80 p-4 text-left shadow-lg shadow-black/20 transition hover:border-brand-500/40 hover:bg-ink-900 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-volt-500 to-volt-400 text-ink-950">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink-50">{demo.title}</span>
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
              {l.useAnotherAccount}
            </Button>
          </footer>
        </div>
      </div>
    </main>
  );
}
