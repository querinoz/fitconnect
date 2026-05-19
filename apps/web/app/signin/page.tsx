import { safeInternalNextPath } from "@/lib/auth";
import { SignInClient } from "./sign-in-client";

export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams
}: {
  searchParams: { demo?: string; next?: string };
}) {
  const next = safeInternalNextPath(searchParams.next ?? null);

  return (
    <SignInClient
      redirectOverride={next}
      coachDemoShortcut={searchParams.demo === "coach"}
    />
  );
}
