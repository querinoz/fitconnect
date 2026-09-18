import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { lookupFoods } from "@/lib/nutrition/sources/food-lookup";

/**
 * Athlete food search — server-side adapters only.
 * Never logs food; logging requires POST /nutrition/log with confirm:true.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const barcode = url.searchParams.get("barcode")?.trim() || undefined;
  const foodId = url.searchParams.get("foodId")?.trim() || undefined;
  const locale = url.searchParams.get("locale")?.trim() || "pt-PT";

  if (!query && !barcode && !foodId) {
    return NextResponse.json(
      { error: "query_required", message: "Provide q, barcode, or foodId." },
      { status: 400 }
    );
  }

  try {
    const looked = await lookupFoods({ query: query || undefined, barcode, foodId, locale });
    return NextResponse.json({
      foods: looked.foods,
      state: looked.state,
      sourcesQueried: looked.sourcesQueried,
      note: looked.note,
      bySource: looked.bySource
    });
  } catch {
    return NextResponse.json(
      { error: "lookup_failed", foods: [], state: "ERROR" },
      { status: 500 }
    );
  }
}
