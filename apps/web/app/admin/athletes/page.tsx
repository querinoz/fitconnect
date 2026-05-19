"use client";

import { ADMIN_ATHLETES } from "@/lib/admin/kpis";
import { Badge } from "@/components/ui/badge";

export default function AdminAthletesPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Athletes</h1>
      <p className="mt-2 text-sm text-ink-400">Subscription status and coach assignment</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-800">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-900/80 text-left text-ink-400">
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
              <tr key={row.id} className="border-t border-ink-800">
                <td className="px-4 py-3 font-medium text-ink-100">{row.name}</td>
                <td className="px-4 py-3 text-ink-400">{row.email}</td>
                <td className="px-4 py-3 capitalize">{row.plan}</td>
                <td className="px-4 py-3 text-ink-300">{row.coach}</td>
                <td className="px-4 py-3">
                  <Badge className={row.status === "paused" ? "opacity-70" : undefined}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
