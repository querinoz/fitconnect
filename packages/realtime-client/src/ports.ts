export type Unsubscribe = () => void;

/** Minimal message shape — apps extend with their union types. */
export type RealtimePayload = Record<string, unknown> & {
  kind: string;
  at: string;
};

export interface IRealtimeTransport {
  subscribe(channel: string, handler: (msg: RealtimePayload) => void): Unsubscribe;
  publish(channel: string, msg: RealtimePayload): void;
  close?(): void;
}
