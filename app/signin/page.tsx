"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n-provider";
import { safeInternalNextPath } from "@/lib/auth";

function SignInInner() {
  const t = useT();
  const sp = useSearchParams();
  const demo = sp.get("demo");
  const nextRaw = sp.get("next");
  const next = safeInternalNextPath(nextRaw);

  return (
    <AuthShell
      mode="signin"
      heading={t("auth", "signInHeading")}
      subtitle={t("auth", "signInSubtitle")}
      submitLabel={t("auth", "submitSignIn")}
      switchPrompt={t("auth", "noAccount")}
      switchLabel={t("auth", "createAccount")}
      switchHref="/signup"
      redirectOverride={next}
      coachDemoShortcut={demo === "coach"}
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-ink-950 text-ink-300 flex items-center justify-center text-sm">
          Loading…
        </div>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
