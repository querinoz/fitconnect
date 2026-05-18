import type { ReactNode } from "react";
import { AppGroupShell } from "@/components/shell/app-group-shell";

/** Authenticated FitConnect chrome: top bar + page transition + Voltline dock */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppGroupShell>{children}</AppGroupShell>;
}
