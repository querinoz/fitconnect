"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminShell } from "@/components/shell/admin-shell";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/signin?next=/admin");
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user || user.role !== "admin") {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
