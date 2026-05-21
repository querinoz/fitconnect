import type { Dict } from "../types";

export const it = {
  nav: {
    findCoach: "Trova un coach",
    programs: "Programmi",
    community: "Community",
    methodology: "Metodologia",
    pricing: "Prezzi",
    more: "Altro",
    dashboard: "Dashboard atleta",
    coachDashboard: "Dashboard coach",
    forCoaches: "Per i coach",
    signIn: "Accedi",
    matchMe: "Abbinami in 60 s",
    menu: "Menu",
    homeAria: "FitConnect — home"
  },
  demo: {
    label: "Modalità demo",
    body: "Dati di test, nessuna prenotazione reale · accesso / registrazione sono placeholder.",
    cta: "Vedi il codice su GitHub"
  },
  hero: {
    livePill: "Live · 12.418 specialisti verificati in 10 sport",
    tagline: "Sistemi · rilasciati · specialisti verificati",
    title1: "I migliori",
    titleAccent: "specialisti",
    title2: "al mondo. Verificati. Selezionati. Tuoi.",
    subtitle:
      "Vinyasa, BJJ, arrampicata, surf — ogni sport, da chi lo vive. Con strumenti di livello scientifico di solito riservati agli atleti d'élite.",
    primary: "Trova il mio specialista",
    secondary: "Come valutiamo i coach",
    signupCta: "Inizia gratis",
    coachCta: "Diventa coach",
    reviewsLine: "27.840 recensioni verificate",
    rejectedTitle: "62 % rifiutati",
    rejectedBody: "Solo i migliori specialisti entrano",
    reassurance:
      "Intro gratuito di 15 min con ogni coach · €12/mese quando sei pronto",
    demoCta: "Apri demo live",
    fullScreenDemo: "Demo a schermo intero",
    avatarAthleteAlt: "Atleta verificata",
    avatarCoachAlt: "Coach verificato",
    deviceMock: {
      readinessLabel: "Prontezza",
      metricsLine: "HRV 68 ms · Sonno 7h 42m · Carico moderato",
      athleteName: "Inês Silva",
      activityName: "Corsa mattutina",
      coachName: "Tomás Reyes"
    },
    immersive: {
      connect: "connect.",
      train: "train.",
      perform: "perform.",
      scrollHint: "scorri per esplorare",
      tagline: "eleva ogni sessione",
      badge: "creato per atleti in tutto il mondo",
      headline: "la scienza del recupero incontra",
      headlineAccent: "la performance umana",
      exploreMenu: "esplora fitconnect",
      menuLabel: "menu",
      menuAthletes: "athlete os",
      menuCoaches: "coach os",
      menuCommunity: "mappa community",
      menuPricing: "prezzi",
      menuMethodology: "metodologia",
      statAthletes: "+12k atleti",
      statCoaches: "+500 coach",
      statActivities: "+2M attività",
      ctaPrimary: "inizia gratis",
      ctaSecondary: "demo live"
    }
  },
  heroExtras: {
    metricsReadiness: "Prontezza",
    metricsReadinessDelta: "+4 HRV",
    metricsCoachFit: "Match coach",
    metricsCoachFitDelta: "verificato",
    metricsLoad: "Carico",
    metricsLoadDelta: "live",
    cardTitle: "FitConnect diventa il tuo sistema operativo di allenamento.",
    cardBody:
      "Marketplace di coach, intelligenza wearable e feedback live in un unico flusso.",
    liveDemo: "Demo live",
    sportStrength: "Forza",
    sportYoga: "Yoga",
    sportRunning: "Running"
  },
  landingV2: {
    scrollStory: {
      eyebrow: "come funziona",
      title: "una piattaforma.",
      titleAccent: "tre storie.",
      subtitle: "scorri tra flussi atleta, coach e sessione live — cinematico.",
      chapter: "capitolo",
      athletesTitle: "per atleti.",
      athletesBody: "ogni movimento. capisci il tuo corpo. supera i limiti.",
      athletesCta: "apri athlete os",
      coachesTitle: "per coach.",
      coachesBody: "roster. programmi. crescita atleti.",
      coachesCta: "apri coach os",
      togetherTitle: "insieme.",
      togetherBody: "sessioni in tempo reale. feedback live.",
      togetherCta: "esplora community",
      footerHint: "pronto quando lo sei tu",
      footerCta: "inizia gratis"
    }
  },
  downloadSection: {
    eyebrow: "Mobile-first",
    title: "Allenati dalla tasca",
    subtitle:
      "Installa FitConnect come PWA per dashboard offline, alert push e sync live col coach.",
    installApp: "Installa app",
    openLiveDemo: "Apri demo live",
    tryMobileDemo: "Prova demo mobile"
  },
  mobileApp: {
    launcher: {
      badge: "Demo app mobile",
      titleDesktop: "Anteprima dell'app prima di accedere.",
      subtitleDesktop:
        "Passa tra le viste atleta e coach, poi avvia la demo live con un tap.",
      titleMobile: "Scegli la vista dell'app da aprire.",
      subtitleMobile:
        "Questi pulsanti accedono agli account demo e aprono le reali route della dashboard mobile con dock inferiore.",
      athleteTitle: "Dashboard atleta",
      athleteSubtitle: "Prontezza, piano di oggi, sessione live e aggiornamenti del coach.",
      coachTitle: "Dashboard coach",
      coachSubtitle: "Prontezza del roster, alert IA e follow-up atleti.",
      openAthlete: "Apri app atleta",
      openCoach: "Apri app coach",
      useAnotherAccount: "Usa un altro account",
      backHomeAria: "Torna a FitConnect",
      metaTitle: "Demo app mobile — FitConnect",
      metaDescription:
        "Anteprima FitConnect su iPhone con dashboard atleta e coach."
    },
    nav: {
      today: "Oggi",
      sessions: "Sessioni",
      map: "Mappa",
      coach: "Coach",
      roster: "Roster",
      inbox: "Posta in arrivo",
      profile: "Profilo",
      ariaLabel: "Navigazione app anteprima"
    },
    header: {
      athleteEyebrow: "Athlete OS",
      coachEyebrow: "Coach OS",
      athleteGreeting: "Buongiorno, Inês",
      coachGreeting: "Buon pomeriggio, Diego",
      syncBadge: "Whoop sincronizzato",
      syncAgo: "12 s fa"
    },
    today: {
      readiness: "Prontezza IA",
      rosterGreen: "Roster verde",
      trainHard: "Allenati forte",
      startSession: "Avvia sessione",
      returnToLive: "Torna al live",
      hrv: "HRV",
      amberAlerts: "alert ambra",
      msDelta: "+4 ms",
      streak: "Serie",
      personalBest: "record personale",
      sleep: "Sonno",
      sleepQuality: "89% qualità",
      load: "Carico",
      sevenDay: "7 giorni",
      weeklyLoad: "Carico settimanale",
      onTarget: "In obiettivo",
      coachAiFlag: "L'IA ha segnalato 3 atleti per un giovedì più leggero.",
      athleteAiSuggest: "L'IA suggerisce di spostare la soglia a giovedì.",
      planApproved: "Aggiornamento piano approvato",
      basedOnSignals: "In base a HRV, sonno e carico dell'ultima sessione.",
      approveUpdate: "Approva aggiornamento"
    },
    sessions: {
      title: "Sessioni",
      liveNow: "In diretta",
      nextUp: "Prossima",
      workoutTitle: "Forza parte inferiore",
      workoutMeta: "45 min · coach Diego · RPE target 7",
      hr: "FC",
      pace: "Ritmo",
      load: "Carico",
      chartTitle: "Curva strain live",
      chartSubtitle: "FC, ritmo e carico",
      endSession: "Termina sessione",
      startLive: "Avvia sessione live"
    },
    coach: {
      rosterTitle: "Roster",
      coachTitle: "Coach Diego",
      activeAthletes: "41 atleti attivi",
      onlineNow: "Online ora",
      greenReadiness: "Prontezza verde",
      amberReadiness: "Prontezza ambra",
      sendCheckIn: "Invia check-in",
      messageSent: "Messaggio inviato"
    },
    inbox: {
      title: "Posta in arrivo",
      kicker: "Aggiornamenti in tempo reale",
      planApprovedTitle: "Aggiornamento piano approvato",
      planApprovedBody: "Soglia di giovedì spostata. Il coach ha l'aggiornamento.",
      planPendingBody: "L'IA consiglia un giovedì più leggero in base al recupero.",
      approve: "Approva",
      checkInTitle: "Check-in del coach",
      checkInSentBody: "La tua nota è visibile nell'anteprima dell'app.",
      checkInPrompt: "Com'è andata l'ultima serie?"
    },
    profile: {
      title: "Profilo",
      athleteKicker: "Profilo atleta",
      coachKicker: "Profilo coach",
      athleteName: "Inês Martins",
      coachName: "Diego Alvarez",
      athleteRole: "Atleta ibrida · Lisbona",
      coachRole: "Coach forza · Madrid",
      streak: "Serie",
      score: "Punteggio"
    },
    appearance: {
      title: "Aspetto",
      dark: "Scuro",
      light: "Chiaro"
    },
    accessibility: {
      title: "Accessibilità",
      reduceMotion: "Riduci movimento",
      reduceMotionDesc: "Transizioni più calme in tutta l'app",
      highContrast: "Alto contrasto",
      highContrastDesc: "Testo e bordi delle card più marcati"
    },
    security: {
      title: "Sicurezza e privacy",
      wearables: "Gestisci wearable connessi",
      dataExport: "Esportazione dati e controlli privacy",
      demoNote:
        "Solo controlli demo — collegare alle impostazioni reali dell'account in produzione."
    },
    voltline: "Voltline"
  },
  trustStrip: {
    reviews: "4,94 ★ · 27k+ verifizierte Bewertungen",
    rejected: "62 % der Bewerbungen abgelehnt",
    coaches: "12.418 verifizierte Coaches"
  },
  featuredCoaches: {
    eyebrow: "Featured Coaches",
    title: "Trainiere mit",
    titleAccent: "Elite-Spezialisten",
    subtitle:
      "Certifications vérifiées, avis réels, intro gratuite de 15 min avec chaque coach.",
    bookIntro: "Kostenloses Intro buchen",
    perHour: "/Stunde",
    sessions: "séances",
    verified: "Vérifié",
    seeAll: "Alle Coaches ansehen"
  },
  scienceAndTech: {
    eyebrow: "Wissenschaft & Technologie",
    title: "Labor-Tools für",
    titleAccent: "jeden Athleten",
    subtitle:
      "KI-Bereitschaft, HRV, webhooks Strava et séances live — pas un annuaire avec chat.",
    cta: "Methodik lesen",
    tiles: [
      {
        title: "Score de préparation IA",
        body: "HRV, sommeil, strain et charge fusionnés en un seul indicateur de confiance pour votre coach."
      },
      {
        title: "Webhooks Strava",
        body: "Activités synchronisées en secondes — sans polling ni tableaux de bord obsolètes."
      },
      {
        title: "Sitzungen live",
        body: "Salle vidéo HD avec overlay FC et relances coach en temps réel."
      },
      {
        title: "Gestion de charge",
        body: "Ajustements automatiques quand la récupération baisse — le coach approuve en un tap."
      }
    ]
  },
  integrationsStrip: {
    eyebrow: "Verbundene Daten",
    title: "Verbinden · Trainieren · Entwickeln",
    subtitle:
      "Strava, Garmin, Apple Health, Whoop et Oura alimentent votre score de préparation.",
    step1: "Wearables verbinden",
    step2: "Synchroniser les activités automatiquement",
    step3: "Coach sieht das Gesamtbild",
    syncLabel: "Mit Strava synchronisiert",
    syncDemo: "vor 2 Min."
  },
  methodologyPreview: {
    eyebrow: "The Specialist Standard™",
    title1: "Nous n'avons pas construit un marketplace. Nous avons construit un",
    titleAccent: "Verifizierungssystem",
    title2: "gebaut, das zufällig einer ist.",
    body: "Six principes séparent un vrai spécialiste de quelqu'un avec une page web. Nous les exigeons de tous nos coaches.",
    cta: "Methodik lesen complète"
  },
  pressStrip: {
    label: "Coaches und Athleten erwähnt in"
  },
  emailCapture: {
    placeholder: "du@email.com",
    button: "Frühzugang",
    success: "Vous êtes sur la liste — vérifiez votre boîte mail."
  },
  sports: {
    eyebrow: "10 sport. 0 generalisti.",
    title: "Uno specialista per ogni disciplina",
    note: "Passa il mouse · conteggi live aggiornati 5 minuti fa"
  },
  features: {
    eyebrow: "Lo stack completo",
    title1: "Non è una directory.",
    titleAccent: "È un intero ecosistema di allenamento",
    titleAfter: ".",
    subtitle:
      "Abbiamo ricostruito l'esperienza del personal training intorno a ciò che atleti e coach servono per ottenere risultati. Dodici moduli — e continuiamo a rilasciare.",
    items: [
      {
        title: "Specialisti verificati",
        body: "Ogni trainer viene intervistato e validiamo le certificazioni presso l'ente emittente. Tasso di accettazione del 38 %."
      },
      {
        title: "Sala video HD integrata",
        body: "Sessioni remote nell'app, con condivisione schermo, strumenti di disegno e registrazioni automatiche per la revisione."
      },
      {
        title: "Pianificazione intelligente",
        body: "Sincronizzazione bidirezionale del calendario. Riprenotazione automatica. Fusi orari. I coach vedono la disponibilità con un tap."
      },
      {
        title: "Pagamenti Stripe Connect",
        body: "I coach trattengono l'85 % — il più alto del settore. Pacchetti, abbonamenti e rimborsi gestiti per te."
      },
      {
        title: "Coaching attento al recupero",
        body: "HRV e sonno da Apple Watch / Garmin / Whoop arrivano direttamente nel piano del tuo coach."
      },
      {
        title: "Aggiustamenti piano con IA",
        body: "Sonno scarso ieri? La sessione a intervalli diventa silenziosamente un giro in Z2. Il tuo coach approva."
      },
      {
        title: "Chat in tempo reale",
        body: "Note vocali, allegati, video tecnica — privato tra te e il tuo coach."
      },
      {
        title: "Atleta multi-sport",
        body: "Yoga lunedì, BJJ mercoledì, corsa sabato — un'identità, un punteggio di recupero unificato."
      },
      {
        title: "Libreria programmi",
        body: "84 programmi di marca di coach di riferimento. Testati da oltre 12.000 atleti."
      },
      {
        title: "Chiamata intro gratuita di 15 min",
        body: "Prova ogni coach senza rischi. Cambia quando vuoi. Il tuo profilo atleta ti segue."
      },
      {
        title: "Community atleti",
        body: "Check-in, PR, prima/dopo. Allena da solo con l'energia di un club."
      },
      {
        title: "Evoluzione continua",
        body: "Rilascio ogni due settimane. Il prodotto di marzo è migliore a maggio."
      }
    ]
  },
  pricing: {
    eyebrow: "Prezzi",
    title1: "Prezzi onesti, soglia bassa.",
    titleAccent: "Nessuna sorpresa",
    subtitle:
      "12 €/mese è un sedicesimo di quanto chiedono Future o Caliber — perché paghi il coach solo quando prenoti una sessione.",
    perMonth: "/mese",
    mostPopular: "Più popolare",
    start: "Inizia",
    compareAll: "Confronta tutte le funzioni, commissioni e FAQ →",
    freeName: "Gratis",
    freeDesc: "Scopri trainer, leggi recensioni, salva preferiti — gratis per sempre.",
    athleteName: "Atleta",
    athleteDesc: "Tutto ciò che serve per progressi seri e misurabili.",
    coachName: "Coach",
    coachDesc:
      "Gestisci il tuo business di coaching da un'unica app — trattieni l'85 % di ogni prenotazione.",
    compareNote:
      "vs Trainerize (~50 €/mese) e TrueCoach (~35 €/mese) — paghi il coach solo quando prenoti.",
    features: {
      free: [
        "Navigazione illimitata",
        "Salva 10 preferiti",
        "Leggi oltre 27.000 recensioni",
        "Quiz per trovare un coach"
      ],
      athlete: [
        "Prenotazioni illimitate",
        "Intro gratuita di 15 min con ogni coach",
        "Dashboard atleta completa (HRV, sonno, IA)",
        "Accesso alla libreria programmi",
        "Supporto prioritario · risposta < 2 h"
      ],
      coach: [
        "Fino a 50 clienti attivi",
        "Costruttore piani + libreria di 600+ esercizi",
        "Pagamenti Stripe Connect",
        "Strumenti marketing + inserzioni in evidenza",
        "Dashboard trainer + analytics"
      ]
    }
  },
  faqs: {
    eyebrow: "Domande, risposte",
    title1: "Ci piace essere",
    titleAccent: "specifici",
    subtitle: "Tutto ciò che vorremmo sapere se ci iscrivessimo stasera.",
    items: [
      {
        q: "Come vengono verificati i trainer?",
        a: "Ogni trainer carica certificazioni che validiamo presso l'ente emittente. Richiediamo anche documento d'identità, un colloquio di 30 minuti con un coach senior del team FitConnect e un controllo dei precedenti prima dell'attivazione. Solo 4 candidati su 10 passano."
      },
      {
        q: "Posso fare sessioni da remoto?",
        a: "Sì — la nostra sala video HD integrata è inclusa gratis in ogni prenotazione. I trainer possono indicarsi online, in presenza o ibridi. La sala registra di default per rivedere la tecnica dopo."
      },
      {
        q: "Come funzionano i pagamenti?",
        a: "Tutte le prenotazioni passano da Stripe Connect. I fondi vanno al trainer 24 ore dopo la sessione, con regole di rimborso complete se annulli entro i termini. I coach trattengono l'85 % di ogni prenotazione — il netto più alto di qualsiasi marketplace."
      },
      {
        q: "E se non sono soddisfatto del mio trainer?",
        a: "Ogni coach offre una chiamata intro gratuita di 15 minuti e puoi cambiare trainer in qualsiasi momento. Gli abbonamenti si possono mettere in pausa — senza domande — e il nostro team Coach Match ti aiuterà a trovarne un altro entro 48 ore."
      },
      {
        q: "Supportate atleti multi-sport?",
        a: "Sì — la dashboard ti tratta come un unico atleta su più discipline. Vinyasa lunedì, jiu-jitsu brasiliano mercoledì, intervalli sabato — un punteggio di recupero unificato guida la settimana."
      },
      {
        q: "In cosa FitConnect differisce da Future o Caliber?",
        a: "Future e Caliber ti abbinano a un coach generalista interno. FitConnect è un marketplace di 12.000 specialisti verificati in 10 sport — yoga, surf, BJJ, arrampicata — che piattaforme come Future semplicemente non coprono. Ottieni la responsabilità umana che offrono, più vera expertise sportiva."
      },
      {
        q: "Il mio coach può vedere i dati Apple Watch / Garmin / Whoop?",
        a: "Sì, con il tuo permesso esplicito. Estraiamo HRV, sonno, carico di allenamento e un punteggio di recupero verde / ambra / rosso; il coach può usarlo per suggerire l'intensità della sessione — o consigliare un giorno di riposo."
      },
      {
        q: "Esiste un'opzione gratuita?",
        a: "Sì — il piano gratuito ti permette di navigare, salvare 10 preferiti e leggere oltre 27.000 recensioni verificate. Paghi solo quando prenoti una sessione o ti unisci a un programma."
      }
    ]
  },
  cta: {
    pill: "Coorte primaverile aperta — 312 posti rimasti",
    title1: "Il tuo",
    titleAccent: "anno più forte",
    title2: "inizia domani alle 8.",
    subtitle:
      "Unisciti a 184.512 atleti che hanno finalmente trovato un coach che conosce davvero il loro sport. Gratis per iniziare. Gratis per provare ogni coach. 12 €/mese quando sei pronto.",
    primary: "Abbinami in 60 secondi",
    secondary: "Pubblica i tuoi servizi di coaching",
    reassurance:
      "Nessuna carta di credito · Intro gratuita di 15 min con ogni coach · Annulla quando vuoi"
  },
  footer: {
    tagline:
      "Il marketplace di specialisti sportivi verificati con strumenti di livello scientifico di solito riservati agli atleti d'élite.",
    productHeading: "Prodotto",
    companyHeading: "Azienda",
    legalHeading: "Legale",
    buildHeading: "Costruisci con noi",
    buildBody:
      "FitConnect fa parte della suite Querinoz. Leggi le note di build e la roadmap su GitHub.",
    seeRepo: "Vedi il repository",
    copyright: "Costruito a Lisbona con disciplina, non hype",
    statusOk: "Tutti i sistemi operativi",
    about: "Chi siamo",
    careers: "Carriere",
    press: "Stampa",
    partnerships: "Partnership",
    privacy: "Privacy",
    terms: "Termini",
    trustSafety: "Fiducia e sicurezza",
    contact: "Contatto",
    stravaAttribution:
      "Dati attività Strava mostrati con permesso. Powered by Strava."
  },
  dashboard: {
    eyebrow: "Il tuo OS atleta",
    welcome: "Bentornata, Inês.",
    streak: "Sei in una serie di PR di 5 settimane — via libera per spingere oggi.",
    schedule: "Agenda",
    startSession: "Avvia la sessione di oggi",
    aiSuggestion: "Suggerimento workout IA",
    approvedBy: "Approvato da Tomás",
    applyPlan: "Applica al piano",
    hrvLabel: "HRV (media 7 giorni)",
    readinessTitle: "Prontezza",
    readinessGreen: "Verde · allenamento intenso",
    upcoming: "Prossime sessioni",
    habits: "Abitudini quotidiane",
    messages: "Messaggi del coach",
    weeklyVolume: "Carico settimanale",
    monthlyTrend: "Trend mensile",
    sleepRecovery: "Sonno e recupero",
    viewAll: "Vedi tutto",
    online: "Online",
    inPerson: "In presenza",
    tomorrow: "Domani",
    coachPlanTitle: "Piano del tuo coach",
    coachPlanSubtitle:
      "Prescritto dal tuo specialista — gli aggiornamenti si sincronizzano col coach in tempo reale.",
    wearableSyncHint:
      "Sincronizza il wearable per sbloccare gli aggiustamenti IA del coach.",
    noAthleteProfile:
      "Nessun profilo atleta su questo account. Accedi come Athlete / Athlete per la demo.",
    os: {
      greetingMorning: "Buongiorno 👋",
      greetingAfternoon: "Buon pomeriggio 👋",
      greetingEvening: "Buonasera 👋",
      greetingLateNight: "Notte fonda 👋",
      titleSuffix: "Athlete OS di {name}",
      hrvTrendUp: "HRV +{delta} ms vs baseline.",
      hrvTrendDown: "HRV −{delta} ms vs baseline.",
      trainHard: "Allenati forte oggi.",
      trainSmart: "Allenati con intelligenza oggi.",
      wearables: "Wearables",
      findCoach: "Trova un coach",
      athleteRole: "Atleta · {tier}",
      upgradeTitle: "Passa ad Athlete",
      upgradeBody: "HRV, insight IA e dashboard completa.",
      upgradeCta: "Inizia — €12/mese",
      quickActions: "Azioni rapide",
      findSpecialist: "Trova uno specialista",
      browsePrograms: "Sfoglia programmi",
      profile: "Profilo",
      edit: "Modifica",
      sports: "Sport",
      goal90: "Obiettivo 90 giorni",
      wearable: "Wearable",
      plan: "Piano",
      navOverview: "Panoramica",
      navMyCoach: "Il mio coach",
      navPrograms: "Programmi",
      navCommunity: "Community",
      navSettings: "Impostazioni"
    },
    todayPlan: {
      title: "Piano di oggi",
      startSession: "Avvia sessione di oggi",
      noPlan: "Nessun piano assegnato.",
      approvedBy: "Approvato da {coach}"
    },
    readiness_ring: {
      title: "Prontezza",
      subtitle: "HRV · sonno · carico",
      viewDetails: "Vedi dettagli"
    },
    map: {
      title: "Mappa attività",
      subtitle: "Percorsi, coach e spot di allenamento vicini",
      viewFull: "Apri mappa completa",
      noToken: "OpenFreeMap · OpenStreetMap"
    },
    activity_feed: {
      title: "Feed attività",
      live: "Live",
      empty: "Nessuna attività recente.",
      justNow: "Adesso",
      hoursAgo: "{hours}h fa",
      daysAgo: "{days}g fa"
    },
    strava_sync: {
      title: "Sync Strava",
      synced: "Sincronizzato",
      lastSync: "Ultima sync {time}",
      connect: "Connetti Strava"
    },
    pr_tracker: {
      title: "Tracker PR",
      streak: "Serie PR di {weeks} settimane",
      recent: "PR recente",
      weeks: "settimane"
    }
  },
  hub: {
    mobileNav: "Navigazione dashboard",
    yourCoach: "Il tuo coach",
    wearableSync: "Apple · Garmin · Whoop",
    sessionsMonth: "Sessioni questo mese",
    hoursTrained: "Ore di allenamento",
    prStreak: "Serie PR",
    personalBest: "Record personale",
    goalCompletion: "Progresso obiettivo",
    roster: "Roster",
    monitor: "Monitora",
    backToRoster: "Torna al roster",
    monitorAthlete: "Monitor atleta",
    readiness: "Prontezza",
    recoveryNotes: "Note recupero e piano",
    noPlanYet: "Nessun piano assegnato.",
    sendRecoveryNudge: "Invia promemoria recupero",
    athleteNotFound: "Atleta non trovato nel tuo roster.",
    map: {
      title: "Mappa attività",
      nearby: "Allenamento vicino"
    },
    activity_feed: {
      title: "Feed live",
      live: "Live"
    },
    strava_sync: {
      label: "Strava"
    },
    pr_tracker: {
      label: "PRs"
    },
    readiness_ring: {
      label: "Prontezza"
    }
  },
  coachDashboard: {
    eyebrow: "Coach OS",
    welcome: "Bentornata, Marina.",
    streak: "41 atleti attivi · €4.280 MTD · 94% retention 90 gg.",
    schedule: "Calendario",
    viewRoster: "Vedi roster",
    aiAlert: "Allerta readiness roster",
    aiAlertBody:
      "3 atleti in ambra sull'HRV. Suggerire interval più leggeri giovedì — piani pre-redatti con un tap.",
    reviewPlans: "Rivedi suggerimenti",
    activeAthletes: "Atleti attivi",
    revenueMtd: "Ricavi MTD",
    sessionsWeek: "Sessioni questa settimana",
    retention: "Retention 90 gg",
    rebookRate: "Tasso di rebook",
    weeklyRevenue: "Ricavi settimanali",
    athleteRoster: "Roster HRV",
    upcomingSessions: "Prossime sessioni",
    clientMessages: "Messaggi atleti",
    retentionInsights: "Insight retention",
    navOverview: "Panoramica",
    navAthletes: "Atleti",
    navSessions: "Sessioni",
    navEarnings: "Guadagni",
    navSettings: "Impostazioni",
    defaultCoachTitle: "Specialista ciclismo",
    thisMonth: "Questo mese",
    takeHome: "netto",
    welcomeBack: "Bentornato 👋",
    commandCenterTitle: "Centro di comando coach",
    attentionToday: "{count} atleta ha bisogno della tua attenzione oggi.",
    live: "Live",
    notifications: "Notifiche",
    mrr: "MRR",
    sessionsThisMonth: "Sessioni questo mese",
    retentionRate: "Tasso di retention",
    earningsStripeConnect: "Guadagni e Stripe Connect",
    rosterMapTitle: "Mappa roster",
    rosterMapSubtitle: "{count} atleti nelle tue zone di coaching",
    programBuilderTitle: "Program builder",
    programBuilderSubtitle: "Trascina i blocchi per riordinare il template sessione",
    saveDraft: "Salva bozza",
    saved: "Salvato",
    publishProgram: "Pubblica",
    addBlock: "Aggiungi blocco",
    dragBlock: "Trascina per riordinare",
    minutesShort: " min",
    athletePlanLabel: "Atleta di {name}"
  },
  dashboardPreview: {
    eyebrow: "Anteprima prodotto",
    title: "Una piattaforma.",
    titleAccent: "Due dashboard.",
    subtitle:
      "Atleti: readiness da laboratorio. Coach: ricavi, HRV del roster e suggerimenti con un tap — stesso design system.",
    athleteTab: "Dashboard atleta",
    coachTab: "Dashboard coach",
    tabsAria: "Cambia anteprima dashboard",
    athleteCta: "Apri demo atleta",
    coachCta: "Apri demo coach",
    floatingTitle: "Stesso ecosistema",
    floatingBody: "I dati fluiscono atleta → coach in tempo reale",
    features: [
      {
        title: "Readiness giornaliera",
        body: "HRV, sonno, DOMS, carico — un punteggio verde/ambra/rosso."
      },
      {
        title: "Suggerimenti IA",
        body: "Piano del coach adattato ai dati della notte."
      },
      {
        title: "Correlazione sonno",
        body: "Apple Watch, Garmin o Whoop — niente doppio log."
      },
      {
        title: "Coach business OS",
        body: "Ricavi, retention, HRV roster e Stripe in un'unica vista."
      }
    ]
  },
  auth: {
    signInHeading: "Bentornato, atleta.",
    signUpHeading: "Inizia ad allenarti con uno specialista vero.",
    signInSubtitle:
      "Accedi per riprendere il piano, scrivere al coach e controllare la prontezza di oggi.",
    signUpSubtitle:
      "60 secondi per un coach vero. Naviga gratis, intro gratuita di 15 min su ogni prenotazione.",
    continueWith: "Continua con",
    or: "oppure usa l'e-mail",
    emailLabel: "E-mail",
    emailPlaceholder: "tu@esempio.it",
    passwordLabel: "Password",
    passwordPlaceholder: "Almeno 8 caratteri",
    submitSignIn: "Accedi",
    submitSignUp: "Crea account",
    noAccount: "Nuovo su FitConnect?",
    haveAccount: "Hai già un account?",
    createAccount: "Creane uno",
    signInLink: "Accedi",
    legalNote:
      "Continuando accetti i nostri Termini e riconosci l'Informativa sulla privacy. Non pubblichiamo mai per tuo conto.",
    usernameLabel: "Username o e-mail",
    usernamePlaceholder: "Admin",
    signInPasswordPlaceholder: "La tua password",
    invalidCredentials: "Username o password non validi. Prova Admin / Admin.",
    alreadySignedIn: "Hai già una sessione attiva.",
    signedInAs: "Accesso come {name}",
    continueToDashboard: "Vai alla dashboard",
    signOut: "Esci",
    bullets: [
      "12.418 specialisti verificati in 10 sport",
      "Intro gratuita di 15 min con ogni coach",
      "Segnali di prontezza HRV + sonno dal primo giorno"
    ]
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Invia un'intro Fit.Me",
    modalSubtitle:
      "Un tap. Inviamo un'intro di 3 righe con sport, livello e obiettivo. Loro rispondono, tu rispondi, vi allenate.",
    previewLabel: "Anteprima messaggio · generata automaticamente",
    sendingLabel: "Invio intro…",
    sentTitle: "Intro inviata.",
    sentBody:
      "Ti avviseremo appena rispondono. La maggior parte degli specialisti risponde entro 90 minuti.",
    sendButton: "Invia Fit.Me",
    closeButton: "Fatto",
    poweredBy: "Fit.Me è l'azione intro con un tap di FitConnect.",
    introLines: [
      "Ciao {name}, sono Inês — atleta {sport} livello intermedio a Lisbona.",
      "Cerco un blocco sostenibile di 8–12 settimane verso un obiettivo chiaro questo trimestre e il tuo approccio calza.",
      "Libera per un'intro di 15 min questa settimana — mattine o dopo lavoro. Dimmi cosa ti va bene."
    ]
  },
  ai: {
    bubbleLabel: "Apri l'assistente FitConnect",
    panelTitle: "Chiedi a FitConnect",
    panelSubtitle: "La tua giornata, la tua prontezza, la prossima sessione.",
    demoTag: "Modalità demo · risposte predefinite",
    placeholder: "Chiedi qualsiasi cosa sul tuo allenamento…",
    suggestionsHeading: "Prova una di queste",
    sendLabel: "Invia",
    closeLabel: "Chiudi assistente",
    typingLabel: "FitConnect sta pensando…",
    canned: [
      {
        prompt: "Suggerisci il workout di domani",
        answer:
          "Domani la prontezza è prevista a 78 (verde). Esegui il 5×5 squat posteriore pianificato a 82,5 kg, poi chiudi con 3 serie di stacco rumeno monopodalico · 12 rep per lato. Mantieni RPE ≤ 8 e ferma gli squat se la velocità del bilanciere cala oltre il 15 %."
      },
      {
        prompt: "Spiega il mio punteggio di prontezza",
        answer:
          "La prontezza 82 di oggi deriva da tre segnali: HRV 68 ms (+4 vs media 30 giorni), sonno 7 h 42 min all'89 % di efficienza, carico moderato del giorno prima (1.180 kJ). In sintesi: puoi allenarti forte, ma limita l'RPE di sessione a 8,5."
      },
      {
        prompt: "Trovami un coach di surf a Ericeira",
        answer:
          "Miglior match vicino: Hana Okafor — surfista pro, ISA Livello 2, 4,99 stelle su 96 recensioni. Specialista da pop-up alla prima onda verde e prep gara. 70 €/h, prenota con 7 giorni di anticipo. Invio un'intro Fit.Me?"
      },
      {
        prompt: "Perché mercoledì è stato così pesante?",
        answer:
          "Mercoledì l'HRV è sceso a 49 ms (−9 vs la media a 30 giorni) con 6 h 24 min di sonno. La sessione a soglia è stata correttamente autoregolata al −12 % dal coach. Il calo combacia con il pattern martedì-mercoledì — prova un giro Z1 la prossima settimana."
      }
    ]
  },
  community: {
    celebrationsHeading: "Celebrazioni di oggi",
    celebrationsSub:
      "PR, prime sessioni e serie da tutta la community FitConnect.",
    chip: {
      pr: "Record personale",
      hire: "Nuovo coach",
      streak: "Serie",
      booking: "Prima sessione"
    }
  },
  common: {
    skipToContent: "Vai al contenuto principale",
    languageMenu: "Cambia lingua",
    selectLanguage: "Seleziona lingua",
    yes: "Sì",
    no: "No",
    removeFilter: "Rimuovi filtro"
  },
  stats: {
    athletes: "Atleti attivi",
    specialists: "Specialisti verificati",
    sessions: "Sessioni completate",
    countries: "Paesi · 6 continenti",
    rating: "Valutazione media coach",
    rebook: "Atleti che riprenotano entro 30 giorni"
  },
  discover: {
    search: "Cerca",
    searchPlaceholder: "Nome, città, parola chiave…",
    sport: "Sport",
    allSports: "Tutti gli sport",
    modality: "Modalità",
    anyModality: "Qualsiasi",
    maxPrice: "Prezzo max.",
    minExperience: "Esperienza min.",
    resetFilters: "Reimposta filtri",
    filtersInstant: "I filtri si applicano subito",
    filters: "Filtri",
    titleAll: "Trova il tuo specialista",
    titleSport: "Specialisti {sport}",
    loading: "Caricamento di 12.418 coach verificati…",
    matchCount: "{count} su 12.418 specialisti corrispondono ai filtri",
    sortBest: "Miglior match",
    sortRating: "Più votati",
    sortPriceAsc: "Prezzo · crescente",
    sortPriceDesc: "Prezzo · decrescente",
    emptyTitle: "Nessuno specialista corrisponde a quei filtri",
    emptyDesc:
      "Prova un tetto di prezzo più alto, uno sport diverso o rimuovi il vincolo di modalità.",
    handPairTitle: "Cerchi qualcuno di specifico?",
    handPairBody:
      "Il team Coach Match ti abbina manualmente a fino a tre specialisti in 24 ore. Gratis, senza impegno.",
    handPairCta: "Richiedi abbinamento manuale",
    upToPrice: "Fino a {price} €/h",
    yearsPlus: "{years}+ anni"
  },
  trainers: {
    eyebrow: "Specialisti in evidenza",
    title: "Specialisti veri.",
    titleAccent: "Risultati veri.",
    subtitle:
      "Selezionati tra 12.418 coach verificati in 10 sport. Media 10,4 anni di coaching, 96 % di retention clienti.",
    seeAll: "Vedi tutti i 12.418"
  },
  testimonials: {
    eyebrow: "Storie di atleti",
    title: "Coach veri. Progressi",
    titleAccent: "misurabili",
    subtitle:
      "Ognuno di questi atleti ha scelto di condividere i dati. La metrica su ogni card è il cambiamento reale tracciato durante il programma FitConnect."
  },
  how: {
    eyebrow: "Come funziona",
    title: "Dalla registrazione al tuo primo PR",
    titleAccent: "in meno di una settimana",
    subtitle: "Tre passi. Zero attrito. Nessuna carta per parlare con un coach vero.",
    steps: [
      {
        title: "Raccontaci i tuoi obiettivi",
        body: "Profilo in 60 secondi. Sport, livello, orari, modalità preferita. Mostriamo i tuoi 3 migliori match tra 12.418 specialisti verificati.",
        detail: "Tempo medio di match: 47 secondi"
      },
      {
        title: "Prenota un'intro gratuita di 15 min",
        body: "Incontra il coach top in chiamata live prima di pagare. Cambia quando vuoi — il profilo atleta ti segue. Mai più onboarding da zero.",
        detail: "94 % riprenota lo stesso coach"
      },
      {
        title: "Allena, traccia, evolvi",
        body: "Piani settimanali. Sessioni video live. Log di allenamento. Recupero con HRV. Guarda la dashboard illuminarsi di PR — e il coach adattarsi in tempo reale.",
        detail: "73 % raggiunge l'obiettivo a 90 giorni"
      }
    ]
  },
  why: {
    eyebrow: "Perché FitConnect",
    title: "Sei cose che ogni atleta chiede",
    titleAccent: "prima della prima sessione",
    subtitle:
      "Rispondiamo con numeri, non aggettivi. Le metriche arrivano dalla dashboard marketplace aggiornata ogni settimana.",
    points: [
      {
        title: "Specialisti verificati, non generalisti",
        body: "Ogni coach viene intervistato; ogni certificato è verificato presso l'ente emittente.",
        metric: "62%",
        metricLabel: "di candidature rifiutate"
      },
      {
        title: "I coach rispondono più in fretta del capo",
        body: "Tempo mediano di risposta al primo messaggio sulla piattaforma — misurato ogni settimana.",
        metric: "<2h",
        metricLabel: "tempo medio risposta coach"
      },
      {
        title: "Costruito su quattro specialità reali",
        body: "Forza, mobilità, resistenza, recupero — ogni coach è valutato in almeno una.",
        metric: "4",
        metricLabel: "percorsi di specialità"
      },
      {
        title: "I tuoi dati, la tua dashboard",
        body: "HRV, sonno, carico — sono tuoi. I coach vedono solo ciò che autorizzi.",
        metric: "100%",
        metricLabel: "permessi controllati dall'atleta"
      },
      {
        title: "Intro gratuita, ogni coach",
        body: "Parla 15 minuti con una persona reale prima che si muova un solo euro.",
        metric: "94%",
        metricLabel: "riprenotano lo stesso coach"
      },
      {
        title: "85 % netto per i coach",
        body: "Il payout più alto su qualsiasi marketplace di coaching specializzato. Depositi diretti Stripe Connect.",
        metric: "85%",
        metricLabel: "quota netta coach"
      }
    ]
  },
  demos: {
    eyebrow: "Guardalo in azione",
    title: "Tre loop che mostrano allenarsi con",
    titleAccent: "uno specialista vero",
    titleSuffix: "sembra.",
    subtitle:
      "Niente video, niente marketing vuoto — sono le interazioni reali del primo giorno.",
    tiles: [
      {
        label: "Prontezza quotidiana",
        body: "HRV e sonno arrivano in dashboard prima dell'alba. Oggi dice: allenamento intenso."
      },
      {
        label: "Specialisti veri, non generalisti",
        body: "Tocca una card coach. Vedi i certificati validati e il programma firmato."
      },
      {
        label: "Match in 60 secondi",
        body: "Tre domande. Ti abbiniamo allo specialista giusto per il tuo sport."
      }
    ],
    ctaTitle: "Pronto per il vero?",
    ctaBody: "12.418 specialisti verificati. Intro gratuita di 15 min con ogni coach.",
    ctaButton: "Trova il tuo specialista"
  },
  comparison: {
    eyebrow: "Confronta piattaforme",
    title: "Perché gli atleti passano a",
    titleAccent: "FitConnect",
    subtitle:
      "Future e Caliber sono eccellenti — per il fitness generale. FitConnect è fatto per atleti con uno sport vero.",
    feature: "Funzione"
  },
  quiz: {
    eyebrow: "Trova coach",
    title: "Trova il tuo specialista in",
    titleAccent: "60 secondi",
    subtitle: "Rispondi a cinque domande rapide. Mostriamo subito i migliori match.",
    back: "Indietro",
    next: "Avanti",
    seeMatch: "Vedi il mio match",
    matchTitle: "Il tuo top match",
    matchSubtitle: "In base a sport, obiettivi e orari — prenota un'intro gratuita per confermare l'affinità.",
    bookIntro: "Prenota intro gratuita",
    browseAll: "Sfoglia tutti i coach",
    steps: [
      "Qual è il tuo sport?",
      "Qual è l'obiettivo?",
      "Dove sei adesso?",
      "Quanto spesso puoi allenarti?",
      "Dove vuoi allenarti?"
    ]
  },
  communityFeed: {
    eyebrow: "Community",
    title: "Der Club, online.",
    subtitle:
      "Athleten feiern PRs, echte Fragen, Vorher/Nachher. Spezialisten-Coaches schauen vorbei. Keine Like-Ökonomie.",
    shareCta: "Check-in teilen",
    searchPlaceholder: "Feed durchsuchen…",
    activityType: "Aktivitätstyp",
    sport: "Sport",
    allSports: "Alle Sportarten",
    liveActivity: "Live-Aktivität",
    trendingClubs: "Trend-Clubs",
    upcomingMeetups: "Kommende Treffen",
    join: "Beitreten",
    members: "Mitglieder",
    going: "nehmen teil",
    emptyTitle: "Noch keine Beiträge",
    emptyDesc:
      "Filter erweitern oder als Erster mit dieser Kombination posten.",
    kinds: {
      all: "Tous",
      pr: "PR",
      checkin: "Check-in",
      beforeAfter: "Vorher/Nachher",
      race: "Wettkampf",
      question: "Frage"
    },
    stats: {
      postsToday: "Beiträge heute",
      prsWeek: "PRs diese Woche",
      activeClubs: "Aktive Clubs"
    }
  },
  programsPage: {
    eyebrow: "Programmbibliothek",
    titleLine1: "84 Signatur-Programme.",
    titleAccent: "Geschrieben von den Coaches, die sie leiten.",
    subtitle:
      "Testés, fondés sur les preuves, avec RPE. Chaque programme inclut des check-ins hebdomadaires et des mises à jour à vie.",
    featuredBadge: "Featured",
    weeks: "Wochen",
    athletesJoined: "Athleten beigetreten",
    joinProgram: "Beitreten le programme",
    seeSampleWeek: "Beispielwoche ansehen",
    searchPlaceholder: "Programme suchen…",
    allSports: "Alle Sportarten",
    emptyTitle: "Keine Programme passen zu diesen Filtern",
    emptyDesc: "Anderen Sport probieren oder Niveau-Filter entfernen.",
    browseAll: "Alle Programme durchsuchen",
    levels: {
      all: "Tous",
      beginner: "Anfänger",
      intermediate: "Fortgeschritten",
      advanced: "Experte"
    }
  },
  pricingPage: {
    eyebrow: "Preise",
    title: "Ehrliche Preise für",
    titleAccent: "ehrliches Training",
    subtitle:
      "12 €/Monat pour la plateforme. Le tarif de votre coach est celui qu'il fixe. Pas de frais cachés. Pas de contrat de 12 mois. Mettez en pause quand vous en avez besoin.",
    monthly: "Monatlich",
    annual: "Jährlich",
    saveBadge: "25 % sparen",
    perMonth: "/Monat",
    billedAnnually: "jährlich abgerechnet",
    sessionRatesTitle: "Preise de séance typiques par sport",
    sessionRatesSubtitle:
      "Les coaches fixent leurs tarifs. Voici les médianes du marketplace.",
    sport: "Sport",
    from: "Ab",
    typical: "Typisch",
    premium: "Premium",
    faqTitle: "Frages sur les tarifs",
    faqSubtitle: "Klare Antworten. Keine Verkaufsskripte.",
    plans: {
      free: {
        name: "Kostenlos",
        desc: "Découvrez les coaches, lisez 27 000+ avis, enregistrez des favoris.",
        cta: "Kostenlos starten",
        features: [
          "Navigation illimitée",
          "10 favoris",
          "Quiz coach",
          "Tous les avis",
          "Support par e-mail"
        ]
      },
      athlete: {
        name: "Athlet",
        desc: "Tout pour des progrès sérieux. Payez les séances en plus.",
        cta: "Commencer Athlet",
        features: [
          "Réservations illimitées",
          "Intro gratuite de 15 min avec chaque coach",
          "Tableau complet (HRV, sommeil, entraînement IA)",
          "Programmbibliothek + mises à jour",
          "Support prioritaire · < 2 h",
          "Réservations conscientes de la récupération",
          "Community et clubs"
        ]
      },
      team: {
        name: "Team",
        desc: "Pour les familles, clubs et partenaires d'entraînement.",
        cta: "Commencer Team",
        features: [
          "Jusqu'à 5 profils athlète",
          "Calendrier partagé",
          "Réduction sur les séances de groupe (-15 %)",
          "Facturation familiale",
          "Tout du plan Athlet"
        ]
      },
      coach: {
        name: "Coach",
        desc: "Gérez votre activité dans une app. Behalte 85 %.",
        cta: "Als Coach bewerben",
        features: [
          "Jusqu'à 50 clients actifs",
          "Créateur de plans + 600 exercices",
          "Paiements Stripe Connect",
          "Marketing et annonces en vedette",
          "Analytiques et rétention",
          "Sitzungen de groupe",
          "Page coach personnalisée"
        ]
      }
    },
    reassurance: [
      {
        title: "Intro gratuite de 15 min",
        body: "Avec chaque coach. Votre profil athlète vous suit si vous changez."
      },
      {
        title: "Pas de contrat de 12 mois",
        body: "Mettez en pause quand vous voulez. Nous ne facturons pas ce que vous n'utilisez pas."
      },
      {
        title: "Revenu net honnête",
        body: "Les coaches gardent 85 % — le revenu net le plus élevé du marché."
      }
    ],
    faqs: [
      {
        q: "Pourquoi les frais de plateforme sont-ils si bas vs Future ou Caliber ?",
        a: "Future et Caliber incluent un coach dans le prix mensuel fixe. FitConnect facture 12 €/Monat et vous choisissez le coach à son tarif horaire — beaucoup d'athlètes paient 30 à 60 % de moins."
      },
      {
        q: "Prenez-vous une commission sur les coaches ?",
        a: "Oui — 15 %. Les coaches gardent 85 %, le revenu net le plus élevé du marché."
      },
      {
        q: "Que se passe-t-il si mon coach annule ?",
        a: "Remboursement intégral + 25 % de crédit. Nouveau match sous 48 h."
      },
      {
        q: "Puis-je annuler à tout moment ?",
        a: "Oui. L'abonnement se met en pause immédiatement ; vous gardez l'accès jusqu'à la fin du cycle."
      }
    ]
  },
  coachLanding: {
    eyebrow: "Für Spezialisten-Coaches",
    title: "Coache deinen Sport.",
    titleAccent: "Behalte 85 %.",
    subtitle:
      "Marketplace pour athlètes vérifiés et conscients de la récupération. Médiane de 3 420 €/Monat en 90 jours.",
    applyCta: "Jetzt bewerben",
    seeEarnings: "Coach-Einnahmen ansehen",
    perks: [
      {
        title: "Gardez 85 % de chaque réservation",
        body: "Revenu net leader — nous publions le P&L."
      },
      {
        title: "Vidéo HD et planning gratuits",
        body: "Studio intégré, sans Zoom, avec enregistrement."
      },
      {
        title: "Paiements Stripe Connect",
        body: "Fonds sur votre compte 24 h après la séance."
      },
      {
        title: "Mis en avant pour 184 512 athlètes",
        body: "Marketing inclus. Vedettes méritées."
      },
      {
        title: "Plans et bibliothèque d'exercices",
        body: "600+ exercices, blocs personnalisés."
      },
      {
        title: "Badge coach vérifié",
        body: "Specialist Standard™. Les athlètes le remarquent."
      }
    ],
    earningsTitle: "Ce que vous pouvez",
    earningsTitleAccent: "vraiment gagner",
    earningsSubtitle:
      "Médiane et top 10 % des revenus bruts mensuels selon l'ancienneté sur la plateforme.",
    cohortMonths: "Mois {range}",
    median: "médiane",
    top10: "top 10 %",
    voicesTitle: "Histoires de coaches",
    voicesSubtitle: "Spécialistes sur la plateforme aujourd'hui.",
    stats: {
      activeCoaches: "Coaches actifs",
      avgTakeHome: "Revenu net moyen",
      coachNps: "NPS coaches"
    },
    earningsBullets: [
      "Pas de frais sur les intros gratuites",
      "Rabais de 9 % pour ≥ 60 h/Monat",
      "Vedettes gagnées sur la rétention, pas achetées"
    ],
    earningsSource:
      "Quelle: cohorte active Q1 2026, revenus bruts (vérifiés Stripe).",
    floatingMedian: "3 420 € / mois",
    floatingMedianSub: "Médiane au mois 4",
    floatingAthletes: "+12 nouveaux athlètes",
    floatingAthletesSub: "Cette semaine · auto-match",
    voices: [
      {
        name: "Marina Costa",
        role: "Yoga · Lisbonne",
        quote:
          "Je suis passée de 6 à 41 athlètes en cinq mois. Ce sont des gens qui s'entraînent vraiment."
      },
      {
        name: "Tomás Reyes",
        role: "Powerlifting · Madrid",
        quote: "Je garde 52 € sur chaque 60 € — pas 30 €."
      },
      {
        name: "Diego Almeida",
        role: "Marathon · Porto",
        quote: "Je lis les tendances HRV au lieu de demander comment s'est passée la semaine."
      }
    ],
    onboardingEyebrow: "Onboarding",
    onboardingTitle: "Trois étapes. Quatorze jours.",
    onboardingTitleAccent: "En ligne.",
    onboardingSteps: [
      {
        title: "Candidature en 12 minutes",
        body: "Sport, certifications, vidéo, planning.",
        detail: "01"
      },
      {
        title: "Entretien de 30 min",
        body: "Technique, philosophie de programmation et éthique.",
        detail: "02"
      },
      {
        title: "Activation du profil",
        body: "Credentials vérifiés. Vedette les 90 premiers jours.",
        detail: "03"
      }
    ]
  },
  methodologyPage: {
    eyebrow: "The Specialist Standard™",
    title: "La méthodologie derrière chaque",
    titleAccent: "coach FitConnect.",
    subtitle:
      "Six principes que chaque coach doit valider avant que les athlètes voient son profil — et les preuves derrière.",
    pillarsTitle: "Die sechs Säulen lesen",
    pillarOf: "Säule {n} von {total}",
    sourceLabel: "Quelle:",
    evidenceEyebrow: "Die Evidenz",
    evidenceTitle: "Die Wissenschaft, auf die wir setzen",
    evidenceSubtitle:
      "Nous sommes un marketplace, pas un labo. Ces principes façonnent entretiens et approbation de programmes.",
    evidence: [
      {
        title: "Distribution polarisée",
        citation: "Seiler & Tønnessen, 2009",
        body: "80 % facile / 20 % intense — schéma chez l'endurance d'élite."
      },
      {
        title: "Entraînement guidé par le HRV",
        citation: "Vesterinen et al., 2016",
        body: "Ajustements par HRV avec gains égaux ou supérieurs aux plans fixes."
      },
      {
        title: "Spécificité de la compétence",
        citation: "Schmidt & Lee, 2019",
        body: "Le transfert entre sports est faible. Les généralistes ne remplacent pas les spécialistes."
      },
      {
        title: "Autorégulation via RPE",
        citation: "Helms et al., 2016",
        body: "Le RPE produit une hypertrophie équivalente avec une meilleure adhérence."
      }
    ],
    quote:
      "Ein Generalist macht dich fit. Ein Spezialist bringt dich dorthin, wo du hinwillst.",
    quoteAuthor: "Diego Almeida, Sub-2:25-Marathonläufer & FitConnect-Coach",
    stats: {
      interviewed: "Coaches interviewt 2026",
      accepted: "Coaches angenommen",
      acceptanceRate: "Annahmequote"
    },
    auditNote: "Daten von externem Audit-Team geprüft, Q1 2026"
  },
  methodologyPillars: [
    {
      title: "Spezialist, kein Generalist",
      subtitle: "Coaches, die einen Sport leben",
      body: "Les plans génériques plafonnent à la huitième semaine. Nos coaches s'engagent sur une ou deux disciplines.",
      metricLabel: "Expérience moyenne",
      metricValue: "10,4 ans",
      citation: "Roster FitConnect 2026, n=12 418"
    },
    {
      title: "Erholungsbewusste Programmierung",
      subtitle: "HRV + sommeil guident chaque séance",
      body: "Le tableau lit HRV, FC au repos et sommeil. Le signal de préparation arrive au coach en temps réel.",
      metricLabel: "Blessures vs. contrôle",
      metricValue: "−41 %",
      citation: "Étude interne, 1 840 athlètes, 2025-26"
    },
    {
      title: "Echte Verifizierung",
      subtitle: "Certifications validées",
      body: "Chaque certificat est vérifié. Entretien de 30 min. 38 % de candidats refusés.",
      metricLabel: "Taux de refus",
      metricValue: "62 %",
      citation: "Onboarding 2026, Trust & Safety"
    },
    {
      title: "Sichtbarer Fortschritt",
      subtitle: "Le tableau athlète dit la vérité",
      body: "Allure, puissance, HRV, RPE, sommeil — au même endroit.",
      metricLabel: "Objectifs atteints à temps",
      metricValue: "73 %",
      citation: "Cohorte 2026 S1"
    },
    {
      title: "Kostenloses Intro, immer",
      subtitle: "Ne payez jamais avant d'avoir parlé à un humain",
      body: "Appel de 15 min sur chaque profil avant le premier euro.",
      metricLabel: "Changement sous 30 jours",
      metricValue: "<5 %",
      citation: "Analyse de churn 2026"
    },
    {
      title: "Multi-Sport, eine Identität",
      subtitle: "Vinyasa lundi, BJJ mercredi, intervalles samedi",
      body: "Nous vous modélisons comme un athlète sur plusieurs disciplines. La récupération compte tout.",
      metricLabel: "Utilisateurs multi-sport",
      metricValue: "61 %",
      citation: "Analyse utilisateurs 2026"
    }
  ]
};
