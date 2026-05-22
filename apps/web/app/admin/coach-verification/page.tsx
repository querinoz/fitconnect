"use client";

import { BentoCard, EliteButton, EliteChip } from "@/components/elite-os";
import { useVerificationStore } from "@/lib/coach/verification-store";
import { EliteAppPage } from "@/components/shell/elite";
import { toastSuccess } from "@/lib/toast/store";

const statusTone = {
  approved: "performance",
  rejected: "alert",
  under_review: "iris",
  pending: "neutral"
} as const;

export default function CoachVerificationAdminPage() {
  const cases = useVerificationStore((s) => s.cases);
  const updateStatus = useVerificationStore((s) => s.updateStatus);

  function approve(id: string, name: string) {
    updateStatus(id, "approved");
    toastSuccess("Coach approved", `${name} can now receive bookings.`);
  }

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Coach verification"
      subtitle="Review pending coaches · approve or reject applications"
    >
      <div className="space-y-4">
        {cases.length === 0 && (
          <p className="text-sm text-eos-on-surface-muted">No verification cases.</p>
        )}
        {cases.map((c) => (
          <BentoCard key={c.id} elevation="1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-ink-100">{c.coachName}</h2>
                <p className="text-sm text-eos-on-surface-muted">{c.email}</p>
                <p className="mt-1 text-xs text-eos-on-surface-muted">
                  {c.sports.join(", ")} · submitted{" "}
                  {new Date(c.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <EliteChip as="span" tone={statusTone[c.status]}>
                {c.status.replace("_", " ")}
              </EliteChip>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <EliteButton
                size="sm"
                onClick={() => approve(c.id, c.coachName)}
                disabled={c.status === "approved"}
              >
                Approve
              </EliteButton>
              <EliteButton
                size="sm"
                variant="secondary"
                onClick={() => updateStatus(c.id, "under_review")}
                disabled={c.status === "under_review"}
              >
                Mark reviewing
              </EliteButton>
              <EliteButton
                size="sm"
                variant="ghost"
                onClick={() => updateStatus(c.id, "rejected")}
                disabled={c.status === "rejected"}
              >
                Reject
              </EliteButton>
            </div>
          </BentoCard>
        ))}
      </div>
    </EliteAppPage>
  );
}
