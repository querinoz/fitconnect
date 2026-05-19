"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { trackEvent } from "@/lib/observability/posthog";

export function HeroEmailCapture() {
  const locale = useLocale();
  const t = locale.emailCapture;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    trackEvent("email_capture", { email, source: "hero" });
    await fetch("/api/v1/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "hero" })
    }).catch(() => undefined);
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <p className="mt-6 text-sm font-medium text-volt-400">{t.success}</p>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.placeholder}
        className="flex-1 rounded-xl border border-ink-800 bg-ink-950/80 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-volt-500/40"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-brand-500/20 px-4 py-2.5 text-sm font-semibold text-brand-300 ring-1 ring-brand-500/35 hover:bg-brand-500/30 disabled:opacity-60"
      >
        {t.button}
      </button>
    </form>
  );
}
