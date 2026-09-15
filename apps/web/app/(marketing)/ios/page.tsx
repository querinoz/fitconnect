import type { Metadata } from "next";
import { IosInstallPage } from "@/components/ios-install/ios-install-page";
import { readIosInstallPublicConfig } from "@/lib/ios-install/config";
import { encodeInstallQr, qrModulesToPath } from "@/lib/ios-install/qr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fitconnect-phi.vercel.app";

export const metadata: Metadata = {
  title: "FitConnect™ for iPhone",
  description: "Install and test FitConnect™ on your iPhone.",
  alternates: { canonical: `${SITE}/ios` },
  openGraph: {
    title: "FitConnect™ for iPhone",
    description: "Install and test FitConnect™ on your iPhone.",
    url: `${SITE}/ios`,
    type: "website",
    images: [{ url: "/brand/fitconnect-logo-512.png", width: 512, height: 512, alt: "FitConnect" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "FitConnect™ for iPhone",
    description: "Install and test FitConnect™ on your iPhone.",
    images: ["/brand/fitconnect-logo-512.png"]
  },
  robots: { index: true, follow: true }
};

export default function IosHubPage() {
  const config = readIosInstallPublicConfig();
  const matrix = config.qrTarget ? encodeInstallQr(config.qrTarget) : null;
  const qr = matrix ? qrModulesToPath(matrix) : null;
  const qrFailed = Boolean(config.configured && config.qrTarget && !qr);

  return <IosInstallPage config={config} qr={qr} qrFailed={qrFailed} />;
}
