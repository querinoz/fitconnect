import {
  Activity,
  BadgeCheck,
  Calendar,
  CreditCard,
  Users
} from "lucide-react";
import { EliteStatTile } from "@/components/dashboard/elite";
import { BentoGrid, EliteChip } from "@/components/elite-os";
import { loadAdminKpis } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";
import { EliteAppPage } from "@/components/shell/elite";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const kpis = await loadAdminKpis();

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Overview"
      subtitle={
        kpis.source === "database"
          ? "Live database counts — never seeded"
          : "Database unavailable — showing zeros, not demo KPIs"
      }
      action={
        <EliteChip as="span" tone="telemetry">
          {kpis.source}
        </EliteChip>
      }
    >
      <BentoGrid cols={3}>
        <EliteStatTile icon={Users} label="Paid athletes" value={String(kpis.paidAthletes)} />
        <EliteStatTile
          icon={BadgeCheck}
          label="Coach capabilities"
          value={String(kpis.verifiedCoaches)}
          tone="performance"
        />
        <EliteStatTile
          icon={CreditCard}
          label="Recorded subscription volume"
          value={formatPrice(kpis.mrrEur)}
          tone="volt"
        />
        <EliteStatTile
          icon={Calendar}
          label="Paid sessions (7d)"
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
