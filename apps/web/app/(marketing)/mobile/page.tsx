import type { Metadata } from "next";
import { MobileAppLauncher } from "@/components/mobile-app-launcher";

export const metadata: Metadata = {
  title: "Mobile app demo - FitConnect",
  description: "FitConnect app preview on iPhone, Galaxy Watch and laptop."
};

export default function MobilePage() {
  return <MobileAppLauncher />;
}
