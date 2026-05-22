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
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { RoleDashboardPreview } from "@/components/dashboard/role-dashboard-preview";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { Headline, BodyText } from "@/components/elite-os/typography";
import { validateCredentials } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { useEntrance } from "@/lib/use-entrance-motion";
import { useLocale } from "@/lib/i18n-provider";

type DemoCard = {
  role: "athlete" | "coach";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  username: string;
  password: string;
  href: string;
  cta: string;
};

export function MobileAppLauncher() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const entrance = useEntrance(20);
  const l = useLocale().mobileApp.launcher;

  const demos: DemoCard[] = [
    {
      role: "athlete",
      title: l.athleteTitle,
      subtitle: l.athleteSubtitle,
      icon: UserRound,
      username: "Athlete",
      password: "Athlete",
      href: "/dashboard?demo=1",
      cta: l.openAthlete
    },
    {
      role: "coach",
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
    <main id="main" className="fc-marketing-hero fc-marketing-container pb-16">
      <div className="hidden md:flex flex-col items-center px-2 py-6">
        <motion.div {...entrance} className="max-w-xl text-center">
          <EliteChip tone="iris" as="span" className="text-[10px]">
            <Smartphone className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            {l.badge}
          </EliteChip>
          <Headline className="mt-4 text-4xl text-balance">{l.titleDesktop}</Headline>
          <BodyText className="mt-3 text-sm">{l.subtitleDesktop}</BodyText>
        </motion.div>

        <div className="mt-8 w-full max-w-md">
          <RoleDashboardPreview variant="phone" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {demos.map((demo) => (
            <EliteButton
              key={demo.role}
              type="button"
              variant="primary"
              onClick={() => openDemo(demo.username, demo.password, demo.href)}
            >
              {demo.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </EliteButton>
          ))}
          <EliteButton type="button" variant="ghost" onClick={() => router.push("/signin")}>
            <Dumbbell className="h-4 w-4" aria-hidden />
            {l.useAnotherAccount}
          </EliteButton>
        </div>
      </div>

      <div className="md:hidden mx-auto flex w-full max-w-[430px] flex-col px-1">
        <section className="flex flex-1 flex-col justify-center py-8">
          <EliteChip tone="iris" as="span" className="text-[10px]">
            <Activity className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            {l.badge}
          </EliteChip>
          <Headline className="mt-5 text-4xl text-balance">{l.titleMobile}</Headline>
          <BodyText className="mt-3 text-sm leading-6">{l.subtitleMobile}</BodyText>

          <div className="mt-8 space-y-3">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <BentoCard
                  key={demo.role}
                  interactive
                  elevation="2"
                  padding="md"
                  className="w-full cursor-pointer text-left"
                  onClick={() => openDemo(demo.username, demo.password, demo.href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDemo(demo.username, demo.password, demo.href);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--eos-radius-nested)] bg-eos-voltline text-eos-floor">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-50">{demo.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-ink-400">
                        {demo.subtitle}
                      </span>
                    </span>
                  </span>
                </BentoCard>
              );
            })}
          </div>
        </section>

        <footer className="safe-area-pb pt-4">
          <EliteButton
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/signin")}
          >
            <Dumbbell className="h-4 w-4" aria-hidden />
            {l.useAnotherAccount}
          </EliteButton>
          <p className="mt-4 text-center text-xs text-ink-500">
            <Link href="/" className="hover:text-ink-300">
              {l.backHomeAria}
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
