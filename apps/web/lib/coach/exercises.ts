export type ExerciseCategory =
  | "Strength"
  | "Cardio"
  | "Mobility"
  | "Sport-Specific"
  | "Recovery";

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscles: string;
  equipment: string;
};

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: "ex-1", name: "Back squat", category: "Strength", muscles: "Quads, glutes", equipment: "Barbell" },
  { id: "ex-2", name: "Romanian deadlift", category: "Strength", muscles: "Hamstrings", equipment: "Barbell" },
  { id: "ex-3", name: "Bench press", category: "Strength", muscles: "Chest, triceps", equipment: "Barbell" },
  { id: "ex-4", name: "Pull-up", category: "Strength", muscles: "Lats, biceps", equipment: "Bodyweight" },
  { id: "ex-5", name: "Bulgarian split squat", category: "Strength", muscles: "Quads", equipment: "Dumbbells" },
  { id: "ex-6", name: "Tempo run", category: "Cardio", muscles: "Aerobic system", equipment: "Track" },
  { id: "ex-7", name: "Threshold intervals", category: "Cardio", muscles: "Aerobic power", equipment: "Road" },
  { id: "ex-8", name: "Z2 base ride", category: "Cardio", muscles: "Aerobic base", equipment: "Bike" },
  { id: "ex-9", name: "Hip mobility flow", category: "Mobility", muscles: "Hips", equipment: "Mat" },
  { id: "ex-10", name: "Thoracic opener", category: "Mobility", muscles: "Upper back", equipment: "Foam roller" },
  { id: "ex-11", name: "Surf pop-ups", category: "Sport-Specific", muscles: "Core, shoulders", equipment: "Board" },
  { id: "ex-12", name: "BJJ shrimping", category: "Sport-Specific", muscles: "Hips, core", equipment: "Mat" },
  { id: "ex-13", name: "Active recovery walk", category: "Recovery", muscles: "Full body", equipment: "None" },
  { id: "ex-14", name: "Breathwork reset", category: "Recovery", muscles: "Parasympathetic", equipment: "None" }
];

export const PLAN_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type PlanDay = (typeof PLAN_DAYS)[number];
