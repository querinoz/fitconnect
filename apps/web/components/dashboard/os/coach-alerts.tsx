import { Button } from "@/components/ui/button";

const ALERTS = [
  {
    level: "red" as const,
    athlete: "Ines Correia",
    msg: "HRV −12ms below 30-day avg. Suggest adjusting tonight's session.",
    action: "Adjust plan"
  },
  {
    level: "yellow" as const,
    athlete: "Pedro Silva",
    msg: "Missed 2 sessions this week. Schedule may need review.",
    action: "Message"
  },
  {
    level: "green" as const,
    athlete: "Aoife O'Brien",
    msg: "Hit her sub-4h marathon goal! Great moment to leave a review.",
    action: "Celebrate"
  }
];

const CONFIG = {
  red: {
    border: "border-signal-500/30",
    bg: "bg-signal-500/6",
    dot: "bg-signal-500",
    text: "text-signal-500"
  },
  yellow: {
    border: "border-amber-400/30",
    bg: "bg-amber-400/6",
    dot: "bg-amber-400",
    text: "text-amber-400"
  },
  green: {
    border: "border-lime-500/30",
    bg: "bg-lime-500/6",
    dot: "bg-lime-500",
    text: "text-lime-400"
  }
};

export function AlertCards() {
  return (
    <div className="mb-6 grid gap-3 md:grid-cols-3">
      {ALERTS.map((a) => {
        const config = CONFIG[a.level];
        return (
          <div
            key={a.athlete}
            className={`rounded-xl border ${config.border} ${config.bg} p-4`}
          >
            <div className="mb-1.5 flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              <p className={`text-xs font-bold ${config.text}`}>{a.athlete}</p>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-ink-400">{a.msg}</p>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className={`border-ink-700 text-xs ${config.text} hover:bg-ink-800`}
            >
              {a.action}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export function PayoutSummary() {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-ink-100">Payout Summary</h3>
        <span className="rounded-md border border-lime-500/20 bg-lime-500/10 px-2 py-1 text-[10px] font-medium text-lime-400">
          May 2026
        </span>
      </div>
      <div className="space-y-3 text-sm">
        {[
          { k: "Gross revenue", v: "€4,810" },
          { k: "Platform fee (15%)", v: "−€722" },
          { k: "Stripe processing", v: "−€0" }
        ].map((r) => (
          <div key={r.k} className="flex justify-between">
            <span className="text-xs text-ink-500">{r.k}</span>
            <span className="text-xs font-medium text-ink-300">{r.v}</span>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-ink-800 pt-3">
          <span className="text-sm font-semibold text-ink-200">Net payout</span>
          <span className="font-display text-xl font-bold text-lime-400">€4,089</span>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-ink-600">
        Via Stripe Connect. Paid within 24h of each session.
      </p>
    </div>
  );
}
