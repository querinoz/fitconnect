import { IOS_INSTALL_PATH, OFFICIAL_TESTFLIGHT_APP_URL } from "./allowlist";

export type IosQrPath = {
  path: string;
  dim: number;
};

export type IosInstallPublicConfig = {
  configured: boolean;
  qrTarget: string | null;
  installPath: typeof IOS_INSTALL_PATH;
  installAbsoluteUrl: string;
  testflightAppUrl: typeof OFFICIAL_TESTFLIGHT_APP_URL;
  version: string | null;
  build: string | null;
  betaStatus: string | null;
  distributionLabel: "TestFlight";
};
