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
  signatureProgramIds: string[];
  videoIntroPoster?: string;
  athletesCoached: number;
  retentionRate: number;
  languages: string[];
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
  Yoga: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop",
  Strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop",
  Surf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop",
  Climbing:
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&auto=format&fit=crop",
  "Martial Arts":
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&auto=format&fit=crop",
  Running:
    "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&auto=format&fit=crop",
  Swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop",
  Cycling:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop",
  CrossFit:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop",
  Boxing:
    "https://images.unsplash.com/photo-1517438476312-10d79c5f25c9?w=1200&auto=format&fit=crop"
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
      "Welcome! My sessions are calm, technical and always tailored to where your body is today.",
    signatureProgramIds: ["p-foundations", "p-mobility-stack"],
    athletesCoached: 412,
    retentionRate: 93,
    languages: ["English", "Portuguese", "Spanish"]
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
      "Numbers don't lie. Together we'll build a long-term plan that puts kilos on the bar without breaking you.",
    signatureProgramIds: ["p-iron-arc", "p-meet-prep-12"],
    athletesCoached: 287,
    retentionRate: 96,
    languages: ["English", "Spanish"]
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
      "Whether it's your first pop-up or your first contest, I'll meet you in the line-up and we'll build from there.",
    signatureProgramIds: ["p-pop-up-first-wave", "p-comp-prep-surf"],
    athletesCoached: 138,
    retentionRate: 88,
    languages: ["English", "Portuguese"]
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
      "I love unlocking projects. We'll fix the technical & mental gaps holding you back from your dream route.",
    signatureProgramIds: ["p-finger-protocol", "p-send-it"],
    athletesCoached: 201,
    retentionRate: 91,
    languages: ["English", "German", "Hebrew"]
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
      "Calm mind, sharp technique. Train smart, recover well, and compete with confidence.",
    signatureProgramIds: ["p-grappler-base", "p-comp-prep-mma"],
    athletesCoached: 356,
    retentionRate: 94,
    languages: ["English", "Japanese"]
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
      "Most plateaus come from too much, too fast. We'll find your sustainable load and watch you fly.",
    signatureProgramIds: ["p-sub-3-marathon", "p-base-builder"],
    athletesCoached: 244,
    retentionRate: 89,
    languages: ["English", "Portuguese", "Spanish"]
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
      "Glide before you grind. We'll find your most efficient stroke and the speed will come.",
    signatureProgramIds: ["p-stroke-rebuild", "p-open-water-confident"],
    athletesCoached: 198,
    retentionRate: 92,
    languages: ["English", "French", "Italian"]
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
      "Less guess-work. We'll use your power data to put you on the start line of your goal event ready to fly.",
    signatureProgramIds: ["p-ftp-builder", "p-gran-fondo-90"],
    athletesCoached: 312,
    retentionRate: 90,
    languages: ["English", "Italian", "Spanish"]
  }
];

export interface Program {
  id: string;
  title: string;
  trainerId: string;
  sport: Sport;
  weeks: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  sessionsPerWeek: number;
  cover: string;
  tagline: string;
  description: string;
  outcomes: string[];
  price: number;
  joined: number;
  badge?: string;
}

