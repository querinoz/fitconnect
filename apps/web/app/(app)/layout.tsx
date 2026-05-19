import type { ReactNode } from "react";
import { AppGroupShell } from "@/components/shell/app-group-shell";
import { MotionProviders } from "@/components/motion-providers";

/** Authenticated FitConnect chrome: top bar + page transition + Voltline dock */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProviders>
      <AppGroupShell>{children}</AppGroupShell>
    </MotionProviders>
  );
}
