export type Sport =
  | "Yoga"
  | "Strength"
  | "Surf"
  | "Climbing"
  | "Martial Arts"
  | "Running"
  | "Swimming"
  | "Cycling"
  | "CrossFit"
  | "Boxing";

export type Modality = "online" | "in-person" | "hybrid";

export interface Trainer {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  sports: Sport[];
  certifications: string[];
  years: number;
  rating: number;
  reviews: number;
  hourlyRate: number;
  modality: Modality;
  responseTime: string;
  highlights: string[];
  intro: string;
}

export const SPORTS: Sport[] = [
  "Yoga",
  "Strength",
  "Surf",
  "Climbing",
  "Martial Arts",
  "Running",
  "Swimming",
  "Cycling",
  "CrossFit",
  "Boxing"
];

const trainerCovers: Record<Sport, string> = {
  Yoga: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
  Strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
  Surf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop",
  Climbing:
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop",
  "Martial Arts":
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&auto=format&fit=crop",
  Running:
    "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop",
  Swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop",
  Cycling:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop",
  CrossFit:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop",
  Boxing:
    "https://images.unsplash.com/photo-1517438476312-10d79c5f25c9?w=800&auto=format&fit=crop"
};

export const TRAINERS: Trainer[] = [
  {
    id: "t-001",
    name: "Marina Costa",
    avatar: "https://i.pravatar.cc/200?img=47",
    cover: trainerCovers.Yoga,
    headline: "Vinyasa & Ashtanga specialist · 9 years",
    bio: "Former competitive gymnast turned 500-hr RYT yoga instructor. I help students build a sustainable home practice that respects their body.",
    city: "Lisbon",
    country: "Portugal",
    sports: ["Yoga"],
    certifications: ["RYT 500", "Yin Yoga Certified", "Pre-natal Yoga"],
    years: 9,
    rating: 4.97,
    reviews: 184,
    hourlyRate: 45,
    modality: "hybrid",
    responseTime: "~1h",
    highlights: ["1:1 sequences", "Mobility & breathwork", "Beginners welcome"],
    intro:
      "Welcome! My sessions are calm, technical and always tailored to where your body is today."
  },
  {
    id: "t-002",
    name: "Tomás Reyes",
    avatar: "https://i.pravatar.cc/200?img=12",
    cover: trainerCovers.Strength,
    headline: "Powerlifting & hypertrophy coach",
    bio: "IPF-certified coach with athletes squatting 3x bodyweight. Specialised in long-term programming and injury-free progress.",
    city: "Madrid",
    country: "Spain",
    sports: ["Strength", "CrossFit"],
    certifications: ["IPF Coach", "FMS Level 2", "Precision Nutrition L1"],
    years: 11,
    rating: 4.92,
    reviews: 312,
    hourlyRate: 60,
    modality: "in-person",
    responseTime: "~30m",
    highlights: ["Block periodisation", "Form analysis on video", "Meet prep"],
    intro:
      "Numbers don't lie. Together we'll build a long-term plan that puts kilos on the bar without breaking you."
  },
  {
    id: "t-003",
    name: "Hana Okafor",
    avatar: "https://i.pravatar.cc/200?img=32",
    cover: trainerCovers.Surf,
    headline: "Pro surfer & ISA-certified instructor",
    bio: "Competitor on the WSL Qualifying Series. I teach reading the ocean, paddle technique and competitive maneuvers.",
    city: "Ericeira",
    country: "Portugal",
    sports: ["Surf"],
    certifications: ["ISA Level 2", "ILS Surf Rescue"],
    years: 7,
    rating: 4.99,
    reviews: 96,
    hourlyRate: 70,
    modality: "in-person",
    responseTime: "~2h",
    highlights: ["Wave selection", "Video analysis", "Custom equipment advice"],
    intro:
      "Whether it's your first pop-up or your first contest, I'll meet you in the line-up and we'll build from there."
  },
  {
    id: "t-004",
    name: "Lior Ben-Ari",
    avatar: "https://i.pravatar.cc/200?img=14",
    cover: trainerCovers.Climbing,
    headline: "Sport & trad climbing · 12 years",
    bio: "AMGA-certified guide. Specialist in finger strength, route reading and lead head-game for climbers from 5.10 to 5.13.",
    city: "Innsbruck",
    country: "Austria",
    sports: ["Climbing"],
    certifications: ["AMGA SPI", "Wilderness First Responder"],
    years: 12,
    rating: 4.95,
    reviews: 158,
    hourlyRate: 55,
    modality: "hybrid",
    responseTime: "~1h",
    highlights: ["Hangboard plans", "Lead head game", "Outdoor trips"],
    intro:
      "I love unlocking projects. We'll fix the technical & mental gaps holding you back from your dream route."
  },
  {
    id: "t-005",
    name: "Aiko Tanaka",
    avatar: "https://i.pravatar.cc/200?img=49",
    cover: trainerCovers["Martial Arts"],
    headline: "BJJ black belt · Muay Thai · MMA",
    bio: "Black belt under Marcelo Garcia. I coach beginners and competitors with structured, drill-based sessions.",
    city: "Tokyo",
    country: "Japan",
    sports: ["Martial Arts"],
    certifications: ["BJJ Black Belt", "WBC Muay Thai", "Strength & Conditioning"],
    years: 14,
    rating: 4.98,
    reviews: 271,
    hourlyRate: 65,
    modality: "in-person",
    responseTime: "~45m",
    highlights: ["Competition prep", "Drill libraries", "Weight cuts"],
    intro:
      "Calm mind, sharp technique. Train smart, recover well, and compete with confidence."
  },
  {
    id: "t-006",
    name: "Diego Almeida",
    avatar: "https://i.pravatar.cc/200?img=23",
    cover: trainerCovers.Running,
    headline: "Marathon & ultramarathon coach",
    bio: "Sub-2:25 marathoner. I write data-driven training plans tailored to your real life, with weekly check-ins.",
    city: "Porto",
    country: "Portugal",
    sports: ["Running"],
    certifications: ["UESCA Ultra Coach", "VDOT Certified"],
    years: 8,
    rating: 4.94,
    reviews: 142,
    hourlyRate: 40,
    modality: "online",
    responseTime: "~3h",
    highlights: ["Heart rate zones", "Race-day strategy", "Strength for runners"],
    intro:
      "Most plateaus come from too much, too fast. We'll find your sustainable load and watch you fly."
  },
  {
    id: "t-007",
    name: "Sophie Laurent",
    avatar: "https://i.pravatar.cc/200?img=44",
    cover: trainerCovers.Swimming,
    headline: "FINA & open-water swimming coach",
    bio: "Ex-Olympic relay member. I obsess over stroke mechanics and helping triathletes feel calm in open water.",
    city: "Nice",
    country: "France",
    sports: ["Swimming"],
    certifications: ["ASCA Level 4", "Open Water Safety"],
    years: 13,
    rating: 4.96,
    reviews: 189,
    hourlyRate: 58,
    modality: "in-person",
    responseTime: "~1h",
    highlights: ["Stroke video review", "Open-water confidence", "Triathlon prep"],
    intro:
      "Glide before you grind. We'll find your most efficient stroke and the speed will come."
  },
  {
    id: "t-008",
    name: "Mateo Rinaldi",
    avatar: "https://i.pravatar.cc/200?img=58",
    cover: trainerCovers.Cycling,
    headline: "Road, MTB & gravel performance",
    bio: "Power-based coach with athletes on UCI Continental teams. Smart, polarised training that respects recovery.",
    city: "Girona",
    country: "Spain",
    sports: ["Cycling"],
    certifications: ["British Cycling L3", "TrainingPeaks Level 2"],
    years: 10,
    rating: 4.93,
    reviews: 167,
    hourlyRate: 50,
    modality: "online",
    responseTime: "~2h",
    highlights: ["FTP testing", "Race tactics", "Bike fit"],
    intro:
      "Less guess-work. We'll use your power data to put you on the start line of your goal event ready to fly."
  }
];