export const PROGRAMS: Program[] = [
  {
    id: "p-iron-arc",
    title: "The Iron Arc",
    trainerId: "t-002",
    sport: "Strength",
    weeks: 12,
    level: "Intermediate",
    sessionsPerWeek: 4,
    cover:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&auto=format&fit=crop",
    tagline: "Add 30+ kilos to your total — without breaking your joints",
    description:
      "A 12-week block periodisation plan that progressively loads the squat, bench and deadlift while protecting recovery. Built around weekly RPE check-ins and form-review videos.",
    outcomes: [
      "Average +28 kg added to total in beta cohort",
      "Weekly form-review video feedback",
      "Custom warm-up & deload weeks built in"
    ],
    price: 189,
    joined: 1284,
    badge: "Bestseller"
  },
  {
    id: "p-sub-3-marathon",
    title: "Sub-3 Marathon Blueprint",
    trainerId: "t-006",
    sport: "Running",
    weeks: 16,
    level: "Advanced",
    sessionsPerWeek: 5,
    cover:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200&auto=format&fit=crop",
    tagline: "16 weeks to break three hours, written by a 2:25 marathoner",
    description:
      "Polarised, heart-rate zoned plan with calibrated long runs, weekly threshold and a race-week taper. Pairs with Garmin, Polar and Apple Watch.",
    outcomes: [
      "67% of athletes finish under 3:00 on goal race",
      "Real long-run pace calibration",
      "Strength & mobility sessions included"
    ],
    price: 219,
    joined: 742
  },
  {
    id: "p-finger-protocol",
    title: "Finger Protocol v3",
    trainerId: "t-004",
    sport: "Climbing",
    weeks: 8,
    level: "Intermediate",
    sessionsPerWeek: 3,
    cover:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&auto=format&fit=crop",
    tagline: "Bulletproof finger strength without injury",
    description:
      "Evidence-based hangboard plan calibrated to your max hang. Includes max strength, repeaters, density and shoulder pre-hab.",
    outcomes: [
      "Avg +4 kg max-hang in 8 weeks",
      "0% injury rate across 1200+ users",
      "Tendon-recovery aware autoregulation"
    ],
    price: 99,
    joined: 968,
    badge: "Athlete favourite"
  },
  {
    id: "p-pop-up-first-wave",
    title: "First Wave",
    trainerId: "t-003",
    sport: "Surf",
    weeks: 4,
    level: "Beginner",
    sessionsPerWeek: 3,
    cover:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop",
    tagline: "From sand-pop-ups to riding a green wave in four weeks",
    description:
      "Mix of land sessions (paddle stamina, pop-up reps) and in-water blocks at Ericeira. Includes ocean safety, wave selection and equipment guidance.",
    outcomes: [
      "92% catch their first green wave by week 3",
      "Sport-specific strength + breath work",
      "In-water video debrief after every session"
    ],
    price: 159,
    joined: 412
  },
  {
    id: "p-grappler-base",
    title: "Grappler Base",
    trainerId: "t-005",
    sport: "Martial Arts",
    weeks: 10,
    level: "Beginner",
    sessionsPerWeek: 4,
    cover:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&auto=format&fit=crop",
    tagline: "Build a real BJJ base before your first competition",
    description:
      "A drill-heavy program covering posture, frames, escapes and submission chains. Built so you can do solo drills on rest days.",
    outcomes: [
      "Compete with confidence at white-belt level",
      "Daily 12-minute solo drill libraries",
      "Weekly Q&A with Aiko on Zoom"
    ],
    price: 139,
    joined: 521
  },
  {
    id: "p-ftp-builder",
    title: "FTP Builder",
    trainerId: "t-008",
    sport: "Cycling",
    weeks: 8,
    level: "Intermediate",
    sessionsPerWeek: 4,
    cover:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop",
    tagline: "+15-25 W FTP in eight clean weeks",
    description:
      "Power-based plan with two threshold sessions, one VO₂max block and one long Z2 ride per week. Auto-syncs with Zwift and TrainerRoad.",
    outcomes: [
      "Average +18 W FTP across 600+ athletes",
      "Polarised intensity distribution",
      "Auto-rebuilds on missed sessions"
    ],
    price: 129,
    joined: 614
  },
  {
    id: "p-stroke-rebuild",
    title: "Stroke Rebuild",
    trainerId: "t-007",
    sport: "Swimming",
    weeks: 6,
    level: "Beginner",
    sessionsPerWeek: 3,
    cover:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop",
    tagline: "Replace splash & struggle with effortless glide",
    description:
      "Three short pool sessions a week focused on catch, body position and breath cadence. Includes weekly video stroke review.",
    outcomes: [
      "Average 12% drop in 100m pace",
      "Weekly video stroke review",
      "Open-water taper option"
    ],
    price: 119,
    joined: 287
  },
  {
    id: "p-foundations",
    title: "Foundations: A Practice For Life",
    trainerId: "t-001",
    sport: "Yoga",
    weeks: 6,
    level: "Beginner",
    sessionsPerWeek: 3,
    cover:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop",
    tagline: "Build the home yoga practice you'll actually keep",
    description:
      "Six weeks of 25-minute sequences that build a sustainable, joint-friendly home practice. Mobility, breath and the right pose options for your body.",
    outcomes: [
      "Build a 25-min daily flow you'll keep",
      "Mobility drills for everyday tightness",
      "Breath protocols for sleep + focus"
    ],
    price: 79,
    joined: 1812,
    badge: "Most popular"
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
  },
  {
    id: "r4",
    trainerId: "t-006",
    author: "Aoife C.",
    rating: 5,
    text:
      "Took 11 minutes off my marathon under Diego. He just gets when to push and when to hold.",
    date: "2026-01-21"
  },
  {
    id: "r5",
    trainerId: "t-004",
    author: "Stefan B.",
    rating: 5,
    text:
      "Sent my project 7c+ after eight weeks on Lior's finger protocol. No tweaks.",
    date: "2026-03-30"
  },
  {
    id: "r6",
    trainerId: "t-008",
    author: "Pedro M.",
    rating: 5,
    text:
      "+22 W FTP in 8 weeks. Mateo doesn't waste a single session.",
    date: "2026-04-09"
  }
];

