"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { dashboardPathForRole } from "@/lib/auth";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const home = role ? dashboardPathForRole(role) : "/";

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center space-y-4">
      <h1 className="font-display text-2xl font-bold">Dashboard error</h1>
      <p className="text-sm text-ink-400">{error.message}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href={home}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
