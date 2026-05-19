/** Google Health Connect bridge — requires native build (EAS). */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  return false;
}

export async function syncHealthConnectSamples(_athleteId: string): Promise<number> {
  return 0;
}
