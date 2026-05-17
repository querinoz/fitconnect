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
    title1: "I migliori",
    titleAccent: "specialisti",
    title2: "al mondo. Verificati. Selezionati. Tuoi.",
    subtitle:
      "Vinyasa, BJJ, arrampicata, surf — ogni sport, da chi lo vive. Con strumenti di livello scientifico di solito riservati agli atleti d'élite.",
    primary: "Trova il mio specialista",
    secondary: "Come valutiamo i coach",
    reviewsLine: "27.840 recensioni verificate",
    rejectedTitle: "62 % rifiutati",
    rejectedBody: "Solo i migliori specialisti entrano"
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
    statusOk: "Tutti i sistemi operativi"
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
    coachPlanTitle: "Coach plan for you",
    coachPlanSubtitle:
      "Prescribed by your specialist — updates sync to your coach in real time."
  },
  hub: {
    mobileNav: "Dashboard navigation",
    yourCoach: "Your coach",
    wearableSync: "Apple · Garmin · Whoop",
    sessionsMonth: "Sessions this month",
    hoursTrained: "Hours trained",
    prStreak: "PR streak",
    personalBest: "Personal best",
    goalCompletion: "Goal progress",
    roster: "Athlete roster",
    monitor: "Monitor",
    backToRoster: "Back to roster",
    monitorAthlete: "Athlete monitor",
    readiness: "Readiness",
    recoveryNotes: "Recovery & plan notes",
    noPlanYet: "No plan assigned yet.",
    sendRecoveryNudge: "Send recovery nudge",
    athleteNotFound: "Athlete not found in your roster."
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
    retentionInsights: "Insight retention"
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
  }
};
