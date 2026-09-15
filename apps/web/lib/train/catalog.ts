import type { TrainExercise, TrainPlan, TrainSlot } from "./types";

function ex(partial: TrainExercise): TrainExercise {
  return partial;
}

const bench: TrainExercise = ex({
  exerciseId: "ex_bench_press",
  name: "Barbell bench press",
  mode: "reps",
  weighted: true,
  targetSets: 3,
  targetRepsMin: 6,
  targetRepsMax: 8,
  targetLoadKg: 60,
  targetTimeSec: null,
  restSec: 90,
  tempo: "3-1-1",
  notes: "Stop one rep before form breaks. Do not chase a fabricated PR.",
  muscles: ["chest", "triceps", "shoulders"],
  instructions: "Plant feet, lower the bar to mid-chest, press without bouncing.",
  substitutions: ["ex_push_up", "ex_dumbbell_press"]
});

const row: TrainExercise = ex({
  exerciseId: "ex_dumbbell_row",
  name: "Dumbbell row",
  mode: "reps",
  weighted: true,
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 10,
  targetLoadKg: 22.5,
  targetTimeSec: null,
  restSec: 75,
  notes: "Keep the torso quiet. Pull to the hip, not the neck.",
  muscles: ["back", "biceps"],
  instructions: "Hinge, square the hips, row the dumbbell to the hip pocket.",
  substitutions: ["ex_inverted_row"]
});

const pushUp: TrainExercise = ex({
  exerciseId: "ex_push_up",
  name: "Push-up",
  mode: "bodyweight",
  weighted: false,
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 12,
  targetLoadKg: null,
  targetTimeSec: null,
  restSec: 60,
  notes: "Elevate hands if the floor version fails quality.",
  muscles: ["chest", "triceps", "core"],
  instructions: "Body in one line. Chest to a fist-height above the floor.",
  substitutions: ["ex_knee_push_up"]
});

const lunge: TrainExercise = ex({
  exerciseId: "ex_reverse_lunge",
  name: "Reverse lunge",
  mode: "reps",
  weighted: true,
  targetSets: 2,
  targetRepsMin: 8,
  targetRepsMax: 8,
  targetLoadKg: 16,
  targetTimeSec: null,
  restSec: 60,
  notes: "Count each side. Knee tracks over mid-foot.",
  muscles: ["quads", "glutes"],
  instructions: "Step back, drop the rear knee, drive through the front heel.",
  substitutions: ["ex_split_squat"]
});

const plank: TrainExercise = ex({
  exerciseId: "ex_plank",
  name: "Plank",
  mode: "time",
  weighted: false,
  targetSets: 2,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 30,
  restSec: 30,
  notes: "Quality brace over clock-chasing.",
  muscles: ["core"],
  instructions: "Ribs down, glutes on, neck long. Breathe behind the brace.",
  substitutions: ["ex_dead_bug"]
});

const jumpRope: TrainExercise = ex({
  exerciseId: "ex_jump_rope",
  name: "Jump rope",
  mode: "time",
  weighted: false,
  targetSets: 3,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 45,
  restSec: 45,
  notes: "No rope? Shadow bounce in place.",
  muscles: ["calves", "shoulders"],
  instructions: "Quiet landings, elbows in, wrists turn the rope.",
  substitutions: ["ex_march_in_place"]
});

const squat: TrainExercise = ex({
  exerciseId: "ex_goblet_squat",
  name: "Goblet squat",
  mode: "reps",
  weighted: true,
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 10,
  targetLoadKg: 16,
  targetTimeSec: null,
  restSec: 75,
  notes: "Depth you can own. Heels stay down.",
  muscles: ["quads", "glutes"],
  instructions: "Hold the load at the chest, sit between the heels, stand tall.",
  substitutions: ["ex_sit_to_stand"]
});

const hinge: TrainExercise = ex({
  exerciseId: "ex_rdl",
  name: "Romanian deadlift",
  mode: "reps",
  weighted: true,
  targetSets: 3,
  targetRepsMin: 6,
  targetRepsMax: 8,
  targetLoadKg: 40,
  targetTimeSec: null,
  restSec: 90,
  notes: "Soft knees. Feel hamstrings, not the low back.",
  muscles: ["hamstrings", "glutes"],
  instructions: "Push hips back, keep the bar close, stop when the back wants to round.",
  substitutions: ["ex_hip_hinge"]
});

