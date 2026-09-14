import { BentoCard, EliteChip } from "@/components/elite-os";
import { loadAdminAthletes } from "@/lib/admin/kpis";
import { EliteAppPage } from "@/components/shell/elite";

export default async function AdminAthletesPage() {
  const athletes = await loadAdminAthletes();

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Athletes"
      subtitle="Subscription rows from the live database"
    >
      <BentoCard elevation="1" padding="none" className="overflow-hidden">
        {athletes.length === 0 ? (
          <p className="px-4 py-8 text-sm text-eos-on-surface-muted">No subscription rows yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-eos-surface-container text-left text-eos-on-surface-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((row) => (
                  <tr key={row.id} className="border-t border-eos-outline">
                    <td className="px-4 py-3 font-medium text-ink-100">{row.id}</td>
                    <td className="px-4 py-3 capitalize">{row.plan}</td>
                    <td className="px-4 py-3">
                      <EliteChip as="span" tone="performance">
                        {row.status}
                      </EliteChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>
    </EliteAppPage>
  );
}
