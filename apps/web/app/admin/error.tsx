"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-signal-500/30 bg-signal-500/10 p-6 text-center space-y-4">
      <h2 className="font-display text-xl font-bold text-signal-200">Admin panel error</h2>
      <p className="text-sm text-ink-300">{error.message}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Admin home</Link>
        </Button>
      </div>
    </div>
  );
}
