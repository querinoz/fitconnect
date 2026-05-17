export type Lang = "en" | "pt" | "es" | "fr" | "de" | "it";

export const LANGS: {
  code: Lang;
  label: string;
  native: string;
  flag: "GB" | "PT" | "ES" | "FR" | "DE" | "IT";
}[] = [
  { code: "en", label: "English", native: "English", flag: "GB" },
  { code: "pt", label: "Portuguese", native: "Português", flag: "PT" },
  { code: "es", label: "Spanish", native: "Español", flag: "ES" },
  { code: "fr", label: "French", native: "Français", flag: "FR" },
  { code: "de", label: "German", native: "Deutsch", flag: "DE" },
  { code: "it", label: "Italian", native: "Italiano", flag: "IT" }
];

export const SUPPORTED_LANGS: Lang[] = LANGS.map((l) => l.code);
export const DEFAULT_LANG: Lang = "en";

export type FaqItem = { q: string; a: string };
export type FeatureItem = { title: string; body: string };
export type CannedItem = { prompt: string; answer: string };
export type WhyPoint = {
  title: string;
  body: string;
  metric: string;
  metricLabel: string;
};
export type HowStep = { title: string; body: string; detail: string };
export type DemoTile = { label: string; body: string };
export type EvidenceItem = { title: string; citation: string; body: string };
export type MethodologyPillarCopy = {
  title: string;
  subtitle: string;
  body: string;
  metricLabel: string;
  metricValue: string;
  citation: string;
};

