"use client";

import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useT } from "@/lib/i18n-provider";

interface SignInClientProps {
  redirectOverride?: string;
  coachDemoShortcut?: boolean;
  embedded?: boolean;
}

function SignInContent(props: SignInClientProps) {
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
      redirectOverride={props.redirectOverride}
      coachDemoShortcut={props.coachDemoShortcut}
      embedded={props.embedded}
    />
  );
}

export function SignInClient(props: SignInClientProps) {
  return (
    <Suspense fallback={null}>
      <SignInContent {...props} />
    </Suspense>
  );
}
