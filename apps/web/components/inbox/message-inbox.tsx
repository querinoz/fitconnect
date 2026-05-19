"use client";

import { useCallback, useMemo, useState } from "react";
import type { ThreadMessage } from "@fitconnect/types";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Send,
  Sparkles
} from "lucide-react";
import { PremiumCard, RealtimeBadge, SectionHeader } from "@/components/ui-glass/premium-system";
import { LiquidLoader } from "@/components/ui-glass/liquid-loader";
import { Button } from "@/components/ui/button";
import { expandMessageBody, messageSubject } from "@/lib/inbox/expand-message";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

type InboxMessage = ThreadMessage & { title?: string };

const DEMO_MESSAGES: InboxMessage[] = [
  {
    id: "demo-1",
    threadId: "demo-thread",
    athleteId: "demo",
    coachId: "demo-coach",
    from: "coach",
    preview: "Thursday threshold moved. Coach has the update.",
    when: new Date().toISOString(),
    unread: true,
    title: "Plan update approved"
  },
  {
    id: "demo-2",
    threadId: "demo-thread",
    athleteId: "demo",
    coachId: "demo-coach",
    from: "coach",
    preview: "How did the last set feel? Reply when you are done cooling down.",
    when: new Date(Date.now() - 3600000).toISOString(),
    unread: false,
    title: "Coach check-in"
  }
];

function formatWhen(when: string) {
  if (/^\d+[mhd]$/i.test(when.trim()) || when.includes("ago")) return when;
  const d = new Date(when);
  if (Number.isNaN(d.getTime())) return when;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function MessageInbox({
  messages,
  loading,
  eyebrow = "Realtime",
  title = "Inbox",
  body = "Plan updates, coach notes and session feedback.",
  useDemoFallback = true
}: {
  messages: ThreadMessage[];
  loading?: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
  useDemoFallback?: boolean;
}) {
  const markMessageRead = useDashboardStore((s) => s.markMessageRead);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localRead, setLocalRead] = useState<Set<string>>(() => new Set());
  const [reply, setReply] = useState("");

  const rows = useMemo(() => {
    const source = messages.length > 0 ? messages : useDemoFallback ? DEMO_MESSAGES : [];
    return source.map((m) => ({
      ...m,
      unread: m.unread && !localRead.has(m.id)
    }));
  }, [messages, localRead, useDemoFallback]);

  const selected = rows.find((m) => m.id === selectedId) ?? null;

  const openMessage = useCallback(
    (m: InboxMessage) => {
      setSelectedId(m.id);
      setLocalRead((prev) => new Set(prev).add(m.id));
      markMessageRead(m.id);
    },
    [markMessageRead]
  );

  const closeMessage = useCallback(() => {
    setSelectedId(null);
    setReply("");
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 pb-2">
        <SectionHeader eyebrow={eyebrow} title={title} body={body} />
        <LiquidLoader label="Syncing inbox" />
      </div>
    );
  }

  if (selected) {
    const subject = (selected as InboxMessage).title ?? messageSubject(selected);
    const fullBody = expandMessageBody(selected);

    return (
      <div className="fc-inbox-detail space-y-4 pb-2 fc-mobile-page-enter">
        <button
          type="button"
          onClick={closeMessage}
          className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-md px-3 py-1.5 text-xs font-semibold text-ink-300 fc-liquid-glass transition hover:text-ink-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to inbox
        </button>

        <PremiumCard tone="brand" className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/20 text-brand-300">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">
                {selected.from === "coach" ? "From coach" : "From you"}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-ink-50">{subject}</h2>
              <p className="mt-1 text-xs text-ink-500">{formatWhen(selected.when)}</p>
            </div>
            <RealtimeBadge>Open</RealtimeBadge>
          </div>

          <div className="rounded-2xl border border-ink-800/80 bg-ink-950/50 p-4">
            {fullBody.split("\n\n").map((para, i) => (
              <p key={i} className={cn("text-sm leading-7 text-ink-300", i > 0 && "mt-4")}>
                {para}
              </p>
            ))}
          </div>

          {selected.from === "coach" && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-brand-500 to-volt-500 text-ink-950"
              >
                <Check className="h-3.5 w-3.5" />
                Acknowledge
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-ink-700">
                View plan
              </Button>
            </div>
          )}
        </PremiumCard>

        <PremiumCard className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-plasma-400" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Reply</p>
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Write a quick reply…"
            className="w-full resize-none rounded-2xl border border-ink-800 bg-ink-950/60 px-4 py-3 text-sm text-ink-200 placeholder:text-ink-600 focus:border-brand-400/40 focus:outline-none"
          />
          <Button
            type="button"
            disabled={!reply.trim()}
            className="gap-2 bg-gradient-to-r from-brand-500 to-lime-500 text-ink-950"
          >
            <Send className="h-4 w-4" />
            Send reply
          </Button>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        body={body}
        action={<RealtimeBadge>Live sync</RealtimeBadge>}
      />

      {rows.length === 0 ? (
        <PremiumCard className="p-6 text-center">
          <p className="text-sm text-ink-400">No messages yet.</p>
        </PremiumCard>
      ) : (
        <ul className="space-y-3">
          {rows.map((m) => {
            const subject = (m as InboxMessage).title ?? messageSubject(m);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openMessage(m)}
                  className="w-full text-left"
                >
                  <PremiumCard
                    tone={m.unread ? "volt" : "neutral"}
                    interactive
                    className={cn(
                      "flex gap-3 p-4 transition",
                      m.unread && "ring-1 ring-volt-500/25"
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink-50">{subject}</p>
                        {m.unread ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-volt-400 shadow-[0_0_8px_var(--volt-glow)]" />
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-400">
                        {m.preview}
                      </p>
                      <p className="mt-2 text-[10px] text-ink-500">{formatWhen(m.when)}</p>
                    </div>
                  </PremiumCard>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