export const REVIEWS = [
  {
    id: "r1",
    trainerId: "t-002",
    author: "Inês P.",
    rating: 5,
    text:
      "Six months with Tomás and I added 35 kg to my total. Couldn't recommend him more.",
    date: "2026-03-12"
  },
  {
    id: "r2",
    trainerId: "t-001",
    author: "Daniel R.",
    rating: 5,
    text:
      "Marina's sessions changed how I breathe and how I sleep. Genuinely life-changing.",
    date: "2026-04-02"
  },
  {
    id: "r3",
    trainerId: "t-003",
    author: "Luca M.",
    rating: 5,
    text:
      "Caught my first overhead wave at Ribeira d'Ilhas after three sessions with Hana.",
    date: "2026-02-18"
  }
];

export const FAQS = [
  {
    q: "How are trainers verified?",
    a: "Every trainer uploads certifications which we validate against the issuing body. We also require ID + a short interview before activation."
  },
  {
    q: "Can I take sessions remotely?",
    a: "Yes — our integrated HD video room is included for free with every booking. Trainers can mark themselves as online, in-person or both."
  },
  {
    q: "How do payments work?",
    a: "All bookings are processed through Stripe Connect. Funds are released to the trainer 24 hours after the session, with full refund rules if you cancel within the policy."
  },
  {
    q: "What if I'm not happy with my trainer?",
    a: "We offer a free trial session on most profiles, and you can switch trainers at any time. Subscriptions can be paused, no questions asked."
  }
];
