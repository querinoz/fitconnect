import type { DemoPersona } from "./demo-personas";
import { DEMO_PERSONAS } from "./demo-personas";

export type DemoFeedCardType =
  | "ACTIVITY"
  | "PERFORMANCE"
  | "ACHIEVEMENT"
  | "PERSONAL_BEST"
  | "RECOVERY"
  | "COACH_INSIGHT"
  | "SQUAD"
  | "MILESTONE"
  | "PHOTO"
  | "MOTIVATION";

export type DemoFeedPost = {
  id: string;
  eventId: string;
  type: DemoFeedCardType;
  author: DemoPersona;
  text: string;
  imageUrl?: string;
  highlight?: { label: string; value: string };
  metric?: { label: string; value: string; zone?: string };
  reactions: Record<string, number>;
  comments: number;
  createdAt: number;
  demo: true;
  meta: { demoAsset: true; synthetic: true };
};

type Template = Omit<DemoFeedPost, "id" | "eventId" | "createdAt" | "reactions" | "comments"> & {
  baseReactions: number;
  baseComments: number;
};

const DEMO_META = { demoAsset: true as const, synthetic: true as const };

/** Cyclic sequence — one event every 4s (spec §14). */
export const DEMO_FEED_SEQUENCE: Template[] = [
  {
    type: "ACTIVITY",
    author: DEMO_PERSONAS.maya,
    text: "Morning tempo block complete. 12 km at controlled effort — legs felt sharp through the final 2 km.",
    metric: { label: "Distance", value: "12.0 km" },
    baseReactions: 12,
    baseComments: 3,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "COACH_INSIGHT",
    author: DEMO_PERSONAS.tomas,
    text: "Inês — your aerobic decoupling dropped 4% this week. Keep Tuesday Z2 easy; Thursday intervals stay on plan.",
    highlight: { label: "Decoupling", value: "−4%" },
    baseReactions: 8,
    baseComments: 2,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "MILESTONE",
    author: DEMO_PERSONAS.elena,
    text: "Crossed 500 km on the season. Consistency over hero days — that's the Voltline way.",
    highlight: { label: "Season volume", value: "500 km" },
    baseReactions: 34,
    baseComments: 7,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "SQUAD",
    author: DEMO_PERSONAS.marina,
    text: "Unit Voltline hit squad momentum target — 3 athletes logged sessions before 07:00.",
    highlight: { label: "Squad XP", value: "+420" },
    baseReactions: 21,
    baseComments: 5,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "RECOVERY",
    author: DEMO_PERSONAS.ines,
    text: "HRV back in green after deload. Readiness 82 — cleared for tomorrow's brick session.",
    metric: { label: "Readiness", value: "82", zone: "ZONE 2" },
    baseReactions: 15,
    baseComments: 4,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "PERSONAL_BEST",
    author: DEMO_PERSONAS.lucas,
    text: "New back-squat PR at 155 kg. Clean reps, no grind on the final one.",
    highlight: { label: "Back-squat PR", value: "155 kg" },
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=80",
    baseReactions: 47,
    baseComments: 11,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "PHOTO",
    author: DEMO_PERSONAS.marina,
    text: "Trail sunrise before the long run. Legs heavy, mind clear.",
    imageUrl:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8dba8?w=900&auto=format&fit=crop&q=80",
    baseReactions: 28,
    baseComments: 6,
    demo: true,
    meta: DEMO_META
  },
  {
    type: "MOTIVATION",
    author: DEMO_PERSONAS.tomas,
    text: "Recommendation: add 8 min mobility tonight. Your cadence drift suggests hip tightness on climbs.",
    highlight: { label: "Focus", value: "Mobility" },
    baseReactions: 9,
    baseComments: 1,
    demo: true,
    meta: DEMO_META
  }
];

let sequenceCounter = 0;

export function nextDemoFeedTemplate(): Template {
  const template = DEMO_FEED_SEQUENCE[sequenceCounter % DEMO_FEED_SEQUENCE.length];
  sequenceCounter += 1;
  return template;
}

export function createDemoFeedPost(
  template: Template,
  createdAt = Date.now()
): DemoFeedPost {
  const suffix = `${createdAt}-${sequenceCounter}`;
  return {
    ...template,
    id: `demo-feed-${suffix}`,
    eventId: `demo-event-${suffix}`,
    createdAt,
    reactions: { "🔥": Math.floor(template.baseReactions * 0.4), "💪": Math.floor(template.baseReactions * 0.2) },
    comments: template.baseComments
  };
}

export function seedDemoFeedPosts(count = 3): DemoFeedPost[] {
  const posts: DemoFeedPost[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const template = nextDemoFeedTemplate();
    posts.unshift(createDemoFeedPost(template, now - (count - i) * 60_000));
  }
  return posts;
}

/** Reset sequence counter — for tests only */
export function resetDemoFeedSequence() {
  sequenceCounter = 0;
}
