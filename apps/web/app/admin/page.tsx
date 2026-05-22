"use client";

import {
  Activity,
  BadgeCheck,
  Calendar,
  CreditCard,
  Users
} from "lucide-react";
import { EliteStatTile } from "@/components/dashboard/elite";
import { BentoGrid, EliteChip } from "@/components/elite-os";
import { getAdminKpis } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";
import { EliteAppPage } from "@/components/shell/elite";

export default function AdminOverviewPage() {
  const kpis = getAdminKpis();

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Overview"
      subtitle="Live KPIs · demo data"
      action={<EliteChip as="span" tone="telemetry">Realtime sync</EliteChip>}
    >
      <BentoGrid cols={3}>
        <EliteStatTile
          icon={Users}
          label="Paid athletes"
          value={kpis.paidAthletes.toLocaleString()}
        />
        <EliteStatTile
          icon={BadgeCheck}
          label="Verified coaches"
          value={kpis.verifiedCoaches.toLocaleString()}
          tone="performance"
        />
        <EliteStatTile
          icon={CreditCard}
          label="MRR"
          value={formatPrice(kpis.mrrEur)}
          tone="volt"
        />
        <EliteStatTile
          icon={Calendar}
          label="Sessions this week"
          value={String(kpis.sessionsThisWeek)}
        />
        <EliteStatTile
          icon={Activity}
          label="Goal completion"
          value={`${Math.round(kpis.goalCompletionRate * 100)}%`}
          tone="telemetry"
        />
        <EliteStatTile
          icon={Users}
          label="Pending verifications"
          value={String(kpis.pendingVerifications)}
          tone="iris"
        />
      </BentoGrid>
    </EliteAppPage>
  );
}