export const FAQS = [
  {
    q: "How are trainers verified?",
    a: "Every trainer uploads certifications which we validate against the issuing body. We also require government ID, a 30-minute interview with a senior coach on the FitConnect team, and a background check before activation. Only 4 in 10 applicants make it through."
  },
  {
    q: "Can I take sessions remotely?",
    a: "Yes — our integrated HD video room is included for free with every booking. Trainers can mark themselves as online, in-person or hybrid. The video room records by default so you can review form later."
  },
  {
    q: "How do payments work?",
    a: "All bookings are processed through Stripe Connect. Funds are released to the trainer 24 hours after the session, with full refund rules if you cancel within the policy. Coaches keep 85% of every booking — the highest take-home on any marketplace."
  },
  {
    q: "What if I'm not happy with my trainer?",
    a: "Every coach offers a free 15-minute intro call, and you can switch trainers at any time. Subscriptions can be paused — no questions asked — and our Coach Match team will help re-pair you within 48 hours."
  },
  {
    q: "Do you support multi-sport athletes?",
    a: "Yes — your dashboard treats you as one athlete across many disciplines. Train Vinyasa on Monday, Brazilian jiu-jitsu on Wednesday, intervals on Saturday and watch one unified recovery score guide your week."
  },
  {
    q: "How is FitConnect different from Future or Caliber?",
    a: "Future and Caliber pair you with one in-house generalist coach. FitConnect is a marketplace of 12,000 verified specialists across 10 sports — yoga, surf, BJJ, climbing — that platforms like Future simply do not coach. You get the human accountability they offer, plus genuine sport-specific expertise."
  },
  {
    q: "Can my coach see my Apple Watch / Garmin / Whoop data?",
    a: "Yes, with your explicit permission. We pull HRV, sleep, training load and a recovery score that lights up green / amber / red, and your coach can use it to suggest session intensity — or recommend a rest day."
  },
  {
    q: "Is there a free option?",
    a: "Yes — the free plan lets you browse, save 10 favourites, and read 27,000+ verified reviews. You only pay when you book a session or join a program."
  }
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  quote: string;
  metric: { label: string; value: string };
  rating: number;
  coachName: string;
  /** Optional action shot — when present, the testimonial card renders
   *  a hero photo above the quote (used for the "before/after" feel). */
  actionPhoto?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "ts-001",
    name: "Inês P.",
    role: "Strength athlete",
    location: "Lisbon, PT",
    avatar: "https://i.pravatar.cc/200?img=45",
    quote:
      "I'd plateaued for two years before Tomás. Six months in, my total went up 35 kg and my back finally feels bulletproof. I open the app every morning.",
    metric: { label: "Total added", value: "+35 kg" },
    rating: 5,
    coachName: "Tomás Reyes",
    actionPhoto:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80&auto=format&fit=crop"
  },
  {
    id: "ts-002",
    name: "Aoife C.",
    role: "Marathoner",
    location: "Dublin, IE",
    avatar: "https://i.pravatar.cc/200?img=33",
    quote:
      "Diego rewrote my entire approach to easy days. The dashboard told me I was always in zone 3, never in zone 2. Once I fixed that, the speed came on its own.",
    metric: { label: "Marathon PB", value: "−11 min" },
    rating: 5,
    coachName: "Diego Almeida",
    actionPhoto:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=80&auto=format&fit=crop"
  },
  {
    id: "ts-003",
    name: "Stefan B.",
    role: "Sport climber",
    location: "Innsbruck, AT",
    avatar: "https://i.pravatar.cc/200?img=15",
    quote:
      "Lior gave me a plan that I could actually keep. I sent my project 7c+ after eight weeks on the finger protocol — and unlike past plans, my fingers feel better, not worse.",
    metric: { label: "Project grade", value: "7c+" },
    rating: 5,
    coachName: "Lior Ben-Ari"
  },
  {
    id: "ts-004",
    name: "Daniel R.",
    role: "Working dad, ex-runner",
    location: "Porto, PT",
    avatar: "https://i.pravatar.cc/200?img=11",
    quote:
      "I had given up. Marina's foundations program is the first thing in years I've kept for more than three weeks. Sleep score is up 18%, mood is unrecognisable.",
    metric: { label: "Sleep score", value: "+18%" },
    rating: 5,
    coachName: "Marina Costa"
  },
  {
    id: "ts-005",
    name: "Luca M.",
    role: "Beginner surfer",
    location: "Ericeira, PT",
    avatar: "https://i.pravatar.cc/200?img=22",
    quote:
      "Three sessions with Hana and I caught my first overhead at Ribeira d'Ilhas. She reads the ocean like a book — no other coach explained wave selection like that.",
    metric: { label: "First green wave", value: "Week 1" },
    rating: 5,
    coachName: "Hana Okafor",
    actionPhoto:
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&q=80&auto=format&fit=crop"
  },
  {
    id: "ts-006",
    name: "Pedro M.",
    role: "Cat-2 cyclist",
    location: "Girona, ES",
    avatar: "https://i.pravatar.cc/200?img=68",
    quote:
      "Mateo is the only coach who actually reads my power files. I'm not on a generic plan anymore — every Tuesday is exactly the session I need.",
    metric: { label: "FTP gain", value: "+22 W" },
    rating: 5,
    coachName: "Mateo Rinaldi"
  }
];

