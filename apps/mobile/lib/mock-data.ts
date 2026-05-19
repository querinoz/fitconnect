export type MobileCoach = {
  id: string;
  name: string;
  sport: string;
  rating: number;
  reviews: number;
  price: number;
  headline: string;
  match?: number;
};

export type MobileSession = {
  id: string;
  coachName: string;
  sport: string;
  startsAt: string;
  status: "upcoming" | "completed";
  mode: "video" | "in-person";
};

export type MobileProgram = {
  id: string;
  title: string;
  sport: string;
  weeks: number;
  progress: number;
  coachName: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  sport: string;
  body: string;
  metric?: string;
  reactions: number;
  ago: string;
};

export const DEMO_COACHES: MobileCoach[] = [
  {
    id: "t-002",
    name: "Tomás Ribeiro",
    sport: "Triathlon",
    rating: 4.9,
    reviews: 127,
    price: 65,
    headline: "Sub-9h Ironman specialist",
    match: 94
  },
  {
    id: "t-001",
    name: "Marina Costa",
    sport: "Running",
    rating: 4.8,
    reviews: 89,
    price: 55,
    headline: "Marathon & trail pacing",
    match: 88
  },
  {
    id: "t-003",
    name: "Lior Ben-Ami",
    sport: "Climbing",
    rating: 5,
    reviews: 42,
    price: 70,
    headline: "Outdoor 6c+ progression",
    match: 81
  }
];

export const DEMO_SESSIONS: MobileSession[] = [
  {
    id: "s-101",
    coachName: "Tomás Ribeiro",
    sport: "Triathlon",
    startsAt: "2026-05-20T07:00:00Z",
    status: "upcoming",
    mode: "video"
  },
  {
    id: "s-102",
    coachName: "Tomás Ribeiro",
    sport: "Strength",
    startsAt: "2026-05-15T17:30:00Z",
    status: "completed",
    mode: "video"
  }
];

export const DEMO_PROGRAMS: MobileProgram[] = [
  {
    id: "p-01",
    title: "Sub-3 Marathon Block",
    sport: "Running",
    weeks: 12,
    progress: 34,
    coachName: "Marina Costa"
  },
  {
    id: "p-02",
    title: "Ironman Base Build",
    sport: "Triathlon",
    weeks: 16,
    progress: 12,
    coachName: "Tomás Ribeiro"
  }
];

export const DEMO_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: "Inês M.",
    sport: "Running",
    body: "Long run felt smooth — coach adjusted volume after HRV dip.",
    metric: "🏃 18km @ 4:52/km",
    reactions: 24,
    ago: "2h"
  },
  {
    id: "post-2",
    author: "Pedro S.",
    sport: "Cycling",
    body: "FTP test day. Legs were heavy but hit target.",
    metric: "🚴 +22W FTP",
    reactions: 41,
    ago: "5h"
  }
];

export const DEMO_ATHLETES = [
  { id: "a-ines", name: "Inês M.", sport: "Running", readiness: 87, trend: "+4" },
  { id: "a-pedro", name: "Pedro S.", sport: "Cycling", readiness: 52, trend: "-8" },
  { id: "a-sara", name: "Sara L.", sport: "Triathlon", readiness: 71, trend: "+2" }
];
