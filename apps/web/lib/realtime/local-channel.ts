import type { RealtimeMessage } from "./types";

type Listener = (m: RealtimeMessage) => void;

export class LocalChannel {
  private bc: BroadcastChannel | null;

  private listeners = new Set<Listener>();

  constructor(public name: string) {
    this.bc =
      typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel(name)
        : null;
    if (this.bc) {
      this.bc.addEventListener("message", (e) => {
        for (const l of this.listeners) l(e.data as RealtimeMessage);
      });
    }
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }

  send(m: RealtimeMessage): void {
    if (this.bc) this.bc.postMessage(m);
    for (const l of this.listeners) l(m);
  }

  close(): void {
    this.bc?.close();
    this.listeners.clear();
  }
}
