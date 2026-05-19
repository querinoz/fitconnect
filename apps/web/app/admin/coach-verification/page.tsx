"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useVerificationStore } from "@/lib/coach/verification-store";
import { cn } from "@/lib/utils";
import { toastSuccess } from "@/lib/toast/store";

export default function CoachVerificationAdminPage() {
  const cases = useVerificationStore((s) => s.cases);
  const updateStatus = useVerificationStore((s) => s.updateStatus);

  function approve(id: string, name: string) {
    updateStatus(id, "approved");
    toastSuccess("Coach approved", `${name} can now receive bookings.`);
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Coach verification</h1>
      <p className="mt-2 text-sm text-ink-400">
        Review pending coaches · approve or reject applications
      </p>

      <div className="mt-8 space-y-4">
        {cases.length === 0 && (
          <p className="text-ink-500 text-sm">No verification cases.</p>
        )}
        {cases.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-ink-800 bg-ink-950/60 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-ink-100">{c.coachName}</h2>
                <p className="text-sm text-ink-400">{c.email}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {c.sports.join(", ")} · submitted{" "}
                  {new Date(c.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                  c.status === "approved" && "bg-accent-500/15 text-accent-300",
                  c.status === "rejected" && "bg-signal-500/15 text-signal-300",
                  c.status === "under_review" && "bg-brand-500/15 text-brand-200",
                  c.status === "pending" && "bg-ink-800 text-ink-400"
                )}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => approve(c.id, c.coachName)}
                disabled={c.status === "approved"}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(c.id, "under_review")}
                disabled={c.status === "under_review"}
              >
                Mark reviewing
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => updateStatus(c.id, "rejected")}
                disabled={c.status === "rejected"}
              >
                Reject
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
