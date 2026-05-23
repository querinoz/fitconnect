import type { Sport, Trainer } from "@/lib/data";

export type QuizAnswers = {
  sport?: Sport;
  goal?: string;
  experience?: string;
  schedule?: string;
  modality?: string;
};

function scoreTrainer(trainer: Trainer, answers: QuizAnswers): number {
  let score = 72;
  if (answers.sport && trainer.sports.includes(answers.sport)) score += 18;
  if (answers.modality && trainer.modality === answers.modality) score += 6;
  if (answers.modality === "hybrid" && trainer.modality === "hybrid") score += 4;
  if (answers.experience === "advanced" && trainer.years >= 8) score += 4;
  if (answers.experience === "beginner" && trainer.retentionRate >= 0.9) score += 3;
  if (answers.schedule === "4+" && trainer.responseTime.includes("hour")) score += 2;
  score += Math.min(8, Math.round(trainer.rating * 1.5));
  return Math.min(99, score);
}

export type CoachMatch = {
  trainer: Trainer;
  compatibility: number;
};

export function matchCoaches(
  trainers: Trainer[],
  answers: QuizAnswers,
  limit = 3
): CoachMatch[] {
  const ranked = trainers
    .map((trainer) => ({
      trainer,
      compatibility: scoreTrainer(trainer, answers)
    }))
    .sort((a, b) => b.compatibility - a.compatibility);

  const sportMatches = answers.sport
    ? ranked.filter((m) => m.trainer.sports.includes(answers.sport!))
    : ranked;

  const pool = sportMatches.length >= limit ? sportMatches : ranked;
  return pool.slice(0, limit);
}
