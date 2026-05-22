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
export const DEFAULT_LANG: Lang = "pt";

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
    tagline: string;
    title1: string;
    titleAccent: string;
    title2: string;
    subtitle: string;
    primary: string;
    secondary: string;
    signupCta: string;
    coachCta: string;
    reviewsLine: string;
    rejectedTitle: string;
    rejectedBody: string;
    reassurance: string;
    demoCta: string;
    fullScreenDemo: string;
    avatarAthleteAlt: string;
    avatarCoachAlt: string;
    deviceMock: {
      readinessLabel: string;
      metricsLine: string;
      athleteName: string;
      activityName: string;
      coachName: string;
    };
    immersive: {
      connect: string;
      train: string;
      perform: string;
      scrollHint: string;
      tagline: string;
      badge: string;
      headline: string;
      headlineAccent: string;
      exploreMenu: string;
      menuLabel: string;
      menuAthletes: string;
      menuCoaches: string;
      menuCommunity: string;
      menuPricing: string;
      menuMethodology: string;
      statAthletes: string;
      statCoaches: string;
      statActivities: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
  };
  heroExtras: {
    metricsReadiness: string;
    metricsReadinessDelta: string;
    metricsCoachFit: string;
    metricsCoachFitDelta: string;
    metricsLoad: string;
    metricsLoadDelta: string;
    cardTitle: string;
    cardBody: string;
    liveDemo: string;
    sportStrength: string;
    sportYoga: string;
    sportRunning: string;
  };
  landingV2: {
    scrollStory: {
      eyebrow: string;
      title: string;
      titleAccent: string;
      subtitle: string;
      chapter: string;
      athletesTitle: string;
      athletesBody: string;
      athletesCta: string;
      coachesTitle: string;
      coachesBody: string;
      coachesCta: string;
      togetherTitle: string;
      togetherBody: string;
      togetherCta: string;
      footerHint: string;
      footerCta: string;
    };
  };
  landingEditorial: {
    gate: { initializing: string };
    hero: {
      badge: string;
      scroll: string;
      statAthletes: string;
      statAthletesLabel: string;
      statCoaches: string;
      statCoachesLabel: string;
      statRating: string;
      statRatingLabel: string;
    };
    sectionBreak: {
      connect: string;
      perform: string;
      train: string;
      smarter: string;
      track: string;
      everyMove: string;
      book: string;
      yourCoach: string;
    };
    quotes: {
      athlete: { text: string; attribution: string };
      coach: { text: string; attribution: string };
    };
    manifesto: {
      block1: {
        label: string;
        title: string;
        body: string;
        metric: string;
        metricLabel: string;
      };
      block2: {
        label: string;
        title: string;
        body: string;
        metric: string;
        metricLabel: string;
      };
      block3: { label: string; title: string; body: string };
    };
    trust: {
      rating: string;
      ratingLabel: string;
      reviews: string;
      reviewsLabel: string;
      rejected: string;
      rejectedLabel: string;
      retention: string;
      retentionLabel: string;
      verified: string;
    };
    coachReel: { verified: string; sessions: string; dragHint: string };
    finalCta: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      primary: string;
      secondary: string;
      footer: string;
    };
    navPill: { demo: string; start: string; discover: string; coaches: string; pricing: string };
  };
  downloadSection: {
    eyebrow: string;
    title: string;
    subtitle: string;
    installApp: string;
    openLiveDemo: string;
    tryMobileDemo: string;
  };
  mobileApp: {
    launcher: {
      badge: string;
      titleDesktop: string;
      subtitleDesktop: string;
      titleMobile: string;
      subtitleMobile: string;
      athleteTitle: string;
      athleteSubtitle: string;
      coachTitle: string;
      coachSubtitle: string;
      openAthlete: string;
      openCoach: string;
      useAnotherAccount: string;
      backHomeAria: string;
      metaTitle: string;
      metaDescription: string;
    };
    nav: {
      today: string;
      sessions: string;
      map: string;
      coach: string;
      roster: string;
      inbox: string;
      profile: string;
      ariaLabel: string;
    };
    header: {
      athleteEyebrow: string;
      coachEyebrow: string;
      athleteGreeting: string;
      coachGreeting: string;
      syncBadge: string;
      syncAgo: string;
    };
    today: {
      readiness: string;
      rosterGreen: string;
      trainHard: string;
      startSession: string;
      returnToLive: string;
      hrv: string;
      amberAlerts: string;
      msDelta: string;
      streak: string;
      personalBest: string;
      sleep: string;
      sleepQuality: string;
      load: string;
      sevenDay: string;
      weeklyLoad: string;
      onTarget: string;
      coachAiFlag: string;
      athleteAiSuggest: string;
      planApproved: string;
      basedOnSignals: string;
      approveUpdate: string;
    };
    sessions: {
      title: string;
      liveNow: string;
      nextUp: string;
      workoutTitle: string;
      workoutMeta: string;
      hr: string;
      pace: string;
      load: string;
      chartTitle: string;
      chartSubtitle: string;
      endSession: string;
      startLive: string;
    };
    coach: {
      rosterTitle: string;
      coachTitle: string;
      activeAthletes: string;
      onlineNow: string;
      greenReadiness: string;
      amberReadiness: string;
      sendCheckIn: string;
      messageSent: string;
    };
    inbox: {
      title: string;
      kicker: string;
      planApprovedTitle: string;
      planApprovedBody: string;
      planPendingBody: string;
      approve: string;
      checkInTitle: string;
      checkInSentBody: string;
      checkInPrompt: string;
    };
    profile: {
      title: string;
      athleteKicker: string;
      coachKicker: string;
      athleteName: string;
      coachName: string;
      athleteRole: string;
      coachRole: string;
      streak: string;
      score: string;
    };
    appearance: {
      title: string;
      dark: string;
      light: string;
    };
    accessibility: {
      title: string;
      reduceMotion: string;
      reduceMotionDesc: string;
      highContrast: string;
      highContrastDesc: string;
    };
    security: {
      title: string;
      wearables: string;
      dataExport: string;
      demoNote: string;
    };
    voltline: string;
  };
  trustStrip: {
    reviews: string;
    rejected: string;
    coaches: string;
  };
  featuredCoaches: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    bookIntro: string;
    perHour: string;
    sessions: string;
    verified: string;
    seeAll: string;
  };
  scienceAndTech: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    cta: string;
    tiles: { title: string; body: string }[];
  };
  integrationsStrip: {
    eyebrow: string;
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    syncLabel: string;
    syncDemo: string;
  };
  methodologyPreview: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    title2: string;
    body: string;
    cta: string;
  };
  pressStrip: {
    label: string;
  };
  emailCapture: {
    placeholder: string;
    button: string;
    success: string;
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
    compareNote: string;
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
    about: string;
    careers: string;
    press: string;
    partnerships: string;
    privacy: string;
    terms: string;
    trustSafety: string;
    contact: string;
    stravaAttribution: string;
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
    os: {
      greetingMorning: string;
      greetingAfternoon: string;
      greetingEvening: string;
      greetingLateNight: string;
      titleSuffix: string;
      hrvTrendUp: string;
      hrvTrendDown: string;
      trainHard: string;
      trainSmart: string;
      wearables: string;
      findCoach: string;
      athleteRole: string;
      upgradeTitle: string;
      upgradeBody: string;
      upgradeCta: string;
      quickActions: string;
      findSpecialist: string;
      browsePrograms: string;
      profile: string;
      edit: string;
      sports: string;
      goal90: string;
      wearable: string;
      plan: string;
      navOverview: string;
      navMyCoach: string;
      navPrograms: string;
      navCommunity: string;
      navSettings: string;
    };
    todayPlan: {
      title: string;
      startSession: string;
      noPlan: string;
      approvedBy: string;
    };
    readiness_ring: {
      title: string;
      subtitle: string;
      viewDetails: string;
    };
    map: {
      title: string;
      subtitle: string;
      viewFull: string;
      noToken: string;
    };
    activity_feed: {
      title: string;
      live: string;
      empty: string;
      justNow: string;
      hoursAgo: string;
      daysAgo: string;
    };
    strava_sync: {
      title: string;
      synced: string;
      lastSync: string;
      connect: string;
    };
    pr_tracker: {
      title: string;
      streak: string;
      recent: string;
      weeks: string;
    };
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
    map: {
      title: string;
      nearby: string;
    };
    activity_feed: {
      title: string;
      live: string;
    };
    strava_sync: {
      label: string;
    };
    pr_tracker: {
      label: string;
    };
    readiness_ring: {
      label: string;
    };
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
    navOverview: string;
    navAthletes: string;
    navSessions: string;
    navEarnings: string;
    navSettings: string;
    defaultCoachTitle: string;
    thisMonth: string;
    takeHome: string;
    welcomeBack: string;
    commandCenterTitle: string;
    attentionToday: string;
    live: string;
    notifications: string;
    mrr: string;
    sessionsThisMonth: string;
    retentionRate: string;
    earningsStripeConnect: string;
    rosterMapTitle: string;
    rosterMapSubtitle: string;
    programBuilderTitle: string;
    programBuilderSubtitle: string;
    saveDraft: string;
    saved: string;
    publishProgram: string;
    addBlock: string;
    dragBlock: string;
    minutesShort: string;
    athletePlanLabel: string;
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
    titleSuffix: string;
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
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterDescription: string;
  };
  demoWidgets: {
    readiness: {
      label: string;
      sleep: string;
      hrv: string;
      verdict: string;
      sleepBase: string;
      sleepTarget: string;
      hrvBase: string;
      hrvTarget: string;
      verdictBase: string;
      verdictTarget: string;
      syncLine: string;
    };
    match: {
      header: string;
      subheader: string;
      stepOf: string;
      picked: string;
      foundMatch: string;
      coachName: string;
      coachMeta: string;
      coachBio: string;
      tagStrength: string;
      tagAm: string;
      moreMatches: string;
      q1: string;
      q2: string;
      q3: string;
      optYoga: string;
      optStrength: string;
      optSurf: string;
      optBuildStrength: string;
      optLoseWeight: string;
      optTrainEvent: string;
      optWeekdayAm: string;
      optWeekdayPm: string;
      optWeekends: string;
    };
    coachFlip: {
      header: string;
      flipHint: string;
      coachName: string;
      coachMeta: string;
      reviews: string;
      quote: string;
      chipAthletes: string;
      chipYears: string;
      chipRate: string;
      backTitle: string;
      cert1Title: string;
      cert1Body: string;
      cert2Title: string;
      cert2Body: string;
      programTitle: string;
      programBody: string;
      sessionTitle: string;
      sessionBody: string;
    };
  };
};

export type PartialDict = Partial<{
  [K in keyof Dict]: Dict[K] extends object ? Partial<Dict[K]> : Dict[K];
}>;

export type TFn = <K1 extends keyof Dict, K2 extends keyof Dict[K1]>(
  group: K1,
  key: K2
) => Dict[K1][K2];
