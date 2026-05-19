"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DemoBanner } from "@/components/demo-banner";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { AdminNav } from "@/components/admin/admin-nav";
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

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main" className="mx-auto max-w-6xl px-6 py-10">
        <AdminNav />
        <div className="mt-8">{children}</div>
      </main>
      <Footer />
    </>
  );
}