const easyRun: TrainExercise = ex({
  exerciseId: "ex_easy_run",
  name: "Easy run",
  mode: "time",
  weighted: false,
  targetSets: 1,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 1500,
  restSec: 0,
  notes: "Conversational pace. Heart rate is shown only if a device is connected.",
  muscles: ["legs", "aerobic"],
  instructions: "Settle into a rhythm you could hold while speaking full sentences.",
  substitutions: ["ex_brisk_walk"]
});

const strides: TrainExercise = ex({
  exerciseId: "ex_strides",
  name: "Strides",
  mode: "time",
  weighted: false,
  targetSets: 4,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 20,
  restSec: 40,
  notes: "Fast but not a sprint. Walk back to recover.",
  muscles: ["legs"],
  instructions: "Build for 20 seconds, stay tall, then walk until breathing settles.",
  substitutions: ["ex_brisk_walk"]
});

const cycleTempo: TrainExercise = ex({
  exerciseId: "ex_cycle_tempo",
  name: "Seated tempo",
  mode: "time",
  weighted: false,
  targetSets: 3,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 360,
  restSec: 90,
  notes: "Indoor or outdoor. Power/HR appear only from a connected source.",
  muscles: ["quads", "aerobic"],
  instructions: "Smooth cadence. Hard enough to speak short phrases, not sentences.",
  substitutions: ["ex_easy_spin"]
});

const breath: TrainExercise = ex({
  exerciseId: "ex_box_breath",
  name: "Box breathing",
  mode: "time",
  weighted: false,
  targetSets: 4,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 60,
  restSec: 0,
  notes: "Guidance only — this is not a measured recovery score.",
  muscles: ["parasympathetic"],
  instructions: "Inhale 4, hold 4, exhale 4, hold 4. Sit or lie down.",
  substitutions: ["ex_walk_down"]
});

const hipOpen: TrainExercise = ex({
  exerciseId: "ex_world_greatest",
  name: "World's greatest stretch",
  mode: "reps",
  weighted: false,
  targetSets: 2,
  targetRepsMin: 5,
  targetRepsMax: 5,
  targetLoadKg: null,
  targetTimeSec: null,
  restSec: 20,
  notes: "Move slowly. Stop at a stretch, not a strain.",
  muscles: ["hips", "thoracic"],
  instructions: "Long lunge, rotate the lead elbow toward the floor then open to the sky.",
  substitutions: ["ex_hip_flexor"]
});

const hiitBurst: TrainExercise = ex({
  exerciseId: "ex_hiit_burst",
  name: "Work interval",
  mode: "time",
  weighted: false,
  targetSets: 6,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 30,
  restSec: 30,
  notes: "Choose bike, row, run, or bodyweight. Intensity is planned, not guessed from fake HR.",
  muscles: ["full-body"],
  instructions: "30 seconds strong, 30 seconds easy. Stay in control of mechanics.",
  substitutions: ["ex_march_in_place"]
});

const shadowBox: TrainExercise = ex({
  exerciseId: "ex_shadow_box",
  name: "Shadow boxing rounds",
  mode: "time",
  weighted: false,
  targetSets: 3,
  targetRepsMin: 0,
  targetRepsMax: 0,
  targetLoadKg: null,
  targetTimeSec: 120,
  restSec: 60,
  notes: "Hands up, chin down. This is skill + conditioning, not sparring.",
  muscles: ["shoulders", "core"],
  instructions: "Jab, cross, slip. Stay light on the feet for two minutes.",
  substitutions: ["ex_march_in_place"]
});

