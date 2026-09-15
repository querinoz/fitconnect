import { NextResponse } from "next/server";
import { catalogIndex, getDiscipline, listDisciplines } from "@/lib/combat";

/** Public catalog — no secrets, no invented athlete stats. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const discipline = getDiscipline(id);
    if (!discipline) {
      return NextResponse.json({ error: "unknown_discipline" }, { status: 404 });
    }
    return NextResponse.json({
      sport: "MARTIAL_ARTS",
      catalogVersion: catalogIndex().version,
      discipline
    });
  }
  const family = url.searchParams.get("family") as
    | "striking"
    | "grappling"
    | "mixed"
    | "traditional_cultural"
    | "self_defense"
    | "internal"
    | null;
  return NextResponse.json({
    ...catalogIndex(),
    disciplines: listDisciplines(family ? { family } : undefined)
  });
}
