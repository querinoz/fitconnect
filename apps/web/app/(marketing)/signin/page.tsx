import { safeInternalNextPath } from "@/lib/auth";
import { SignInClient } from "./sign-in-client";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string; next?: string }>;
}) {
  const query = await searchParams;
  const next = safeInternalNextPath(query.next ?? null);

  return (
    <SignInClient
      redirectOverride={next}
      coachDemoShortcut={query.demo === "coach"}
    />
  );
}