export const TRAIN_PLANS: TrainPlan[] = [
  {
    id: "plan_upper_push_v2",
    title: "Upper strength",
    purpose: "Build pressing and pulling strength with honest set logging.",
    outcome: "Logged upper-body volume and a rest-managed session — energy is not estimated.",
    durationMin: 42,
    difficulty: "hard",
    equipment: ["barbell", "dumbbells", "bench"],
    location: "gym",
    sport: "strength",
    goal: "strength",
    plannedIntensity: "high",
    trainingType: "strength",
    muscleGroups: ["chest", "back", "shoulders"],
    structure: ["Main press", "Superset row + push-up", "Lunge accessory", "Brace + skip"],
    zenithNote:
      "This is the bundled strength plan. Intensity is programmed, not adapted, until recovery data exists.",
    exercises: [bench, row, pushUp, lunge, plank, jumpRope]
  },
  {
    id: "plan_lower_strength_v1",
    title: "Lower strength",
    purpose: "Square the lower body: squat, hinge, lunge.",
    outcome: "Three lower patterns logged with rest you control.",
    durationMin: 38,
    difficulty: "hard",
    equipment: ["dumbbells", "barbell"],
    location: "gym",
    sport: "strength",
    goal: "strength",
    plannedIntensity: "high",
    trainingType: "strength",
    muscleGroups: ["quads", "glutes", "hamstrings"],
    structure: ["Squat", "Hinge", "Lunge", "Brace"],
    zenithNote: "Keep loads you can own for every prescribed rep. Do not invent a previous PR.",
    exercises: [squat, hinge, lunge, plank]
  },
  {
    id: "plan_hypertrophy_push_v1",
    title: "Hypertrophy push",
    purpose: "Accumulate chest and triceps volume at controlled rest.",
    outcome: "Higher-rep pressing without fabricating pump metrics.",
    durationMin: 35,
    difficulty: "moderate",
    equipment: ["barbell", "floor"],
    location: "gym",
    sport: "hypertrophy",
    goal: "hypertrophy",
    plannedIntensity: "moderate",
    trainingType: "hypertrophy",
    muscleGroups: ["chest", "triceps"],
    structure: ["Primary press", "Push-up density", "Plank finisher"],
    zenithNote: "Rest is part of the dose. Skipping every rest shortens the session, not the stimulus.",
    exercises: [
      { ...bench, targetSets: 4, targetRepsMin: 8, targetRepsMax: 10, restSec: 75 },
      { ...pushUp, targetSets: 3, restSec: 45 },
      { ...plank, targetSets: 2, targetTimeSec: 40 }
    ]
  },
  {
    id: "plan_easy_endurance_v1",
    title: "Aerobic easy run",
    purpose: "Time-on-feet at conversational effort.",
    outcome: "Completed endurance minutes. Pace/HR stay blank without a device.",
    durationMin: 32,
    difficulty: "moderate",
    equipment: ["none"],
    location: "outdoor",
    sport: "running",
    goal: "endurance",
    plannedIntensity: "moderate",
    trainingType: "endurance",
    muscleGroups: ["legs", "aerobic"],
    structure: ["Easy continuous", "Optional strides"],
    zenithNote: "No live pace is invented. If GPS is off, this is still a valid timed session.",
    exercises: [easyRun, strides]
  },
  {
    id: "plan_cycle_tempo_v1",
    title: "Cycling tempo",
    purpose: "Three seated tempo blocks with honest rest.",
    outcome: "Completed bike work. Watts appear only from a connected meter.",
    durationMin: 28,
    difficulty: "moderate",
    equipment: ["bike"],
    location: "home",
    sport: "cycling",
    goal: "endurance",
    plannedIntensity: "moderate",
    trainingType: "endurance",
    muscleGroups: ["quads", "aerobic"],
    structure: ["Tempo", "Recover", "Tempo"],
    zenithNote: "Cadence and power stay unavailable until a trainer or head unit is connected.",
    exercises: [cycleTempo]
  },
  {
    id: "plan_hiit_v1",
    title: "HIIT conditioner",
    purpose: "Short work/rest waves you can finish with quality.",
    outcome: "Six logged intervals. Heart-rate zones stay hidden without telemetry.",
    durationMin: 18,
    difficulty: "hard",
    equipment: ["none"],
    location: "home",
    sport: "hiit",
    goal: "conditioning",
    plannedIntensity: "peak",
    trainingType: "conditioning",
    muscleGroups: ["full-body"],
    structure: ["30/30 waves"],
    zenithNote: "This is planned peak work. If recovery data later says otherwise, we will say so — we will not fake it now.",
    exercises: [hiitBurst]
  },
  {
    id: "plan_mobility_v1",
    title: "Mobility restore",
    purpose: "Hips and trunk without loading a tired nervous system.",
    outcome: "Completed mobility minutes. Not a readiness score.",
    durationMin: 16,
    difficulty: "easy",
    equipment: ["none"],
    location: "home",
    sport: "mobility",
    goal: "mobility",
    plannedIntensity: "recover",
    trainingType: "mobility",
    muscleGroups: ["hips", "thoracic"],
    structure: ["Open", "Brace"],
    zenithNote: "Choose this when you want to move without a high-intensity claim.",
    exercises: [hipOpen, plank]
  },
  {
    id: "plan_recovery_v1",
    title: "Restore session",
    purpose: "Downshift with breathing and an easy brace.",
    outcome: "A completed restore block. No HRV is inferred from this.",
    durationMin: 12,
    difficulty: "easy",
    equipment: ["none"],
    location: "home",
    sport: "recovery",
    goal: "recovery",
    plannedIntensity: "restore",
    trainingType: "recovery",
    muscleGroups: ["parasympathetic"],
    structure: ["Breath", "Easy brace"],
    zenithNote: "Breathing cues are optional guidance, not a biometric observation.",
    exercises: [breath, { ...plank, targetSets: 1, targetTimeSec: 20, restSec: 0 }]
  },
  {
    id: "plan_combat_v1",
    title: "Combat conditioner",
    purpose: "Shadow-boxing rounds for athletes who want sport-specific work.",
    outcome: "Three skill rounds logged. Contact sparring is out of scope.",
    durationMin: 14,
    difficulty: "moderate",
    equipment: ["none"],
    location: "home",
    sport: "sport",
    goal: "conditioning",
    plannedIntensity: "high",
    trainingType: "sport-specific",
    muscleGroups: ["shoulders", "core"],
    structure: ["Round", "Rest", "Round"],
    zenithNote: "Keep the chin tucked. This is not a fight, and we will not invent strike power.",
    exercises: [shadowBox]
  },
  {
    id: "plan_home_full_v1",
    title: "Home full-body",
    purpose: "Minimal kit: push, squat, brace, skip.",
    outcome: "A complete session you can run offline.",
    durationMin: 24,
    difficulty: "moderate",
    equipment: ["none"],
    location: "home",
    sport: "conditioning",
    goal: "conditioning",
    plannedIntensity: "moderate",
    trainingType: "conditioning",
    muscleGroups: ["full-body"],
    structure: ["Push", "Squat", "Brace", "Skip"],
    zenithNote: "Equipment-free on purpose. Substitute any movement you cannot perform.",
    exercises: [pushUp, { ...squat, weighted: false, targetLoadKg: null }, plank, jumpRope]
  }
];

