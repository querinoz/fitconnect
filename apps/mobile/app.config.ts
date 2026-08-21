import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // BOUNDARY (2026-08-18): this Expo app is frozen (ADR-005) but is still buildable and
  // installable. It previously declared the SAME visible name and the SAME "fitconnect://"
  // scheme as the native Android app, so both could land on a device as two identical
  // "FitConnect" icons competing for the same deep links. Name, scheme and applicationId
  // are now distinct. Do not point these back at the native app's values.
  name: "FitConnect (Expo)",
  slug: "fitconnect",
  scheme: "fitconnect-expo",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  platforms: ["ios", "android"],
  plugins: ["expo-router", "expo-notifications"],
  android: { package: "com.fitconnect.expo" },
  ios: { bundleIdentifier: "com.fitconnect.expo" },
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "fitconnect-mobile-demo"
    }
  }
});
