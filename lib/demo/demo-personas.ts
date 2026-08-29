/**
 * Fictional demo personas — clearly synthetic, not real customers.
 * All assets tagged DEMO_ASSET in metadata.
 */

export type DemoPersona = {
  id: string;
  name: string;
  sport: string;
  title: string;
  level?: number;
  role: "athlete" | "coach";
  avatar: string;
  cover?: string;
  meta: { demoAsset: true; synthetic: true };
};

const DEMO_META = { demoAsset: true as const, synthetic: true as const };

export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  marina: {
    id: "demo-marina",
    name: "Marina Costa",
    sport: "Running",
    title: "Ultra Runner",
    level: 38,
    role: "athlete",
    avatar:
      "https://images.unsplash.com/photo-1594381898411-8465977f4b0e?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8dba8?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  },
  ines: {
    id: "demo-ines",
    name: "Inês Costa",
    sport: "Triathlon",
    title: "Elite Athlete",
    level: 44,
    role: "athlete",
    avatar:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  },
  tomas: {
    id: "demo-tomas",
    name: "Tomás Rivera",
    sport: "Coach",
    title: "Performance Coach",
    role: "coach",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d855fa42a?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  },
  elena: {
    id: "demo-elena",
    name: "Elena Novak",
    sport: "Cycling",
    title: "Level 31",
    level: 31,
    role: "athlete",
    avatar:
      "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  },
  lucas: {
    id: "demo-lucas",
    name: "Lucas Mendes",
    sport: "Strength",
    title: "Level 24",
    level: 24,
    role: "athlete",
    avatar:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  },
  maya: {
    id: "demo-maya",
    name: "Maya Rossi",
    sport: "Running",
    title: "Level 42",
    level: 42,
    role: "athlete",
    avatar:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&h=200&fit=crop&crop=face&auto=format&q=80",
    cover:
      "https://images.unsplash.com/photo-1452626038306-9d5c72c1e76e?w=1200&auto=format&fit=crop&q=80",
    meta: DEMO_META
  }
};