export const TRAIN_FILTERS = {
  sports: [
    "strength",
    "hypertrophy",
    "endurance",
    "running",
    "cycling",
    "hiit",
    "mobility",
    "recovery",
    "conditioning",
    "sport"
  ] as const,
  durations: [15, 25, 35, 45] as const,
  difficulties: ["easy", "moderate", "hard"] as const,
  locations: ["gym", "home", "outdoor", "pool"] as const
};

export function getTrainPlan(id: string): TrainPlan | undefined {
  return TRAIN_PLANS.find((plan) => plan.id === id);
}

export function buildSlots(plan: TrainPlan): TrainSlot[] {
  const slots: TrainSlot[] = [];
  for (const exercise of plan.exercises) {
    for (let setNumber = 1; setNumber <= exercise.targetSets; setNumber += 1) {
      slots.push({
        slotIndex: slots.length,
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        setNumber,
        targetSets: exercise.targetSets,
        mode: exercise.mode,
        weighted: exercise.weighted,
        targetRepsMin: exercise.targetRepsMin,
        targetRepsMax: exercise.targetRepsMax,
        targetLoadKg: exercise.targetLoadKg,
        targetTimeSec: exercise.targetTimeSec,
        restSec: setNumber === exercise.targetSets ? Math.max(0, exercise.restSec) : exercise.restSec,
        notes: exercise.notes,
        muscles: exercise.muscles,
        instructions: exercise.instructions,
        substitutions: exercise.substitutions,
        tempo: exercise.tempo
      });
    }
  }
  return slots;
}

