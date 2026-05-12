"use client";

import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n-provider";

export default function SignUpPage() {
  const t = useT();
  return (
    <AuthShell
      mode="signup"
      heading={t("auth", "signUpHeading")}
      subtitle={t("auth", "signUpSubtitle")}
      submitLabel={t("auth", "submitSignUp")}
      switchPrompt={t("auth", "haveAccount")}
      switchLabel={t("auth", "signInLink")}
      switchHref="/signin"
    />
  );
}
