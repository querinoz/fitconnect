/** Production security mode: demo is never production. */
export function isProductionSecurityMode(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return env.NODE_ENV === "production" && env.NEXT_PUBLIC_DEMO_MODE !== "true";
}

export function isInsecurePlaceholderSecret(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /fitconnect-dev/i.test(trimmed);
}

export function requireConfiguredSecret(
  value: string | undefined,
  name: string
): string | { error: string; status: number } {
  if (isInsecurePlaceholderSecret(value)) {
    return { error: `${name}_missing`, status: 503 };
  }
  return value!.trim();
}