export const PRESS_LOGOS = [
  { name: "TechCrunch", note: "Series A 2026" },
  { name: "Wired", note: "Best fitness app 2026" },
  { name: "Outside", note: "Editor's choice" },
  { name: "Men's Health", note: "Top 5 coaching app" },
  { name: "The Verge", note: "Picks of 2026" },
  { name: "GQ", note: "Wellness 100" }
];

export interface CommunityPost {
  id: string;
  author: { name: string; avatar: string; sport: Sport };
  kind: "PR" | "Check-in" | "Before/After" | "Question" | "Race";
  text: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  ago: string;
  highlight?: { label: string; value: string };
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "c-1",
    author: {
      name: "Inês P.",
      avatar: "https://i.pravatar.cc/200?img=45",
      sport: "Strength"
    },
    kind: "PR",
    text:
      "Hit a clean 145 kg back-squat at 64 kg bodyweight today. The block deload Tomás had me on last week was magic. Onto the next 5 kilos.",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop",
    likes: 184,
    comments: 23,
    ago: "12m ago",
    highlight: { label: "Back-squat PR", value: "145 kg" }
  },
  {
    id: "c-2",
    author: {
      name: "Aoife C.",
      avatar: "https://i.pravatar.cc/200?img=33",
      sport: "Running"
    },
    kind: "Race",
    text:
      "Berlin Marathon. 2:54:08. PB by 11 minutes. The taper was scary easy and I trusted it. Thank you Diego — and to everyone who messaged on Sunday: I felt all of it.",
    likes: 612,
    comments: 78,
    ago: "1h ago",
    highlight: { label: "Marathon PB", value: "2:54:08" }
  },
  {
    id: "c-3",
    author: {
      name: "Stefan B.",
      avatar: "https://i.pravatar.cc/200?img=15",
      sport: "Climbing"
    },
    kind: "Check-in",
    text:
      "Hangboard week 6 done. Max hang up 3 kg, no tweaks. The autoregulation prompts on bad-sleep days are why this protocol works.",
    likes: 91,
    comments: 12,
    ago: "3h ago"
  },
  {
    id: "c-4",
    author: {
      name: "Daniel R.",
      avatar: "https://i.pravatar.cc/200?img=11",
      sport: "Yoga"
    },
    kind: "Before/After",
    text:
      "Six weeks of Marina's foundations. The thing that surprised me is the sleep — I'm out by 22:30 and my HRV is up 14 ms. Body feels 10 years younger.",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop",
    likes: 248,
    comments: 41,
    ago: "5h ago",
    highlight: { label: "HRV gain", value: "+14 ms" }
  },
  {
    id: "c-5",
    author: {
      name: "Luca M.",
      avatar: "https://i.pravatar.cc/200?img=22",
      sport: "Surf"
    },
    kind: "Check-in",
    text:
      "First time paddling out at Coxos. Got two waves. Three weeks ago I couldn't pop up on a long-board. The pop-up reps work.",
    likes: 159,
    comments: 28,
    ago: "6h ago"
  },
  {
    id: "c-6",
    author: {
      name: "Pedro M.",
      avatar: "https://i.pravatar.cc/200?img=68",
      sport: "Cycling"
    },
    kind: "PR",
    text:
      "20-min FTP test today: 312 W (4.4 W/kg). That's +22 from where I started two months ago. The polarised model is real.",
    likes: 203,
    comments: 19,
    ago: "8h ago",
    highlight: { label: "FTP", value: "312 W" }
  },
  {
    id: "c-7",
    author: {
      name: "Maja S.",
      avatar: "https://i.pravatar.cc/200?img=20",
      sport: "Martial Arts"
    },
    kind: "Question",
    text:
      "First white-belt comp on Saturday. Last 48 hours — any cuts you'd recommend or should I just sleep and ride it in? My coach is asleep but you're awake.",
    likes: 64,
    comments: 39,
    ago: "10h ago"
  },
  {
    id: "c-8",
    author: {
      name: "Yusuf H.",
      avatar: "https://i.pravatar.cc/200?img=60",
      sport: "Swimming"
    },
    kind: "PR",
    text:
      "100m freestyle 1:09. Six weeks ago I was at 1:22. Sophie's catch drills changed everything. Open water in three weeks.",
    likes: 122,
    comments: 17,
    ago: "12h ago",
    highlight: { label: "100m free", value: "1:09" }
  },
  {
    id: "c-9",
    author: {
      name: "Saskia V.",
      avatar: "https://i.pravatar.cc/200?img=48",
      sport: "Boxing"
    },
    kind: "Check-in",
    text:
      "Three rounds of mitts and not gassed — first time. My HRV said today was a green day and the dashboard was right.",
    likes: 88,
    comments: 9,
    ago: "16h ago"
  }
];

