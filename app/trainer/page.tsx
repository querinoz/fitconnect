import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

const perks = [
  "Keep 85% of every booking",
  "Free HD video & scheduling tools",
  "Stripe Connect payouts",
  "Marketing visibility to 1M+ athletes",
  "Built-in plan builder & analytics",
  "Verified-coach badge after onboarding"
];

export default function TrainerCtaPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
              For coaches
            </p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold text-balance">
              Run your <span className="gradient-text">entire coaching business</span> from one app.
            </h1>
            <p className="mt-5 text-ink-300 text-lg">
              We handle bookings, payments, video and content tools. You focus on coaching.
              Average trainer on FitConnect earns €3,420 / month within 90 days.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard?as=trainer">Apply now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#perks">See perks</Link>
              </Button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&auto=format&fit=crop"
            alt=""
            className="rounded-3xl"
          />
        </section>

        <section id="perks" className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-10 grid md:grid-cols-2 gap-5">
            {perks.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-500/10 text-accent-500">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-ink-200 mt-1">{p}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
