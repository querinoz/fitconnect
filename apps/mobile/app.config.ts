import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "FitConnect",
  slug: "fitconnect",
  scheme: "fitconnect",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  platforms: ["ios", "android"],
  plugins: ["expo-router", "expo-notifications"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "fitconnect-mobile-demo"
    }
  }
});
