import type { Program } from "@/lib/data";
import { PROGRAMS, TRAINERS } from "@/lib/data";

export type ProgramWeekBlock = {
  week: number;
  focus: string;
  sessions: string[];
};

export type SampleWorkout = {
  title: string;
  duration: string;
  blocks: { name: string; detail: string }[];
};

export function getProgramById(id: string) {
  return PROGRAMS.find((p) => p.id === id);
}

export function getProgramCoach(program: Program) {
  return TRAINERS.find((t) => t.id === program.trainerId);
}

export function getProgramWeekPreview(): ProgramWeekBlock[] {
  const base = [
    { focus: "Foundation & movement quality", sessions: ["Technique audit", "Base volume", "Mobility reset"] },
    { focus: "Progressive overload", sessions: ["Primary lift A", "Accessory density", "Recovery flush"] },
    { focus: "Intensity block", sessions: ["Threshold work", "Coach check-in", "Deload primer"] }
  ];
  return base.map((b, i) => ({ week: i + 1, ...b }));
}

export function getSampleWorkout(program: Program): SampleWorkout {
  if (program.sport === "Running") {
    return {
      title: "Tempo + strides",
      duration: "55 min",
      blocks: [
        { name: "Warm-up", detail: "15 min Z2 + drills" },
        { name: "Main set", detail: "3 × 8 min @ threshold, 2 min float" },
        { name: "Strides", detail: "4 × 20 s @ 90% with full walk-back" },
        { name: "Cool-down", detail: "10 min Z1 + breathwork" }
      ]
    };
  }
  return {
    title: "Strength session A",
    duration: "60 min",
    blocks: [
      { name: "Activation", detail: "Band work + bracing prep" },
      { name: "Primary", detail: "Back squat 4 × 5 @ RPE 7" },
      { name: "Secondary", detail: "RDL 3 × 8 controlled tempo" },
      { name: "Finisher", detail: "Core carry 3 × 40 m" }
    ]
  };
}

export function programReviewMetrics(program: Program) {
  const samples: Record<string, string> = {
    "p-iron-arc": "Added +28 kg total",
    "p-sub-3-marathon": "PB 2:58:41",
    "p-surf-foundation": "First green wave in 6 weeks"
  };
  return samples[program.id] ?? `Completed ${program.weeks}-week block`;
}
