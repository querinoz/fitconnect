import { toastError } from "@/lib/toast/store";
import { captureException } from "@/lib/observability/sentry.client";

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      /* ignore */
    }
    toastError("Something went wrong", message);
    captureException(new Error(message), { url: String(input), status: res.status });
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