export const SUBSTITUTE_LIBRARY: TrainExercise[] = [
  {
    exerciseId: "ex_dumbbell_press",
    name: "Dumbbell bench press",
    mode: "reps",
    weighted: true,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    targetLoadKg: 22.5,
    targetTimeSec: null,
    restSec: 75,
    notes: "Neutral wrists. Same intent as the bench — no invented load history.",
    muscles: ["chest", "triceps"],
    instructions: "Lower the bells to mid-chest, press until elbows finish without shrugging.",
    substitutions: ["ex_push_up"]
  },
  {
    exerciseId: "ex_inverted_row",
    name: "Inverted row",
    mode: "bodyweight",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 60,
    notes: "Table or bar. Shorten the lever if you cannot keep a line.",
    muscles: ["back", "biceps"],
    instructions: "Body straight, pull the chest to the bar, lower with control.",
    substitutions: ["ex_dumbbell_row"]
  },
  {
    exerciseId: "ex_knee_push_up",
    name: "Knee push-up",
    mode: "bodyweight",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 45,
    notes: "Still a full-range press. Do not bounce the chest.",
    muscles: ["chest", "triceps"],
    instructions: "Knees down, ribs closed, chest to a fist above the floor.",
    substitutions: ["ex_push_up"]
  },
  {
    exerciseId: "ex_split_squat",
    name: "Split squat",
    mode: "reps",
    weighted: false,
    targetSets: 2,
    targetRepsMin: 8,
    targetRepsMax: 8,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 60,
    notes: "Stationary stance. Count each side.",
    muscles: ["quads", "glutes"],
    instructions: "Long stance, drop the rear knee, keep the front heel down.",
    substitutions: ["ex_reverse_lunge"]
  },
  {
    exerciseId: "ex_dead_bug",
    name: "Dead bug",
    mode: "reps",
    weighted: false,
    targetSets: 2,
    targetRepsMin: 6,
    targetRepsMax: 8,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 20,
    notes: "Opposite arm/leg. Low back stays heavy.",
    muscles: ["core"],
    instructions: "Exhale as the limbs reach long, keep the ribs down.",
    substitutions: ["ex_plank"]
  },
  {
    exerciseId: "ex_march_in_place",
    name: "March in place",
    mode: "time",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 0,
    targetRepsMax: 0,
    targetLoadKg: null,
    targetTimeSec: 45,
    restSec: 20,
    notes: "Use this when rope, bike, or impact is unavailable.",
    muscles: ["legs"],
    instructions: "Tall posture, drive the knee, quiet feet.",
    substitutions: ["ex_jump_rope"]
  },
  {
    exerciseId: "ex_sit_to_stand",
    name: "Sit-to-stand",
    mode: "reps",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 45,
    notes: "Chair height you can own. No bounce off the seat.",
    muscles: ["quads", "glutes"],
    instructions: "Sit with control, stand without using momentum from the hands if you can.",
    substitutions: ["ex_goblet_squat"]
  },
  {
    exerciseId: "ex_hip_hinge",
    name: "Bodyweight hip hinge",
    mode: "reps",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    targetLoadKg: null,
    targetTimeSec: null,
    restSec: 45,
    notes: "Pattern first. Load later.",
    muscles: ["hamstrings", "glutes"],
    instructions: "Soft knees, hips back, long spine, stand by squeezing the glutes.",
    substitutions: ["ex_rdl"]
  },
  {
    exerciseId: "ex_brisk_walk",
    name: "Brisk walk",
    mode: "time",
    weighted: false,
    targetSets: 1,
    targetRepsMin: 0,
    targetRepsMax: 0,
    targetLoadKg: null,
    targetTimeSec: 1200,
    restSec: 0,
    notes: "Valid substitute when running is not an option.",
    muscles: ["legs", "aerobic"],
    instructions: "Purposeful walk. Arms swing. No fake pace overlay.",
    substitutions: ["ex_easy_run"]
  },
  {
    exerciseId: "ex_easy_spin",
    name: "Easy spin",
    mode: "time",
    weighted: false,
    targetSets: 3,
    targetRepsMin: 0,
    targetRepsMax: 0,
    targetLoadKg: null,
    targetTimeSec: 360,
    restSec: 60,
    notes: "Use when tempo is too much today.",
    muscles: ["quads"],
    instructions: "Light gear, smooth cadence, nasal breathing if you can.",
    substitutions: ["ex_cycle_tempo"]
  },
  {
    exerciseId: "ex_walk_down",
    name: "Easy walk-down",
    mode: "time",
    weighted: false,
    targetSets: 1,
    targetRepsMin: 0,
    targetRepsMax: 0,
    targetLoadKg: null,
    targetTimeSec: 240,
    restSec: 0,
    notes: "Move the legs if seated breathing is not comfortable.",
    muscles: ["legs"],
    instructions: "Slow walk, drop the shoulders, longer exhale than inhale.",
    substitutions: ["ex_box_breath"]
  },
  {
    exerciseId: "ex_hip_flexor",
    name: "Half-kneeling hip flexor",
    mode: "time",
    weighted: false,
    targetSets: 2,
    targetRepsMin: 0,
    targetRepsMax: 0,
    targetLoadKg: null,
    targetTimeSec: 40,
    restSec: 10,
    notes: "Posterior tilt, not a backbend.",
    muscles: ["hips"],
    instructions: "Kneel, squeeze the rear glute, shift forward until you feel the hip, not the lumbar.",
    substitutions: ["ex_world_greatest"]
  }
];

