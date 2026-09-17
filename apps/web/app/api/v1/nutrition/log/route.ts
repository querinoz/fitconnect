import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { logFoodConfirmed, listFoodLogs } from "@/lib/nutrition/diary";
import type { MealSlotId } from "@/lib/nutrition/types";

const SLOTS: MealSlotId[] = [
  "breakfast",
  "mid_morning",
  "lunch",
  "pre_workout",
  "during_workout",
  "post_workout",
  "dinner",
  "evening",
  "snack"
];

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const dateISO = url.searchParams.get("date") ?? undefined;
  const logs = await listFoodLogs(auth.user.id, dateISO ?? undefined);
  return NextResponse.json({
    logs,
    note: "User-scoped diary. Coach access requires share_with_coach + authorization."
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (b.confirm !== true) {
    return NextResponse.json(
      {
        error: "confirmation_required",
        message: "Set confirm:true after the athlete explicitly accepts the food log."
      },
      { status: 400 }
    );
  }

  const foodId = typeof b.foodId === "string" ? b.foodId : "";
  const grams = typeof b.grams === "number" ? b.grams : Number(b.grams);
  const dateISO =
    typeof b.dateISO === "string" ? b.dateISO : new Date().toISOString().slice(0, 10);
  const slot =
    typeof b.slot === "string" && SLOTS.includes(b.slot as MealSlotId)
      ? (b.slot as MealSlotId)
      : null;

  const result = await logFoodConfirmed({
    userId: auth.user.id,
    foodId,
    grams,
    slot,
    dateISO,
    confirm: true
  });

  if (!result.ok) {
    const status = result.error === "food_not_found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(
    { ok: true, entry: result.entry, backend: result.backend },
    { status: 201 }
  );
}
