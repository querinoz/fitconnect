import type { Metadata } from "next";
import { EliteMobileCockpit } from "@/components/mobile/elite-mobile-cockpit";

export const metadata: Metadata = {
  title: "Mobile cockpit — FitConnect Elite OS",
  description: "LOCAL_DEMO mobile web cockpit. Same Voltline identity as Android — not production GPS."
};

export default function AppMobileCockpitPage() {
  return <EliteMobileCockpit />;
}
