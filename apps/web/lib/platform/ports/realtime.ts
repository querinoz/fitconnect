import type { RealtimeMessage } from "@/lib/realtime/types";

export type Unsubscribe = () => void;

/**
 * Transport port for cross-device realtime.
 * Today: BroadcastChannelTransport. Phase 2: ConvexTransport.
 */
export interface IRealtimeTransport {
  subscribe(channel: string, handler: (msg: RealtimeMessage) => void): Unsubscribe;
  publish(channel: string, msg: RealtimeMessage): void;
  close?(): void;
}
