"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-ink-950 text-ink-100 grid place-items-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-ink-400">{error.message}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => reset()}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
