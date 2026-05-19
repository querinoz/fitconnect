type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendExpoPush(messages: PushMessage[]) {
  if (!messages.length) return { ok: true, skipped: true };

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(messages)
  });

  if (!res.ok) {
    throw new Error(`Expo push failed: ${res.status}`);
  }
  return res.json();
}

export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const messages = tokens.map((to) => ({ to, title, body, data }));
  return sendExpoPush(messages);
}
