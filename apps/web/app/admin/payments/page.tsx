"use client";

import { BentoCard } from "@/components/elite-os";
import { ADMIN_PAYMENTS } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";
import { EliteAppPage } from "@/components/shell/elite";

export default function AdminPaymentsPage() {
  const paid = ADMIN_PAYMENTS.filter((p) => p.status === "paid");
  const pending = ADMIN_PAYMENTS.filter((p) => p.status === "pending");
  const revenue = paid.reduce((sum, p) => sum + p.amountEur, 0);

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Payments"
      subtitle={`Revenue ${formatPrice(revenue)} · ${pending.length} pending payouts`}
    >
      <div className="space-y-3">
        {ADMIN_PAYMENTS.map((row) => (
          <BentoCard key={row.id} elevation="1" className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink-100">{row.party}</p>
              <p className="text-xs text-eos-on-surface-muted">
                {row.type} · {row.date}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-ink-50">{formatPrice(row.amountEur)}</p>
              <p className="text-xs capitalize text-eos-on-surface-muted">{row.status}</p>
            </div>
          </BentoCard>
        ))}
      </div>
    </EliteAppPage>
  );
}
