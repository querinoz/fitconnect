import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ReadinessTelemetry = {
  readinessPercent: number;
  hrvMs: number;
  load: number;
  sleepLabel?: string;
};

export type EliteReadinessNeumorphicProps = HTMLAttributes<HTMLDivElement> & {
  telemetry: ReadinessTelemetry;
  athleteLabel?: string;
};

function statusTone(value: number, optimalMax: number) {
  if (value <= optimalMax) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  return "text-amber-400 bg-amber-500/10 border-amber-500/25";
}

/**
 * OLED-dark neumorphic readiness panel.
 * Convex readiness index + concave biometric well; WCAG via explicit text tokens and 1px rims.
 */
export function EliteReadinessNeumorphic({
  className,
  telemetry,
  athleteLabel,
  ...props
}: EliteReadinessNeumorphicProps) {
  const { readinessPercent, hrvMs, load, sleepLabel = "7h 18m" } = telemetry;

  return (
    <div
      className={cn("bg-eos-floor text-eos-neu-primary font-mono", className)}
      {...props}
    >
      {athleteLabel ? (
        <p className="mb-4 text-[10px] uppercase tracking-widest text-eos-neu-muted">
          {`// ATLETA_CONECTADO: ${athleteLabel}`}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section
          aria-label="Índice de prontidão"
          className="shadow-eos-convex flex aspect-square flex-col justify-between rounded-2xl p-6"
        >
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-eos-neu-muted">
              {"// SYSTEM.PRONTIDÃO"}
            </p>
            <h2 className="text-xs font-bold tracking-wider text-eos-neu-primary">
              ÍNDICE_PRONTIDÃO
            </h2>
          </div>
          <div className="flex flex-col items-center">
            <span
              className="text-6xl font-black tracking-tighter text-eos-voltline"
              aria-live="polite"
            >
              {readinessPercent}%
            </span>
            <span className="mt-2 rounded border border-eos-voltline/20 bg-eos-voltline/10 px-2 py-0.5 text-[10px] text-eos-voltline">
              OPTIMAL READY STATE
            </span>
          </div>
        </section>

        <section
          aria-label="Telemetria biométrica"
          className="shadow-eos-concave flex flex-col justify-between rounded-2xl p-6 md:col-span-2"
        >
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-eos-neu-muted">
              {"// BIOMETRIC_LOG"}
            </p>
            <h2 className="text-xs font-bold tracking-wider text-eos-neu-primary">
              TELEMETRY_STREAM
            </h2>
          </div>

          <dl className="my-auto space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
              <dt className="text-xs text-eos-neu-muted">Variação de HRV</dt>
              <dd className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-eos-neu-primary">{hrvMs} ms</span>
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px]",
                    statusTone(hrvMs, 70)
                  )}
                >
                  NORMAL
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
              <dt className="text-xs text-eos-neu-muted">Carga do Treino</dt>
              <dd className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-eos-neu-primary">
                  {load.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px]",
                    statusTone(load, 0.9)
                  )}
                >
                  OPTIMAL
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between pb-2">
              <dt className="text-xs text-eos-neu-muted">Regeneração do Sono</dt>
              <dd className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-eos-neu-primary">{sleepLabel}</span>
                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                  RESTED
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
