export type HistoryOrigin = "WATCH" | "PHONE" | "CLOUD";

export type HistoryRow = {
  date: string;
  sport: string;
  duration: string;
  origin: HistoryOrigin;
  tss: number;
};

/** LOCAL_DEMO series only. Undefined physiology stays omitted — never coerce to 0. */
export const INSIGHTS_HISTORY: HistoryRow[] = [
  { date: "2026-08-16", sport: "Run", duration: "00:42:11", origin: "WATCH", tss: 58 },
  { date: "2026-08-14", sport: "Strength", duration: "00:51:02", origin: "PHONE", tss: 41 },
  { date: "2026-08-12", sport: "Ride", duration: "01:18:44", origin: "PHONE", tss: 72 },
  { date: "2026-08-10", sport: "Run", duration: "00:36:08", origin: "WATCH", tss: 49 },
  { date: "2026-08-07", sport: "Strength", duration: "00:47:20", origin: "PHONE", tss: 38 },
  { date: "2026-08-05", sport: "Run", duration: "00:55:03", origin: "CLOUD", tss: 66 },
  { date: "2026-08-02", sport: "Ride", duration: "02:04:19", origin: "PHONE", tss: 91 },
  { date: "2026-07-30", sport: "Run", duration: "00:28:40", origin: "WATCH", tss: 33 }
];

export const CTL_POINTS = "40,140 90,132 140,136 190,124 240,116 290,120 340,104 390,96 440,100 490,88 540,92 590,84";
export const ATL_POINTS = "40,156 90,100 140,144 190,72 240,128 290,152 340,80 390,116 440,140 490,68 540,108 590,132";
export const SQUAT_POINTS = "40,160 120,150 200,148 280,132 360,128 440,118 520,110 600,96";
export const BENCH_POINTS = "40,168 120,160 200,154 280,148 360,142 440,136 520,128 600,122";
export const DEADLIFT_POINTS = "40,170 120,162 200,156 280,146 360,138 440,128 520,118 600,108";
export const HRV_POINTS = "20,120 80,132 140,90 200,140 260,110 320,150 380,100 440,128 500,88 560,118 620,96";

export function historyToCsv(rows: HistoryRow[]): string {
  const header = "date,sport,duration,origin,tss";
  const body = rows.map((r) => [r.date, r.sport, r.duration, r.origin, String(r.tss)].join(","));
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
