import type { ThreadMessage } from "@fitconnect/types";

/** Expand preview into a readable thread body for demo / MVP inbox. */
export function expandMessageBody(message: ThreadMessage): string {
  const preview = message.preview.trim();
  if (preview.length > 120) return preview;

  if (message.from === "coach") {
    return `${preview}\n\nI've reviewed your recovery metrics and session notes. Keep me posted after today's work — reply here if anything feels off.\n\n— Your coach`;
  }

  return `${preview}\n\nLet me know if you want to adjust volume or swap tomorrow's block. I'm watching your HRV trend.\n\n— Athlete`;
}

export function messageSubject(message: ThreadMessage): string {
  if (message.from === "coach") {
    if (/plan|threshold|session/i.test(message.preview)) return "Plan update";
    if (/HRV|recovery|sleep/i.test(message.preview)) return "Recovery check-in";
    return "Coach note";
  }
  if (/HRV|sleep|recovery/i.test(message.preview)) return "Recovery update";
  if (/travel|shift|reschedule/i.test(message.preview)) return "Schedule request";
  return "Your message";
}
