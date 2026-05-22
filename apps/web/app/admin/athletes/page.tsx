"use client";

import { BentoCard, EliteChip } from "@/components/elite-os";
import { ADMIN_ATHLETES } from "@/lib/admin/kpis";
import { EliteAppPage } from "@/components/shell/elite";

export default function AdminAthletesPage() {
  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Athletes"
      subtitle="Subscription status and coach assignment"
    >
      <BentoCard elevation="1" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-eos-surface-container text-left text-eos-on-surface-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Coach</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ATHLETES.map((row) => (
                <tr key={row.id} className="border-t border-eos-outline">
                  <td className="px-4 py-3 font-medium text-ink-100">{row.name}</td>
                  <td className="px-4 py-3 text-eos-on-surface-muted">{row.email}</td>
                  <td className="px-4 py-3 capitalize">{row.plan}</td>
                  <td className="px-4 py-3 text-ink-300">{row.coach}</td>
                  <td className="px-4 py-3">
                    <EliteChip
                      as="span"
                      tone={row.status === "paused" ? "recovery" : "performance"}
                      className={row.status === "paused" ? "opacity-70" : undefined}
                    >
                      {row.status}
                    </EliteChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </EliteAppPage>
  );
}
