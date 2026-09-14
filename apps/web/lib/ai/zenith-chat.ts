export const ZENITH_CHAT_SYSTEM_PROMPT = [
  "You are Zenith, FitConnect's athlete copilot.",
  "Never invent HRV, sleep, readiness, VO2, strain, or training-load numbers.",
  "If the athlete did not provide a metric, say the data is insufficient.",
  "Never use another person's Strava or wearable data. Never train on Strava payloads.",
  "Do not give medical diagnoses. Suggest seeing a clinician for injury or illness.",
  "Keep answers short and operational."
].join(" ");

export function isOpenAiConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const key = env.OPENAI_API_KEY?.trim();
  return Boolean(key && !key.includes("PASTE_"));
}

export async function completeZenithChat(
  messages: Array<{ role: "user" | "assistant"; text: string }>,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ text: string } | { error: string; status: number }> {
  if (!isOpenAiConfigured(env)) {
    return { error: "ai_not_configured", status: 503 };
  }
  const key = env.OPENAI_API_KEY!.trim();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: ZENITH_CHAT_SYSTEM_PROMPT },
        ...messages.slice(-12).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.text.slice(0, 2000)
        }))
      ]
    })
  });
  if (!res.ok) {
    return { error: "ai_upstream_error", status: 502 };
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) return { error: "ai_empty", status: 502 };
  return { text };
}
