"use client";

import { useLocale } from "@/lib/i18n-provider";

export function LandingEcosystemAct() {
  const copy = useLocale().landingEditorial.ecosystem;
  const rows = [
    { name: copy.android, status: copy.androidStatus },
    { name: copy.web, status: copy.webStatus },
    { name: copy.wear, status: copy.wearStatus },
    { name: copy.watchos, status: copy.watchosStatus },
    { name: copy.xiaomi, status: copy.xiaomiStatus }
  ];

  return (
    <section id="ecosystem" className="mx-auto w-[min(calc(100%-2rem),1440px)] scroll-mt-28 py-16 sm:py-24">
      <p className="eos-label-caps text-eos-voltline">{copy.eyebrow}</p>
      <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2.2rem,6vw,4.4rem)] font-extrabold uppercase leading-[0.88] tracking-tight text-eos-on-surface">
        {copy.title}
      </h2>
      <p className="mt-4 max-w-2xl text-eos-on-surface-muted">{copy.subtitle}</p>
      <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {rows.map((row) => (
          <li key={row.name} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <span className="font-display text-xl text-eos-on-surface">{row.name}</span>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-eos-connect">{row.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
