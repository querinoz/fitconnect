"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import {
  catalogIndex,
  getDiscipline,
  listDisciplines,
  WEIGHT_SAFETY_COPY,
  ladderForDiscipline,
  zenithCombatContext
} from "@/lib/combat";
import { CombatDesk } from "@/components/martial-arts/combat-desk";
import type { CombatFamily, MartialArtDiscipline } from "@fitconnect/types";

const FAMILIES: Array<{ id: CombatFamily | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "striking", label: "Striking" },
  { id: "grappling", label: "Grappling" },
  { id: "mixed", label: "Mixed" },
  { id: "traditional_cultural", label: "Traditional / cultural" },
  { id: "self_defense", label: "Self-defence" },
  { id: "internal", label: "Internal" }
];

export function MartialArtsExperience() {
  const [family, setFamily] = useState<CombatFamily | "all">("all");
  const [selectedId, setSelectedId] = useState("boxing");
  const index = catalogIndex();
  const list = useMemo(
    () => listDisciplines(family === "all" ? undefined : { family }),
    [family]
  );
  const selected = getDiscipline(selectedId) ?? list[0];
  const zenith = selected
    ? zenithCombatContext({ disciplineId: selected.id, sessionMode: selected.sessionModes[0] ?? null })
    : null;

  useEffect(() => {
    if (selected && !list.some((d) => d.id === selected.id) && list[0]) {
      setSelectedId(list[0].id);
    }
  }, [list, selected]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-28" data-testid="martial-arts-os">
      <header className="space-y-3">
        <p className="eos-label-caps text-eos-voltline">MARTIAL ARTS OS</p>
        <h1 className="eos-headline text-4xl italic tracking-tight sm:text-6xl">Combat is a first-class sport.</h1>
        <p className="max-w-2xl text-sm text-eos-on-surface-muted">
          Catalog v{index.version} · {index.count} disciplines. Boxing is not Muay Thai. Capoeira is not
          strikes per minute. Force is never inferred from a watch IMU.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FAMILIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFamily(item.id)}
            className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm ${
              family === item.id
                ? "border-eos-voltline bg-eos-voltline text-eos-floor"
                : "border-eos-outline"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section aria-label="Disciplines" className="space-y-2">
          {list.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={`w-full rounded-2xl border p-4 text-left ${
                selected?.id === d.id ? "border-eos-voltline" : "border-eos-outline"
              }`}
              aria-label={d.name}
            >
              <p className="eos-label-caps text-eos-telemetry">{d.family.replace(/_/g, " ")}</p>
              <p className="font-display text-xl">{d.name}</p>
              <p className="text-xs text-eos-on-surface-muted">{d.practiceKinds.join(" · ")}</p>
            </button>
          ))}
        </section>
        {selected ? <DisciplineDetail discipline={selected} zenith={zenith?.briefing ?? ""} /> : null}
      </div>

      <CombatDesk />

      <p className="text-sm text-eos-on-surface-muted">{WEIGHT_SAFETY_COPY}</p>
      <footer className="flex flex-wrap gap-3 text-sm">
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/train?sport=martial_arts">
          Open TRAIN combat
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/recovery">
          Recovery
        </Link>
        <Link className="text-eos-telemetry underline-offset-4 hover:underline" href="/profile">
          Profile
        </Link>
      </footer>
    </div>
  );
}

function DisciplineDetail({
  discipline,
  zenith
}: {
  discipline: MartialArtDiscipline;
  zenith: string;
}) {
  const ladder = ladderForDiscipline(discipline.id);
  return (
    <BentoCard label={discipline.id.toUpperCase()} elevation="2">
      <p className="eos-headline text-4xl">{discipline.name}</p>
      {discipline.unescoIch ? (
        <p className="mt-2 text-sm text-eos-connect">
          UNESCO ICH {discipline.unescoIch.id} ({discipline.unescoIch.year}) — {discipline.unescoIch.title}
        </p>
      ) : null}
      {discipline.culturalNote ? <p className="mt-3 text-sm">{discipline.culturalNote}</p> : null}
      <p className="mt-3 text-sm text-eos-on-surface-muted">{discipline.telemetryNotes}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Contact</dt>
          <dd>{discipline.contactLevel}</dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Rank system</dt>
          <dd>{ladder.notes}</dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Modes</dt>
          <dd>{discipline.sessionModes.slice(0, 8).join(", ")}</dd>
        </div>
        <div>
          <dt className="eos-label-caps text-eos-telemetry">Federations</dt>
          <dd>{discipline.federations.join(", ")}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs uppercase tracking-wider text-eos-on-surface-muted">Rulesets (versioned)</p>
      <ul className="mt-2 space-y-1 text-sm">
        {discipline.rulesets.map((r) => (
          <li key={`${r.id}:${r.version}`}>
            {r.name} · v{r.version} · scoring never from a generic wearable
          </li>
        ))}
      </ul>
      <blockquote className="mt-6 border-l-2 border-eos-iris pl-4 text-sm">{zenith}</blockquote>
    </BentoCard>
  );
}
