"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";
import { readConvexUrl } from "@/lib/convex/client";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const url = readConvexUrl();
    if (!url) return null;
    try {
      return new ConvexReactClient(url);
    } catch {
      return null;
    }
  }, []);

  if (!client) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
