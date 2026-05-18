import type { Metadata } from "next";
import { MobileAppLauncher } from "@/components/mobile-app-launcher";

export const metadata: Metadata = {
  title: "Mobile app demo - FitConnect",
  description: "Open the FitConnect athlete or coach mobile dashboard demo."
};

export default function MobilePage() {
  return <MobileAppLauncher />;
}
