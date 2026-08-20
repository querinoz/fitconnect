"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { EliteAppPage } from "@/components/shell/elite";
import { BentoCard, EliteButton } from "@/components/elite-os";

export default function PrivacySettingsPage() {
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestDeletion() {
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/v1/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm })
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      firebaseAuth?: string;
    };
    setPending(false);
    if (!response.ok) {
      setMessage(body.error ?? "deletion_failed");
      return;
    }
    setMessage(`deleted · Firebase Auth ${body.firebaseAuth ?? "PENDING_HUMAN"}`);
  }

  return (
    <AuthGate roles={["athlete", "coach", "admin"]}>
      <EliteAppPage
        eyebrow="Privacy"
        title="Account and data"
        subtitle="Request deletion of FitConnect app data. Legal retention of Firebase Auth is PENDING_HUMAN."
      >
        <BentoCard elevation="1" className="max-w-xl space-y-3">
          <p className="text-sm text-ink-300">
            Type DELETE to confirm. This cannot be undone from the app. Demo mode refuses deletion.
          </p>
          <input
            className="w-full rounded-md border border-[var(--border-xs)] bg-ink-950 px-3 py-2 text-sm"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-label="Deletion confirmation"
          />
          <EliteButton
            type="button"
            variant="danger"
            disabled={pending || confirm !== "DELETE"}
            onClick={() => void requestDeletion()}
          >
            Request account deletion
          </EliteButton>
          {message ? <p className="text-xs text-eos-recovery">{message}</p> : null}
        </BentoCard>
      </EliteAppPage>
    </AuthGate>
  );
}
