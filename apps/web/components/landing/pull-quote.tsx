import { cn } from "@/lib/utils";

type PullQuoteProps = {
  text: string;
  attribution: string;
  className?: string;
};

/** Editorial pull quote — mark sits in its own column so copy never collides. */
export function PullQuote({ text, attribution, className }: PullQuoteProps) {
  return (
    <section className={cn("mx-auto w-[min(calc(100%-2rem),48rem)] py-20 sm:py-28", className)}>
      <blockquote className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-6 sm:gap-10">
        <span
          aria-hidden
          className="mt-1 select-none font-display text-4xl leading-none text-eos-voltline/30 sm:text-5xl"
        >
          «
        </span>
        <div className="min-w-0">
          <p className="font-display text-[clamp(1.35rem,3.2vw,2.5rem)] font-semibold leading-snug tracking-[-0.02em] text-eos-on-surface">
            {text}
          </p>
          <footer className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-eos-voltline">
            — {attribution}
          </footer>
        </div>
      </blockquote>
    </section>
  );
}
