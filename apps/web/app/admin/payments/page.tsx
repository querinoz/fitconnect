import { BentoCard } from "@/components/elite-os";
import { loadAdminPayments } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";
import { EliteAppPage } from "@/components/shell/elite";

export default async function AdminPaymentsPage() {
  const payments = await loadAdminPayments();
  const paid = payments.filter((p) => p.status === "succeeded" || p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const revenue = paid.reduce((sum, p) => sum + p.amountEur, 0);

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Payments"
      subtitle={
        payments.length === 0
          ? "No payment_transactions rows yet"
          : `Recorded volume ${formatPrice(revenue)} · ${pending.length} pending`
      }
    >
      <div className="space-y-3">
        {payments.length === 0 ? (
          <BentoCard elevation="1">
            <p className="text-sm text-eos-on-surface-muted">
              Live checkout events appear here after Stripe webhooks persist.
            </p>
          </BentoCard>
        ) : (
          payments.map((row) => (
            <BentoCard
              key={row.id}
              elevation="1"
              className="flex flex-wrap items-center justify-between gap-3"
            >
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
          ))
        )}
      </div>
    </EliteAppPage>
  );
}
