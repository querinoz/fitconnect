"use client";

import Link from "next/link";
import { TelemetryStatus } from "@/components/telemetry/telemetry-status";
import type { TelemetryDatum } from "@/lib/telemetry/states";
import { cn } from "@/lib/utils";

type AIContextCardProps = {
  readiness: TelemetryDatum;
  className?: string;
};

/**
 * Shows what context Zenith can use — never invents HRV/sleep/readiness.
 * Pattern reference: 21st AI context / citation blocks — product-bound.
 */
export function AIContextCard({ readiness, className }: AIContextCardProps) {
  const ready = readiness.state === "ready" && readiness.value != null;
  const showConnect =
    readiness.state === "missing" ||
    readiness.state === "not_connected" ||
    readiness.state === "unavailable" ||
    readiness.state === "error";

  return (
    <div
      data-testid="ai-context-card"
      className={cn(
        "rounded-xl border border-eos-outline bg-eos-elevated/50 p-3 text-sm text-eos-on-surface-muted",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-eos-iris-soft">
          Training context
        </p>
        <TelemetryStatus state={readiness.state} />
      </div>
      {ready ? (
        <p>
          Readiness <span className="font-semibold text-eos-voltline">{readiness.value}</span>
          {readiness.source ? (
            <span className="text-eos-on-surface-subtle"> · {readiness.source}</span>
          ) : null}
        </p>
      ) : readiness.state === "loading" ? (
        <p role="status" aria-live="polite">
          Loading training context…
        </p>
      ) : (
        <p>
          Body metrics are not loaded into this chat. Zenith will not invent HRV, sleep, or
          readiness.
          {showConnect ? (
            <>
              {" "}
              <Link
                href="/settings/wearables"
                className="font-semibold text-eos-telemetry underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eos-voltline/60"
              >
                Connect a device
              </Link>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
