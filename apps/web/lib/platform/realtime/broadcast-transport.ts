import { LocalChannel } from "@/lib/realtime/local-channel";
import type { RealtimeMessage } from "@/lib/realtime/types";
import type { IRealtimeTransport, Unsubscribe } from "@/lib/platform/ports/realtime";

/** Dev/demo transport — same-browser BroadcastChannel (current behavior). */
export class BroadcastChannelTransport implements IRealtimeTransport {
  private channels = new Map<string, LocalChannel>();

  private getChannel(name: string): LocalChannel {
    let ch = this.channels.get(name);
    if (!ch) {
      ch = new LocalChannel(name);
      this.channels.set(name, ch);
    }
    return ch;
  }

  subscribe(
    channel: string,
    handler: (msg: RealtimeMessage) => void
  ): Unsubscribe {
    return this.getChannel(channel).subscribe(handler);
  }

  publish(channel: string, msg: RealtimeMessage): void {
    this.getChannel(channel).send(msg);
  }

  close(): void {
    for (const ch of this.channels.values()) ch.close();
    this.channels.clear();
  }
}

/** Singleton for hook consumers (mirrors prior LocalChannel cache pattern). */
let singleton: BroadcastChannelTransport | null = null;

export function getBroadcastTransport(): BroadcastChannelTransport {
  if (!singleton) singleton = new BroadcastChannelTransport();
  return singleton;
}

export function resetBroadcastTransportForTests(): void {
  singleton?.close();
  singleton = null;
}
