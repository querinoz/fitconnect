import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Insights · FitConnect",
  description: "Load, recovery, and history dashboards. LOCAL_DEMO series until IndexedDB exists."
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return children;
}
