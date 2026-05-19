"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Simple route swap — opacity enter animations were leaving tabs invisible on mobile. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="min-h-full fc-mobile-page-enter">
      {children}
    </div>
  );
}
