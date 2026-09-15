import type { RankSystemId } from "@fitconnect/types";
import { getDiscipline } from "./taxonomy";

export type RankLadder = {
  system: RankSystemId;
  ranks: string[];
  notes: string;
};

export const RANK_LADDERS: Record<RankSystemId, RankLadder> = {
  none: { system: "none", ranks: [], notes: "This discipline has no universal rank ladder in FitConnect." },
  boxing_none: {
    system: "boxing_none",
    ranks: [],
    notes: "Boxing uses amateur class / professional record, not belts."
  },
  wrestling_none: {
    system: "wrestling_none",
    ranks: [],
    notes: "Olympic wrestling uses age/weight class, not colored belts."
  },
  bjj_ibjjf: {
    system: "bjj_ibjjf",
    ranks: ["white", "blue", "purple", "brown", "black"],
    notes: "Adult IBJJF gi belt order. Promotions are coach/federation confirmed — never auto-awarded."
  },
  judo_kyu_dan: {
    system: "judo_kyu_dan",
    ranks: ["6 kyu", "5 kyu", "4 kyu", "3 kyu", "2 kyu", "1 kyu", "1 dan"],
    notes: "National federations vary color mapping. Store the issuing org with the rank."
  },
  karate_kyu_dan: {
    system: "karate_kyu_dan",
    ranks: ["10 kyu", "9 kyu", "8 kyu", "7 kyu", "6 kyu", "5 kyu", "4 kyu", "3 kyu", "2 kyu", "1 kyu", "1 dan"],
    notes: "Style associations differ. Do not assume Shotokan colors universally."
  },
  tkd_geup_dan: {
    system: "tkd_geup_dan",
    ranks: ["10 geup", "9 geup", "8 geup", "7 geup", "6 geup", "5 geup", "4 geup", "3 geup", "2 geup", "1 geup", "1 dan"],
    notes: "Kukkiwon / WT geup-dan. ITF uses a different curriculum — store the org."
  },
  capoeira_cordao: {
    system: "capoeira_cordao",
    ranks: [],
    notes: "Cordão colors are school-specific (Grupo / lineage). FitConnect stores the school system, not a fake universal belt."
  },
  kendo_kyu_dan: {
    system: "kendo_kyu_dan",
    ranks: ["3 kyu", "2 kyu", "1 kyu", "1 dan", "2 dan", "3 dan"],
    notes: "FIK / national kendo federations. Iaido often shares dan ranks under FIK."
  },
  sambo_sport: {
    system: "sambo_sport",
    ranks: ["sport ranks per national federation"],
    notes: "Do not map Sambo to BJJ belts."
  },
  org_specific: {
    system: "org_specific",
    ranks: [],
    notes: "Store the organisation name with any rank. No invented universal ladder."
  }
};

export function ladderForDiscipline(disciplineId: string): RankLadder {
  const d = getDiscipline(disciplineId);
  if (!d) return RANK_LADDERS.none;
  return RANK_LADDERS[d.rankSystem];
}
