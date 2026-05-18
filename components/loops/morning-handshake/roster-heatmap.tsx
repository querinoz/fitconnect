import { cn } from "@/lib/utils";

type Athlete = { id: string; name: string; readiness: number; hrvDelta: number };

function tone(r: number): string {
  if (r >= 65) return "bg-volt-500/90 text-ink-950";
  if (r >= 40) return "bg-amber-400/90 text-ink-950";
  return "bg-coral-500/90 text-ink-50";
}

export function RosterHeatmap({
  athletes,
  onSelect
}: {
  athletes: Athlete[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {athletes.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            aria-label={`${a.name}, readiness ${a.readiness}`}
            onClick={() => onSelect(a.id)}
            className={cn(
              "w-full aspect-square rounded-2xl p-3 text-left transition-all hover:-translate-y-0.5",
              tone(a.readiness)
            )}
          >
            <p className="text-xs font-extrabold uppercase truncate">{a.name}</p>
            <p className="text-3xl font-black mt-2">{a.readiness}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              HRV {a.hrvDelta > 0 ? "+" : ""}
              {a.hrvDelta}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