export function findExercise(plan: TrainPlan, exerciseId: string): TrainExercise | undefined {
  return plan.exercises.find((item) => item.exerciseId === exerciseId);
}

export function findAnyExercise(exerciseId: string): TrainExercise | undefined {
  return (
    TRAIN_PLANS.flatMap((item) => item.exercises).find((item) => item.exerciseId === exerciseId) ??
    SUBSTITUTE_LIBRARY.find((item) => item.exerciseId === exerciseId)
  );
}

export function substituteExercise(plan: TrainPlan, fromId: string, toId: string): TrainPlan {
  const original = findExercise(plan, fromId);
  const replacement = findAnyExercise(toId) ?? original;
  if (!original || !replacement || original.exerciseId === replacement.exerciseId) return plan;
  return {
    ...plan,
    exercises: plan.exercises.map((item) =>
      item.exerciseId === fromId
        ? {
            ...replacement,
            targetSets: original.targetSets,
            restSec: original.restSec
          }
        : item
    )
  };
}

export function filterPlans(input: {
  sport?: string;
  goal?: string;
  difficulty?: string;
  location?: string;
  equipment?: string;
  maxDuration?: number;
  intensity?: string;
  muscle?: string;
}): TrainPlan[] {
  return TRAIN_PLANS.filter((plan) => {
    if (input.sport && input.sport !== "all" && plan.sport !== input.sport) return false;
    if (input.goal && input.goal !== "all" && plan.goal !== input.goal) return false;
    if (input.difficulty && input.difficulty !== "all" && plan.difficulty !== input.difficulty) {
      return false;
    }
    if (input.location && input.location !== "all" && plan.location !== input.location) return false;
    if (input.maxDuration && plan.durationMin > input.maxDuration) return false;
    if (input.intensity && input.intensity !== "all" && plan.plannedIntensity !== input.intensity) {
      return false;
    }
    if (input.muscle && !plan.muscleGroups.includes(input.muscle)) return false;
    if (input.equipment && input.equipment !== "all") {
      if (input.equipment === "none") {
        return plan.equipment.length === 1 && plan.equipment[0] === "none";
      }
      if (!plan.equipment.includes(input.equipment)) return false;
    }
    return true;
  });
}
