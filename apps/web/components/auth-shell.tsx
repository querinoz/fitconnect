"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Dumbbell,
  Lock,
  LogOut,
  Mail,
  Sparkles,
  User
} from "lucide-react";
import {
  createDemoUserFromSignup,
  dashboardPathForRole,
  onboardingPathForRole,
  validateCredentials
} from "@/lib/auth";
import {
  authBackend,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword
} from "@/lib/auth/supabase-browser-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import { useOnboardingStore } from "@/lib/onboarding/store";
import { formatMsg, useLocale, useT } from "@/lib/i18n-provider";
import { OAuthRow } from "./oauth-row";
import { LangPicker } from "./lang-picker";
import { GlassCard } from "./ui-glass/glass-card";
import { VoltButton } from "./ui-glass/volt-button";
import { RealtimeBadge } from "./ui-glass/premium-system";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  mode: "signin" | "signup";
  heading: string;
  subtitle: string;
  submitLabel: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  redirectOverride?: string;
  coachDemoShortcut?: boolean;
}

const inputClass =
  "w-full rounded-xl border border-glass-border bg-glass-md pl-10 pr-3 h-11 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-volt-500/50 focus:border-volt-500/40";

export function AuthShell({
  mode,
  heading,
  subtitle,
  submitLabel,
  switchPrompt,
  switchLabel,
  switchHref,
  redirectOverride,
  coachDemoShortcut = false
}: AuthShellProps) {
  const t = useT();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const registered = useAuthStore((s) => s.registered);
  const registerDemo = useAuthStore((s) => s.registerDemo);
  const user = useAuthStore((s) => s.user);
  const setOnboardingRole = useOnboardingStore((s) => s.setRole);
  const hydrated = useAuthHydrated();
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"athlete" | "coach">("athlete");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [magicLink, setMagicLink] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    if (mode !== "signin" || !coachDemoShortcut) return;
    setIdentifier("tomas@fitconnect.local");
    setPassword("Coach");
  }, [coachDemoShortcut, mode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(true);
    setMagicSent(false);

    if (mode === "signin") {
      if (magicLink) {
        const result = await signInWithMagicLink(identifier.includes("@") ? identifier : email);
        setSubmitted(false);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setMagicSent(true);
        return;
      }

      if (authBackend() === "supabase" && identifier.includes("@")) {
        const result = await signInWithPassword(identifier, password);
        if (!result.ok) {
          setError(result.message);
          setSubmitted(false);
          return;
        }
        setSubmitted(false);
        router.replace(redirectOverride ?? "/dashboard");
        return;
      }

      const authUser = validateCredentials(identifier, password, registered);
      if (!authUser) {
        setError(t("auth", "invalidCredentials"));
        setSubmitted(false);
        return;
      }
      login(authUser);
      setSubmitted(false);
      router.replace(redirectOverride ?? dashboardPathForRole(authUser.role));
      return;
    }

    if (!termsAccepted) {
      setError("Accept the terms to create an account.");
      setSubmitted(false);
      return;
    }

    if (authBackend() === "supabase") {
      const result = await signUpWithPassword({
        email,
        password,
        name,
        role: signupRole
      });
      setSubmitted(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOnboardingRole(signupRole);
      router.push(onboardingPathForRole(signupRole));
      return;
    }

    const cred = createDemoUserFromSignup({
      name,
      email,
      password,
      role: signupRole
    });
    registerDemo(cred);
    sessionStorage.setItem(
      "fitconnect-pending-signup",
      JSON.stringify({ name, email, password })
    );
    setOnboardingRole(signupRole);
    setSubmitted(false);
    router.push(onboardingPathForRole(signupRole));
  }

  function handleDemoOAuth(role: "athlete" | "coach") {
    if (mode === "signup") {
      setOnboardingRole(role);
      sessionStorage.setItem(
        "fitconnect-pending-signup",
        JSON.stringify({
          name: role === "coach" ? "OAuth Coach" : "OAuth Athlete",
          email: `oauth-${role}@fitconnect.local`,
          password: "oauth-demo"
        })
      );
      router.push(onboardingPathForRole(role));
      return;
    }
    const demoUser = validateCredentials(role === "coach" ? "Coach" : "Athlete", role === "coach" ? "Coach" : "Athlete");
    if (demoUser) {
      login(demoUser);
      router.replace(redirectOverride ?? dashboardPathForRole(demoUser.role));
    }
  }

  return (
    <main
      id="main"
      className="relative min-h-dvh overflow-hidden bg-ink-950 text-ink-100 flex items-center"
    >
      <motion.div
        aria-hidden="true"
        className="absolute -top-32 -right-24 -z-10 h-[420px] w-[420px] rounded-full bg-brand-500/15 blur-3xl"
      />
      <div className="absolute -bottom-32 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-accent-500/15 blur-3xl" />

      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-xl"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-volt-500 to-volt-400 text-ink-950 shadow-glow">
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
          <p className="mt-4 text-ink-300 text-lg max-w-md text-balance">{subtitle}</p>

          <ul className="mt-8 space-y-3">
            {locale.auth.bullets.map((line, i) => (
              <motion.li
                key={i}
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
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard tone="active" className="relative rounded-3xl shadow-elevated p-7 md:p-9">
            <div className="mb-5 flex items-center justify-between gap-3">
              <RealtimeBadge>Secure auth</RealtimeBadge>
            </div>
            <div className="lg:hidden mb-5">
              <h1 className="font-display text-2xl font-bold leading-tight">{heading}</h1>
              <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
            </div>

            <h2 className="hidden lg:block font-display text-xl font-bold mb-4">
              {mode === "signin" ? t("auth", "submitSignIn") : t("auth", "submitSignUp")}
            </h2>

            <OAuthRow
              mode={mode}
              signupRole={signupRole}
              onDemoComplete={handleDemoOAuth}
            />

            {mode === "signin" && hydrated && user && (
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3"
              >
                <p className="text-sm text-brand-100">{t("auth", "alreadySignedIn")}</p>
                <p className="mt-1 text-xs text-ink-300">
                  {formatMsg(t("auth", "signedInAs"), { name: user.name })}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <VoltButton
                    type="button"
                    className="h-9 px-4 text-sm"
                    onClick={() =>
                      router.push(
                        redirectOverride ?? dashboardPathForRole(user.role)
                      )
                    }
                  >
                    {t("auth", "continueToDashboard")}
                  </VoltButton>
                  <VoltButton
                    type="button"
                    variant="ghost"
                    className="h-9 px-4 text-sm"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    {t("auth", "signOut")}
                  </VoltButton>
                </div>
              </motion.div>
            )}

            {magicSent && (
              <p className="mt-4 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3 py-2 text-sm text-accent-200">
                Magic link sent — check your inbox.
              </p>
            )}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-3 py-2 text-sm text-signal-300"
                >
                  {error}
                </p>
              )}

              {mode === "signup" && (
                <>
                  <div>
                    <label htmlFor="name" className="text-xs uppercase tracking-widest text-ink-500">
                      Full name
                    </label>
                    <div className="relative mt-1.5">
                      <User
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                      />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Inês M."
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <fieldset>
                    <legend className="text-xs uppercase tracking-widest text-ink-500">
                      I am a
                    </legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(["athlete", "coach"] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSignupRole(role)}
                          className={cn(
                            "rounded-xl py-2.5 text-sm font-semibold capitalize ring-1 transition",
                            signupRole === role
                              ? "bg-brand-500/15 text-brand-200 ring-brand-500/40"
                              : "text-ink-400 ring-ink-800 hover:ring-ink-600"
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {mode === "signin" ? (
                <div>
                  <label
                    htmlFor="identifier"
                    className="text-xs uppercase tracking-widest text-ink-500"
                  >
                    {magicLink ? "Email" : t("auth", "usernameLabel")}
                  </label>
                  <div className="relative mt-1.5">
                    {magicLink ? (
                      <Mail
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                      />
                    ) : (
                      <User
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                      />
                    )}
                    <input
                      id="identifier"
                      type={magicLink ? "email" : "text"}
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        magicLink ? t("auth", "emailPlaceholder") : t("auth", "usernamePlaceholder")
                      }
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMagicLink((v) => !v)}
                    className="mt-2 text-xs text-brand-300 hover:text-brand-200"
                  >
                    {magicLink ? "Use password instead" : "Send magic link instead"}
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-ink-500">
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
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {!magicLink && (
                <div>
                  <label
                    htmlFor="password"
                    className="text-xs uppercase tracking-widest text-ink-500"
                  >
                    {t("auth", "passwordLabel")}
                  </label>
                  <div className="relative mt-1.5">
                    <Lock
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                    />
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      minLength={mode === "signup" ? 8 : undefined}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "signin"
                          ? t("auth", "signInPasswordPlaceholder")
                          : t("auth", "passwordPlaceholder")
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <label className="flex items-start gap-2 text-xs text-ink-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-ink-700"
                  />
                  <span>I agree to the Terms of Service and Privacy Policy.</span>
                </label>
              )}

              <VoltButton
                type="submit"
                className="w-full min-h-[48px]"
                disabled={submitted || !hydrated}
              >
                {submitted ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
                    {magicLink && mode === "signin" ? "Sending link…" : submitLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {magicLink && mode === "signin" ? "Send magic link" : submitLabel}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </VoltButton>
            </form>

            <p className="mt-5 text-[11px] text-ink-500 leading-relaxed">
              {t("auth", "legalNote")}
            </p>

            <div className="mt-5 pt-5 border-t border-glass-border text-sm text-ink-400 text-center">
              {switchPrompt}{" "}
              <Link
                href={switchHref}
                className="font-semibold text-brand-300 hover:text-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 rounded-md"
              >
                {switchLabel}
              </Link>
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </main>
  );
}
