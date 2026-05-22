"use client";

import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n-provider";

interface SignInClientProps {
  redirectOverride?: string;
  coachDemoShortcut?: boolean;
  embedded?: boolean;
}

export function SignInClient({
  redirectOverride,
  coachDemoShortcut = false,
  embedded = false
}: SignInClientProps) {
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
      redirectOverride={redirectOverride}
      coachDemoShortcut={coachDemoShortcut}
      embedded={embedded}
    />
  );
}
