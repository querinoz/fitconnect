import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TRAINERS } from "@/lib/data";
import { TrainerCard } from "./trainer-card";

export function TrainersGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
            Featured trainers
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            Real specialists. Real results.
          </h2>
        </div>
        <Link
          href="/discover"
          className="hidden md:inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 text-sm"
        >
          See all 12,000+ <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRAINERS.slice(0, 8).map((t) => (
          <TrainerCard key={t.id} t={t} />
        ))}
      </div>
    </section>
  );
}
