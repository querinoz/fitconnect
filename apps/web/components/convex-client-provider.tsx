"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";
import { isConvexConfigured } from "@/lib/convex/client";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
    if (!url) return null;
    return new ConvexReactClient(url);
  }, []);

  if (!client || !isConvexConfigured()) {
    return <>{children}</>;
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
