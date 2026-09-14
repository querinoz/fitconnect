import { AdminGate } from "./admin-gate";

/** Admin KPI pages query Postgres. Never SSG against a docker hostname like `base`. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
