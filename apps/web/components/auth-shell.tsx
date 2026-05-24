"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight,
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
  safeInternalNextPath,
  validateCredentials
} from "@/lib/auth";
import { mapSupabaseUserToAuthUser } from "@/lib/auth/map-supabase-user";
import {
  setDemoSessionCookie
} from "@/lib/auth/demo-session";
import {
  navigateAfterLogin,
  persistClientAuthSession
} from "@/lib/auth/complete-login";
import {
  authBackend,
  fetchSupabaseAuthUser,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword
} from "@/lib/auth/supabase-browser-auth";
import { logoutAuthSession } from "@/lib/auth/use-supabase-auth-sync";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import { useOnboardingStore } from "@/lib/onboarding/store";
import { formatMsg, useLocale, useT } from "@/lib/i18n-provider";
import { OAuthRow } from "./oauth-row";
import {
  EliteAuthAlert,
  EliteAuthField,
  EliteAuthPanel,
  EliteAuthRoleToggle
} from "@/components/auth/elite";
import { EliteButton } from "@/components/elite-os/elite-button";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { BodyText, Headline, LabelCaps } from "@/components/elite-os/typography";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";
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
  /** Compact single-column layout for route modals */
  embedded?: boolean;
}

export function AuthShell({
  mode,
  heading,
  subtitle,
  submitLabel,
  switchPrompt,
  switchLabel,
  switchHref,
  redirectOverride,
  coachDemoShortcut = false,
  embedded = false
}: AuthShellProps) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = useAuthStore((s) => s.registered);
  const registerDemo = useAuthStore((s) => s.registerDemo);
  const user = useAuthStore((s) => s.user);
  const setOnboardingRole = useOnboardingStore((s) => s.setRole);
  const hydrated = useAuthHydrated();
  const locale = useLocale();
  const { fadeUp, fadeIn, reduced, uiTransition } = useEliteMotion();
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

  const nextFromQuery = useMemo(
    () => safeInternalNextPath(searchParams.get("next")),
    [searchParams]
  );

  const authErrorParam = searchParams.get("error");

  function resolveRedirect(role: import("@/lib/auth").UserRole) {
    return redirectOverride ?? nextFromQuery ?? dashboardPathForRole(role);
  }

  async function completeLogin(
    authUser: import("@/lib/auth").AuthUser,
    options?: { persistDemoCookie?: boolean }
  ) {
    persistClientAuthSession(authUser, options);
    setSubmitted(false);
    const target = resolveRedirect(authUser.role);
    navigateAfterLogin(target);
  }

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

      const demoUser = validateCredentials(identifier, password, registered);
      if (demoUser) {
        await completeLogin(demoUser);
        return;
      }

      if (authBackend() === "supabase" && identifier.includes("@")) {
        const result = await signInWithPassword(identifier, password);
        if (!result.ok) {
          setError(result.message);
          setSubmitted(false);
          return;
        }

        const supabaseUser = await fetchSupabaseAuthUser();
        if (!supabaseUser) {
          setError(t("auth", "invalidCredentials"));
          setSubmitted(false);
          return;
        }

        await completeLogin(mapSupabaseUserToAuthUser(supabaseUser), {
          persistDemoCookie: false
        });
        return;
      }

      setError(t("auth", "invalidCredentials"));
      setSubmitted(false);
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
      void completeLogin(demoUser);
    }
  }

  return (
    <div
      className={cn(
        embedded
          ? "relative w-full"
          : "relative flex min-h-[80dvh] flex-1 items-center overflow-hidden pb-16 eos-floor"
      )}
    >
      {!embedded ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-[10%] -top-[20%] h-[70vw] w-[70vw] rounded-full bg-eos-voltline/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[20%] top-[40%] h-[60vw] w-[60vw] rounded-full bg-eos-telemetry/30 blur-[120px]"
          />
        </>
      ) : null}
      <div
        className={cn(
          "relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4",
          embedded ? "max-w-lg" : "fc-marketing-container lg:grid-cols-2"
        )}
      >
        <motion.aside
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={uiTransition}
          className={cn(embedded && "hidden")}
        >
          <EliteChip tone="iris" as="span" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
            {mode === "signin" ? t("nav", "signIn") : t("auth", "submitSignUp")}
          </EliteChip>
          <Headline className="mt-5 text-4xl xl:text-5xl">
            {heading.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="bg-gradient-to-r from-eos-voltline to-eos-telemetry bg-clip-text text-transparent">
              {heading.split(" ").slice(-2).join(" ")}
            </span>
          </Headline>
          <BodyText className="mt-4 max-w-md text-lg">{subtitle}</BodyText>

          <ul className="mt-8 space-y-3">
            {locale.auth.bullets.map((line, i) => (
              <motion.li
                key={i}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...uiTransition, delay: reduced ? 0 : 0.1 + i * 0.06 }}
                className="flex items-start gap-3 text-sm text-eos-on-surface-muted"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--eos-radius-nested)] bg-eos-iris-glow/20 text-eos-iris ring-1 ring-eos-iris/30">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>
        </motion.aside>

        <motion.section
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={uiTransition}
        >
          <EliteAuthPanel
            badge="Authenticate to access telemetry."
            title={embedded ? heading : mode === "signin" ? t("auth", "submitSignIn") : t("auth", "submitSignUp")}
            subtitle={embedded ? subtitle : undefined}
          >
            {!embedded && (
              <div className="mb-5 lg:hidden">
                <BodyText className="text-sm">{subtitle}</BodyText>
              </div>
            )}

            <OAuthRow
              mode={mode}
              signupRole={signupRole}
              onDemoComplete={handleDemoOAuth}
            />

            {authErrorParam === "auth-unconfigured" ? (
              <EliteAuthAlert tone="error" className="mb-4">
                Authentication is not configured for this environment. Contact support.
              </EliteAuthAlert>
            ) : null}

            {mode === "signin" && hydrated && user && (
              <motion.div
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={uiTransition}
                className="mt-5"
              >
                <EliteAuthAlert tone="info">
                  <span className="block font-medium">{t("auth", "alreadySignedIn")}</span>
                  <span className="mt-1 block text-xs opacity-90">
                    {formatMsg(t("auth", "signedInAs"), { name: user.name })}
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <EliteButton
                      type="button"
                      size="sm"
                      onClick={() => {
                        setDemoSessionCookie(user.id);
                        window.location.assign(resolveRedirect(user.role));
                      }}
                    >
                      {t("auth", "continueToDashboard")}
                    </EliteButton>
                    <EliteButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void logoutAuthSession()}
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {t("auth", "signOut")}
                    </EliteButton>
                  </div>
                </EliteAuthAlert>
              </motion.div>
            )}

            {magicSent ? (
              <EliteAuthAlert tone="success" className="mt-4">
                Magic link sent — check your inbox.
              </EliteAuthAlert>
            ) : null}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {error ? <EliteAuthAlert tone="error">{error}</EliteAuthAlert> : null}

              {mode === "signup" && (
                <>
                  <EliteAuthField
                    id="name"
                    label="Full name"
                    icon={User}
                    type="text"
                    required
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Inês M."
                  />
                  <fieldset>
                    <legend>
                      <LabelCaps className="text-eos-on-surface-subtle">I am a</LabelCaps>
                    </legend>
                    <div className="mt-2">
                      <EliteAuthRoleToggle value={signupRole} onChange={setSignupRole} />
                    </div>
                  </fieldset>
                </>
              )}

              {mode === "signin" ? (
                <div>
                  <EliteAuthField
                    id="identifier"
                    label={magicLink ? "Email" : t("auth", "usernameLabel")}
                    icon={magicLink ? Mail : User}
                    type={magicLink ? "email" : "text"}
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                    placeholder={
                      magicLink ? t("auth", "emailPlaceholder") : t("auth", "usernamePlaceholder")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setMagicLink((v) => !v)}
                    className="mt-2 text-xs text-eos-iris-soft hover:text-eos-iris"
                  >
                    {magicLink ? "Use password instead" : "Send magic link instead"}
                  </button>
                </div>
              ) : (
                <EliteAuthField
                  id="email"
                  label={t("auth", "emailLabel")}
                  icon={Mail}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder={t("auth", "emailPlaceholder")}
                />
              )}

              {!magicLink && (
                <EliteAuthField
                  id="password"
                  label={t("auth", "passwordLabel")}
                  icon={Lock}
                  type="password"
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={mode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signin"
                      ? t("auth", "signInPasswordPlaceholder")
                      : t("auth", "passwordPlaceholder")
                  }
                />
              )}

              {mode === "signup" && (
                <label className="flex cursor-pointer items-start gap-2 text-xs text-eos-on-surface-muted">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-eos-outline accent-eos-voltline"
                  />
                  <span>I agree to the Terms of Service and Privacy Policy.</span>
                </label>
              )}

              <EliteButton type="submit" className="w-full min-h-[48px]" disabled={submitted}>
                {submitted ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-eos-floor/40 border-t-eos-floor" />
                    {magicLink && mode === "signin" ? "Sending link…" : submitLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {magicLink && mode === "signin" ? "Send magic link" : submitLabel}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </EliteButton>
            </form>

            <BodyText className="mt-5 text-[11px] leading-relaxed">{t("auth", "legalNote")}</BodyText>

            <div className="mt-5 border-t border-eos-outline pt-5 text-center text-sm text-eos-on-surface-muted">
              {switchPrompt}{" "}
              <Link
                href={switchHref}
                className="font-semibold text-eos-voltline hover:text-eos-voltline/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-iris/50 rounded-md"
              >
                {switchLabel}
              </Link>
            </div>
          </EliteAuthPanel>
        </motion.section>
      </div>
    </div>
  );
}
