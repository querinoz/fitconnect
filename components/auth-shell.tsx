"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { ArrowRight, Dumbbell, Mail, Sparkles } from "lucide-react";
import { useLanguage, useT } from "@/lib/i18n-provider";
import { Button } from "./ui/button";
import { OAuthRow } from "./oauth-row";
import { LangPicker } from "./lang-picker";

interface AuthShellProps {
  mode: "signin" | "signup";
  heading: string;
  subtitle: string;
  submitLabel: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
}

export function AuthShell({
  mode,
  heading,
  subtitle,
  submitLabel,
  switchPrompt,
  switchLabel,
  switchHref
}: AuthShellProps) {
  const t = useT();
  const { lang } = useLanguage();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2200);
  }

  return (
    <main
      id="main"
      className="relative min-h-screen overflow-hidden gradient-bg flex items-center"
    >
      <div className="absolute -top-32 -right-24 -z-10 h-[420px] w-[420px] rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-accent-500/15 blur-3xl" />

      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-xl"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950 shadow-glow">
              <Dumbbell className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              Fit<span className="text-brand-400">Connect</span>
            </span>
          </Link>
          <LangPicker compact />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-24 pb-16 lg:grid-cols-2">
        {/* Marketing rail */}
        <motion.aside
          initial={{ opacity: 0, x: reduce ? 0 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200 ring-1 ring-brand-500/30">
            <Sparkles className="h-3 w-3" />
            {mode === "signin" ? t("nav", "signIn") : t("auth", "submitSignUp")}
          </span>
          <h1 className="mt-5 font-display text-4xl xl:text-5xl font-bold tracking-tight text-balance leading-[1.05]">
            {heading.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="gradient-text">
              {heading.split(" ").slice(-2).join(" ")}
            </span>
          </h1>
          <p className="mt-4 text-ink-300 text-lg max-w-md text-balance">
            {subtitle}
          </p>

          <ul className="mt-8 space-y-3">
            {[
              {
                k: "verified",
                en: "12,418 verified specialists across 10 sports",
                pt: "12 418 especialistas verificados em 10 desportos"
              },
              {
                k: "intro",
                en: "Free 15-min intro with every coach",
                pt: "Intro grátis de 15 min com cada coach"
              },
              {
                k: "ready",
                en: "HRV + sleep readiness signals from day one",
                pt: "Sinais de prontidão (HRV + sono) desde o primeiro dia"
              }
            ].map((row, i) => (
              <motion.li
                key={row.k}
                initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.4,
                  delay: 0.1 + i * 0.06
                }}
                className="flex items-start gap-3 text-sm text-ink-200"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-400 ring-1 ring-accent-500/30">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span>{lang === "pt" ? row.pt : row.en}</span>
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        {/* Form card */}
        <motion.section
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-ink-800 bg-ink-950/80 backdrop-blur-xl p-7 md:p-9 shadow-elevated card-glow"
        >
          <div className="lg:hidden mb-5">
            <h1 className="font-display text-2xl font-bold leading-tight">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
          </div>

          <h2 className="hidden lg:block font-display text-xl font-bold mb-4">
            {mode === "signin"
              ? t("auth", "submitSignIn")
              : t("auth", "submitSignUp")}
          </h2>

          <OAuthRow />

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-widest text-ink-500"
              >
                {t("auth", "emailLabel")}
              </label>
              <div className="relative mt-1.5">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth", "emailPlaceholder")}
                  className="w-full rounded-xl border border-ink-800 bg-ink-900/60 pl-10 pr-3 h-11 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-500/40"
                />
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="password"
                  className="text-xs uppercase tracking-widest text-ink-500"
                >
                  {t("auth", "passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth", "passwordPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-ink-800 bg-ink-900/60 px-3 h-11 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-500/40"
                />
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitted}
            >
              {submitted ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
                  {submitLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {submitLabel}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-[11px] text-ink-500 leading-relaxed">
            {t("auth", "legalNote")}
          </p>

          <div className="mt-5 pt-5 border-t border-ink-800 text-sm text-ink-400 text-center">
            {switchPrompt}{" "}
            <Link
              href={switchHref}
              className="font-semibold text-brand-300 hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-md"
            >
              {switchLabel}
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

