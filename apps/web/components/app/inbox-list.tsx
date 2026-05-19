"use client";

import type { ThreadMessage } from "@fitconnect/types";
import { MessageInbox } from "@/components/inbox/message-inbox";

export function InboxList({
  messages,
  loading
}: {
  messages: ThreadMessage[];
  loading?: boolean;
}) {
  return (
    <MessageInbox
      messages={messages}
      loading={loading}
      eyebrow="Coach OS"
      title="Inbox"
      body="Athlete updates, plan notes and session feedback."
      useDemoFallback={false}
    />
  );
}