export interface MethodologyPillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  body: string;
  metric: { label: string; value: string };
  citation: string;
}

export const METHODOLOGY: MethodologyPillar[] = [
  {
    id: "m-1",
    number: "01",
    title: "Specialist, not generalist",
    subtitle: "Coaches that live and breathe one sport",
    body:
      "Generic plans plateau at week eight. Our coaches each commit to one or two disciplines, which means programming that knows the difference between a Vinyasa flow and a Bikram class, an Olympic squat and a powerlifting squat, an outdoor lead and a sport project.",
    metric: { label: "Avg coach experience", value: "10.4 yrs" },
    citation: "FitConnect 2026 trainer roster, n=12,418"
  },
  {
    id: "m-2",
    number: "02",
    title: "Recovery-aware programming",
    subtitle: "HRV + sleep guide every session",
    body:
      "Your dashboard reads heart-rate variability, resting heart rate and sleep stages from Apple Watch, Garmin or Whoop. A green / amber / red Readiness signal travels straight to your coach, so a hard day on a low-HRV morning becomes a recovery day on yours.",
    metric: { label: "Injury rate vs. control", value: "−41%" },
    citation: "Internal cohort study, 1,840 athletes, 2025-26"
  },
  {
    id: "m-3",
    number: "03",
    title: "Real verification, not vibes",
    subtitle: "Certifications validated, not self-reported",
    body:
      "Every certificate is checked against the issuing body. Every coach interviews with a senior FitConnect coach for 30 minutes. A government ID is on file. 38% of applicants get rejected. The badge means something.",
    metric: { label: "Application rejection rate", value: "62%" },
    citation: "2026 onboarding funnel, FitConnect Trust & Safety"
  },
  {
    id: "m-4",
    number: "04",
    title: "Progression you can see",
    subtitle: "The athlete dashboard tells the truth",
    body:
      "Pace, power, HRV, RPE, sleep, body composition, mood — one place. Charts auto-redraw when a coach updates your plan, so you can see whether the plan is producing the result it promised.",
    metric: { label: "Goals hit on time", value: "73%" },
    citation: "FitConnect cohort 2026 H1, athletes with 90-day goals"
  },
  {
    id: "m-5",
    number: "05",
    title: "Free intro, always",
    subtitle: "Never pay before you've talked to a human",
    body:
      "Every profile includes a free 15-minute intro call. You meet the human you'd be working with, walk through your goals, and feel the chemistry — before a single euro changes hands.",
    metric: { label: "Athletes who switch in 30 days", value: "<5%" },
    citation: "2026 churn analysis"
  },
  {
    id: "m-6",
    number: "06",
    title: "Multi-sport, one identity",
    subtitle: "Train Vinyasa Monday, BJJ Wednesday, intervals Saturday",
    body:
      "Most platforms force athletes into one box. FitConnect models you as one athlete training many disciplines. The recovery score takes everything into account — including the rest day you don't take.",
    metric: { label: "Multi-sport users", value: "61%" },
    citation: "2026 active user analysis"
  }
];

