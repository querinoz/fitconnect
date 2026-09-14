const INJECTION = /ignore (previous|all) instructions|system prompt|you are now/i;

/** Treat UGC as untrusted data. Never concatenate into a system prompt. */
export function sanitizeUntrustedText(value: string | undefined, max = 2000): string {
  if (!value) return "";
  const clipped = value.slice(0, max);
  if (INJECTION.test(clipped)) {
    return "[untrusted user text omitted]";
  }
  return clipped;
}

export function looksLikePromptInjection(value: string | undefined): boolean {
  return Boolean(value && INJECTION.test(value));
}
