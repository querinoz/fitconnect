"use client";

import { ADMIN_PAYMENTS } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const paid = ADMIN_PAYMENTS.filter((p) => p.status === "paid");
  const pending = ADMIN_PAYMENTS.filter((p) => p.status === "pending");
  const revenue = paid.reduce((sum, p) => sum + p.amountEur, 0);

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Payments</h1>
      <p className="mt-2 text-sm text-ink-400">
        Revenue {formatPrice(revenue)} · {pending.length} pending payouts
      </p>
      <div className="mt-8 space-y-3">
        {ADMIN_PAYMENTS.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-800 bg-ink-950/60 px-5 py-4"
          >
            <div>
              <p className="font-semibold text-ink-100">{row.party}</p>
              <p className="text-xs text-ink-500">
                {row.type} · {row.date}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-ink-50">{formatPrice(row.amountEur)}</p>
              <p className="text-xs capitalize text-ink-400">{row.status}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
