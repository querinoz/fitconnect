import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-brand-400/30 p-10 md:p-16 text-center bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10">
        <h2 className="font-display text-4xl md:text-6xl font-bold text-balance">
          Your <span className="gradient-text">strongest year</span> starts today.
        </h2>
        <p className="mt-4 text-ink-300 text-lg max-w-2xl mx-auto">
          Join thousands of athletes who finally found a coach who understands their sport.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/discover">
              Get matched in 60 seconds <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/trainer">List your services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
