"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSubscription } from "@/lib/stripe/client";
import type { BillingPeriod, SubscriptionPlan } from "@/lib/stripe/plans";

type PricingCtaProps = {
  planName: string;
  period: BillingPeriod;
  variant?: "default" | "outline";
  children: React.ReactNode;
};

const PLAN_MAP: Record<string, SubscriptionPlan | "free"> = {
  Free: "free",
  Athlete: "athlete",
  Team: "team",
  Coach: "coach"
};

export function PricingCta({ planName, period, variant = "outline", children }: PricingCtaProps) {
  const [loading, setLoading] = useState(false);
  const mapped = PLAN_MAP[planName] ?? "free";

  if (mapped === "free") {
    return (
      <Button asChild className="w-full" variant={variant}>
        <Link href="/discover">
          {children} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      await startSubscription({ plan: mapped, period });
    } catch {
      window.location.assign(
        `/signin?next=${encodeURIComponent(`/pricing?plan=${mapped}&period=${period}`)}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      className="w-full"
      variant={variant}
      disabled={loading}
      onClick={() => void handleClick()}
    >
      {loading ? "Redirecting…" : children} <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
