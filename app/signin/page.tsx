"use client";

export const dynamic = "force-dynamic";

import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n-provider";

export default function SignInPage() {
  const t = useT();
  return (
    <AuthShell
      mode="signin"
      heading={t("auth", "signInHeading")}
      subtitle={t("auth", "signInSubtitle")}
      submitLabel={t("auth", "submitSignIn")}
      switchPrompt={t("auth", "noAccount")}
      switchLabel={t("auth", "createAccount")}
      switchHref="/signup"
    />
  );
}