export interface ComparisonRow {
  feature: string;
  fitconnect: string | boolean;
  future: string | boolean;
  caliber: string | boolean;
  trainerize: string | boolean;
  classpass: string | boolean;
}

export const COMPARISON: ComparisonRow[] = [
  {
    feature: "1:1 verified human coach",
    fitconnect: true,
    future: true,
    caliber: true,
    trainerize: "Depends",
    classpass: false
  },
  {
    feature: "Sport-specialist marketplace (yoga, surf, BJJ, climbing…)",
    fitconnect: true,
    future: false,
    caliber: false,
    trainerize: false,
    classpass: "Studio classes only"
  },
  {
    feature: "Free 15-min intro call before paying",
    fitconnect: true,
    future: false,
    caliber: false,
    trainerize: false,
    classpass: false
  },
  {
    feature: "HRV + sleep readiness on dashboard",
    fitconnect: true,
    future: "Partial",
    caliber: false,
    trainerize: false,
    classpass: false
  },
  {
    feature: "Multi-sport athlete model",
    fitconnect: true,
    future: false,
    caliber: false,
    trainerize: "Add-on",
    classpass: false
  },
  {
    feature: "Coach take-home rate",
    fitconnect: "85%",
    future: "Hidden",
    caliber: "Hidden",
    trainerize: "Coach pays SaaS",
    classpass: "30–50%"
  },
  {
    feature: "Certifications verified against issuing body",
    fitconnect: true,
    future: "Partial",
    caliber: "Partial",
    trainerize: false,
    classpass: "Studio-managed"
  },
  {
    feature: "Starting price (athlete)",
    fitconnect: "€12/mo + bookings",
    future: "$199/mo",
    caliber: "$200/mo",
    trainerize: "Coach-set",
    classpass: "€39+/mo"
  }
];

export interface PressItem {
  outlet: string;
  quote: string;
  date: string;
}

export const PRESS_QUOTES: PressItem[] = [
  {
    outlet: "Wired",
    quote:
      "The first marketplace that takes specialised coaching seriously. FitConnect feels like what Airbnb did for stays — but for the people who train you.",
    date: "Mar 2026"
  },
  {
    outlet: "Outside",
    quote:
      "If you have a real sport — climbing, surf, BJJ, mountain running — FitConnect is the only platform where the coaches actually know it.",
    date: "Feb 2026"
  },
  {
    outlet: "TechCrunch",
    quote:
      "FitConnect's verified-specialist model is the first credible threat to Future and Caliber's hold on the high-end coaching market.",
    date: "Jan 2026"
  }
];

export const QUIZ_OPTIONS = {
  goals: [
    { id: "strength", label: "Build strength", icon: "💪" },
    { id: "endurance", label: "Build endurance", icon: "🏃" },
    { id: "skill", label: "Master a skill", icon: "🎯" },
    { id: "compete", label: "Compete", icon: "🏆" },
    { id: "wellness", label: "Feel better", icon: "🧘" }
  ],
  experience: [
    { id: "starter", label: "Just starting", description: "0–6 months in this sport" },
    {
      id: "intermediate",
      label: "Consistent for a while",
      description: "6 months – 3 years"
    },
    {
      id: "advanced",
      label: "Long-time athlete",
      description: "3+ years, competing or close to it"
    }
  ],
  schedule: [
    { id: "1-2", label: "1–2 sessions / week" },
    { id: "3-4", label: "3–4 sessions / week" },
    { id: "5+", label: "5+ sessions / week" }
  ],
  modality: [
    { id: "online", label: "Mostly online", description: "Video sessions + plans" },
    { id: "in-person", label: "In-person", description: "Meet at a gym or location" },
    { id: "hybrid", label: "A mix", description: "Online plans + some in-person" }
  ]
};

export const STATS = {
  athletes: 184_512,
  trainers: 12_418,
  sessions: 1_240_000,
  countries: 47,
  avgRating: 4.94,
  rebookRate: 0.82
};

export const FEATURED_CITIES = [
  "Lisbon",
  "Madrid",
  "Barcelona",
  "Berlin",
  "London",
  "Paris",
  "Amsterdam",
  "Stockholm",
  "Dublin",
  "Vienna",
  "Rome",
  "Athens"
];
