/** Apple HealthKit bridge — requires native build (EAS). */
export async function requestAppleHealthPermissions(): Promise<boolean> {
  // Stub until react-native-health / expo-health is wired in EAS build
  return false;
}

export async function syncAppleHealthSamples(_athleteId: string): Promise<number> {
  return 0;
}
