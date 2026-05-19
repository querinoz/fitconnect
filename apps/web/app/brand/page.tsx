"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MARK_DIRECTIONS, totalScore } from "@/lib/brand/exploration/directions";
import { BRAND_PALETTES } from "@/lib/brand/exploration/palettes";
import { EXPLORATION_MARKS } from "@/lib/brand/exploration/marks";

export default function BrandExplorationPage() {
  const [markId, setMarkId] = useState("readiness-ring");
  const [paletteId, setPaletteId] = useState("01-original");

  const direction = MARK_DIRECTIONS.find((d) => d.id === markId)!;
  const palette = BRAND_PALETTES.find((p) => p.id === paletteId)!;
  const Mark = EXPLORATION_MARKS[markId];

  const ranked = useMemo(
    () => [...MARK_DIRECTIONS].sort((a, b) => totalScore(b) - totalScore(a)),
    []
  );

  return (
    <div
      className="min-h-dvh text-sm"
      style={{ background: palette.ink950, color: palette.ink50 }}
    >
      <header className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.brand }}>
            Phase 1 · Brand exploration
          </p>
          <h1 className="font-display text-xl font-bold">FitConnect — 10 marks × 10 palettes</h1>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:border-white/30"
        >
          ← Back to site
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-10">
        {/* Hero preview */}
        <section
          className="rounded-2xl border border-white/10 p-8 grid lg:grid-cols-2 gap-8 items-center"
          style={{ background: `linear-gradient(145deg, ${palette.ink950}, ${palette.ink950}ee)` }}
        >
          <div className="flex flex-col items-center gap-6">
            <div
              className="flex items-center justify-center rounded-2xl border border-white/10"
              style={{
                width: 160,
                height: 160,
                background: palette.gradient,
                color: palette.ink950
              }}
            >
              <Mark color={palette.ink950} width={96} height={96} />
            </div>
            <div className="flex items-center gap-4">
              <Mark color={palette.brand} width={48} height={48} />
              <span className="font-display text-2xl font-bold">
                <span style={{ color: palette.ink50 }}>Fit</span>
                <span style={{ color: palette.brand }}>Connect</span>
              </span>
            </div>
            <p className="text-center text-xs text-white/50 max-w-sm">
              Mark: <strong style={{ color: palette.brand }}>{direction.letter}. {direction.name}</strong>
              {" · "}
              Palette: {palette.name}
            </p>
          </div>

          <div className="space-y-3 text-xs text-white/70">
            <p>
              <span className="font-semibold text-white">Concept:</span> {direction.concept}
            </p>
            <p>
              <span className="font-semibold text-white">Geometry:</span> {direction.geometry}
            </p>
            <p>
              <span className="font-semibold text-white">Feeling:</span> {direction.feeling}
            </p>
            <p>
              <span className="font-semibold text-white">Risk:</span> {direction.risk}
            </p>
            <p className="pt-2 font-mono text-[11px]" style={{ color: palette.accent }}>
              Score: {totalScore(direction)}/40
              {totalScore(direction) >= 32 ? " · ADVANCES" : " · needs iteration"}
            </p>
          </div>
        </section>

        {/* Size tests */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">Size tests</h2>
          <div className="flex flex-wrap items-end gap-6">
            {[16, 24, 32, 48, 64, 96].map((px) => (
              <div key={px} className="text-center">
                <Mark color={palette.brand} width={px} height={px} />
                <p className="mt-1 text-[10px] text-white/40">{px}px</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-8">
            <div className="rounded-xl bg-white p-6">
              <Mark color="#000" width={48} height={48} />
              <p className="mt-2 text-[10px] text-black/50">Black on white</p>
            </div>
            <div className="rounded-xl bg-black p-6 border border-white/10">
              <Mark color="#fff" width={48} height={48} />
              <p className="mt-2 text-[10px] text-white/50">White on black</p>
            </div>
            <div className="rounded-xl bg-neutral-400 p-6">
              <Mark color="#333" width={48} height={48} />
              <p className="mt-2 text-[10px] text-neutral-700">Emboss test</p>
            </div>
          </div>
        </section>

        {/* Mark grid */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            10 mark directions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {MARK_DIRECTIONS.map((d) => {
              const M = EXPLORATION_MARKS[d.id];
              const active = d.id === markId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setMarkId(d.id)}
                  className="rounded-xl border p-4 text-left transition"
                  style={{
                    borderColor: active ? palette.brand : "rgba(255,255,255,0.1)",
                    background: active ? `${palette.brand}11` : "transparent"
                  }}
                >
                  <M color={active ? palette.brand : palette.ink50} width={40} height={40} />
                  <p className="mt-2 font-semibold text-xs">
                    {d.letter}. {d.name}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">{totalScore(d)}/40</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Palette grid */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            10 palette variants
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {BRAND_PALETTES.map((pal) => {
              const active = pal.id === paletteId;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setPaletteId(pal.id)}
                  className="rounded-xl border p-3 text-left transition"
                  style={{
                    borderColor: active ? pal.brand : "rgba(255,255,255,0.1)",
                    background: pal.ink950
                  }}
                >
                  <div className="flex gap-1 h-6 rounded overflow-hidden">
                    <span className="flex-1" style={{ background: pal.brand }} />
                    <span className="flex-1" style={{ background: pal.accent }} />
                    <span className="flex-1" style={{ background: pal.signal }} />
                    <span className="flex-1" style={{ background: pal.plasma }} />
                  </div>
                  <p className="mt-2 text-xs font-semibold" style={{ color: pal.ink50 }}>
                    {pal.name}
                  </p>
                  <p className="text-[10px] text-white/40">{pal.mood}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Ranking table */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
            Evaluation matrix (Creative Director)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Direction</th>
                  <th className="p-2">T</th>
                  <th className="p-2">S</th>
                  <th className="p-2">BF</th>
                  <th className="p-2">D</th>
                  <th className="p-2">1C</th>
                  <th className="p-2">C</th>
                  <th className="p-2">G</th>
                  <th className="p-2">V</th>
                  <th className="p-2 font-bold">Σ</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((d, i) => (
                  <tr
                    key={d.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => setMarkId(d.id)}
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 font-medium">
                      {d.letter}. {d.name}
                    </td>
                    <td className="p-2 text-center">{d.scores.timeless}</td>
                    <td className="p-2 text-center">{d.scores.scale}</td>
                    <td className="p-2 text-center">{d.scores.brandFit}</td>
                    <td className="p-2 text-center">{d.scores.diff}</td>
                    <td className="p-2 text-center">{d.scores.mono}</td>
                    <td className="p-2 text-center">{d.scores.concept}</td>
                    <td className="p-2 text-center">{d.scores.purity}</td>
                    <td className="p-2 text-center">{d.scores.versatile}</td>
                    <td
                      className="p-2 text-center font-bold"
                      style={{ color: totalScore(d) >= 32 ? palette.accent : palette.signal }}
                    >
                      {totalScore(d)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-white/40">
            T=Timeless · S=Scale · BF=Brand fit · D=Differentiation · 1C=Mono · C=Concept · G=Geometry · V=Versatile · Σ≥32 advances
          </p>
        </section>
      </main>
    </div>
  );
}