export type Dict = {
  nav: {
    findCoach: string;
    programs: string;
    community: string;
    methodology: string;
    pricing: string;
    more: string;
    dashboard: string;
    coachDashboard: string;
    forCoaches: string;
    signIn: string;
    matchMe: string;
    menu: string;
    homeAria: string;
  };
  demo: { label: string; body: string; cta: string };
  hero: {
    livePill: string;
    title1: string;
    titleAccent: string;
    title2: string;
    subtitle: string;
    primary: string;
    secondary: string;
    reviewsLine: string;
    rejectedTitle: string;
    rejectedBody: string;
  };
  sports: { eyebrow: string; title: string; note: string };
  features: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    titleAfter: string;
    subtitle: string;
    items: FeatureItem[];
  };
  pricing: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    subtitle: string;
    perMonth: string;
    mostPopular: string;
    start: string;
    compareAll: string;
    freeName: string;
    freeDesc: string;
    athleteName: string;
    athleteDesc: string;
    coachName: string;
    coachDesc: string;
    features: { free: string[]; athlete: string[]; coach: string[] };
  };
  faqs: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    subtitle: string;
    items: FaqItem[];
  };
  cta: {
    pill: string;
    title1: string;
    titleAccent: string;
    title2: string;
    subtitle: string;
    primary: string;
    secondary: string;
    reassurance: string;
  };
  footer: {
    tagline: string;
    productHeading: string;
    companyHeading: string;
    legalHeading: string;
    buildHeading: string;
    buildBody: string;
    seeRepo: string;
    copyright: string;
    statusOk: string;
  };
  dashboard: {
    eyebrow: string;
    welcome: string;
    streak: string;
    schedule: string;
    startSession: string;
    aiSuggestion: string;
    approvedBy: string;
    applyPlan: string;
    hrvLabel: string;
    readinessTitle: string;
    readinessGreen: string;
    upcoming: string;
    habits: string;
    messages: string;
    weeklyVolume: string;
    monthlyTrend: string;
    sleepRecovery: string;
    viewAll: string;
    online: string;
    inPerson: string;
    tomorrow: string;
    coachPlanTitle: string;
    coachPlanSubtitle: string;
    wearableSyncHint: string;
    noAthleteProfile: string;
  };
  hub: {
    mobileNav: string;
    yourCoach: string;
    wearableSync: string;
    sessionsMonth: string;
    hoursTrained: string;
    prStreak: string;
    personalBest: string;
    goalCompletion: string;
    roster: string;
    monitor: string;
    backToRoster: string;
    monitorAthlete: string;
    readiness: string;
    recoveryNotes: string;
    noPlanYet: string;
    sendRecoveryNudge: string;
    athleteNotFound: string;
  };
  coachDashboard: {
    eyebrow: string;
    welcome: string;
    streak: string;
    schedule: string;
    viewRoster: string;
    aiAlert: string;
    aiAlertBody: string;
    reviewPlans: string;
    activeAthletes: string;
    revenueMtd: string;
    sessionsWeek: string;
    retention: string;
    rebookRate: string;
    weeklyRevenue: string;
    athleteRoster: string;
    upcomingSessions: string;
    clientMessages: string;
    retentionInsights: string;
  };
  dashboardPreview: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    athleteTab: string;
    coachTab: string;
    tabsAria: string;
    athleteCta: string;
    coachCta: string;
    floatingTitle: string;
    floatingBody: string;
    features: FeatureItem[];
  };
  auth: {
    signInHeading: string;
    signUpHeading: string;
    signInSubtitle: string;
    signUpSubtitle: string;
    continueWith: string;
    or: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitSignIn: string;
    submitSignUp: string;
    noAccount: string;
    haveAccount: string;
    createAccount: string;
    signInLink: string;
    legalNote: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    signInPasswordPlaceholder: string;
    invalidCredentials: string;
    alreadySignedIn: string;
    signedInAs: string;
    continueToDashboard: string;
    signOut: string;
    bullets: [string, string, string];
  };
  fitme: {
    cta: string;
    modalTitle: string;
    modalSubtitle: string;
    previewLabel: string;
    sendingLabel: string;
    sentTitle: string;
    sentBody: string;
    sendButton: string;
    closeButton: string;
    poweredBy: string;
    introLines: [string, string, string];
  };
  ai: {
    bubbleLabel: string;
    panelTitle: string;
    panelSubtitle: string;
    demoTag: string;
    placeholder: string;
    suggestionsHeading: string;
    sendLabel: string;
    closeLabel: string;
    typingLabel: string;
    canned: CannedItem[];
  };
  community: {
    celebrationsHeading: string;
    celebrationsSub: string;
    chip: { pr: string; hire: string; streak: string; booking: string };
  };
  common: {
    skipToContent: string;
    languageMenu: string;
    selectLanguage: string;
    yes: string;
    no: string;
    removeFilter: string;
  };
  stats: {
    athletes: string;
    specialists: string;
    sessions: string;
    countries: string;
    rating: string;
    rebook: string;
  };
  discover: {
    search: string;
    searchPlaceholder: string;
    sport: string;
    allSports: string;
    modality: string;
    anyModality: string;
    maxPrice: string;
    minExperience: string;
    resetFilters: string;
    filtersInstant: string;
    filters: string;
    titleAll: string;
    titleSport: string;
    loading: string;
    matchCount: string;
    sortBest: string;
    sortRating: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    emptyTitle: string;
    emptyDesc: string;
    handPairTitle: string;
    handPairBody: string;
    handPairCta: string;
    upToPrice: string;
    yearsPlus: string;
  };
  trainers: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    seeAll: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  how: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    steps: HowStep[];
  };
  why: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    points: WhyPoint[];
  };
  demos: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    tiles: DemoTile[];
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };
  comparison: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    feature: string;
  };
  quiz: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    back: string;
    next: string;
    seeMatch: string;
    matchTitle: string;
    matchSubtitle: string;
    bookIntro: string;
    browseAll: string;
    steps: [string, string, string, string, string];
  };
  communityFeed: {
    eyebrow: string;
    title: string;
    subtitle: string;
    shareCta: string;
    searchPlaceholder: string;
    activityType: string;
    sport: string;
    allSports: string;
    liveActivity: string;
    trendingClubs: string;
    upcomingMeetups: string;
    join: string;
    members: string;
    going: string;
    emptyTitle: string;
    emptyDesc: string;
    kinds: {
      all: string;
      pr: string;
      checkin: string;
      beforeAfter: string;
      race: string;
      question: string;
    };
    stats: { postsToday: string; prsWeek: string; activeClubs: string };
  };
  programsPage: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string;
    subtitle: string;
    featuredBadge: string;
    weeks: string;
    athletesJoined: string;
    joinProgram: string;
    seeSampleWeek: string;
    searchPlaceholder: string;
    allSports: string;
    emptyTitle: string;
    emptyDesc: string;
    browseAll: string;
    levels: {
      all: string;
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };
  pricingPage: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    monthly: string;
    annual: string;
    saveBadge: string;
    perMonth: string;
    billedAnnually: string;
    sessionRatesTitle: string;
    sessionRatesSubtitle: string;
    sport: string;
    from: string;
    typical: string;
    premium: string;
    faqTitle: string;
    faqSubtitle: string;
    plans: {
      free: { name: string; desc: string; cta: string; features: string[] };
      athlete: { name: string; desc: string; cta: string; features: string[] };
      team: { name: string; desc: string; cta: string; features: string[] };
      coach: { name: string; desc: string; cta: string; features: string[] };
    };
    reassurance: { title: string; body: string }[];
    faqs: FaqItem[];
  };
  coachLanding: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    applyCta: string;
    seeEarnings: string;
    perks: FeatureItem[];
    earningsTitle: string;
    earningsTitleAccent: string;
    earningsSubtitle: string;
    cohortMonths: string;
    median: string;
    top10: string;
    voicesTitle: string;
    voicesSubtitle: string;
    stats: { activeCoaches: string; avgTakeHome: string; coachNps: string };
    earningsBullets: [string, string, string];
    earningsSource: string;
    floatingMedian: string;
    floatingMedianSub: string;
    floatingAthletes: string;
    floatingAthletesSub: string;
    voices: { name: string; role: string; quote: string }[];
    onboardingEyebrow: string;
    onboardingTitle: string;
    onboardingTitleAccent: string;
    onboardingSteps: HowStep[];
  };
  methodologyPage: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    pillarsTitle: string;
    pillarOf: string;
    sourceLabel: string;
    evidenceEyebrow: string;
    evidenceTitle: string;
    evidenceSubtitle: string;
    evidence: EvidenceItem[];
    quote: string;
    quoteAuthor: string;
    stats: { interviewed: string; accepted: string; acceptanceRate: string };
    auditNote: string;
  };
  methodologyPillars: MethodologyPillarCopy[];
};

export type TFn = <K1 extends keyof Dict, K2 extends keyof Dict[K1]>(
  group: K1,
  key: K2
) => Dict[K1][K2];
