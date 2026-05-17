import type { Dict } from "../types";

export const de = {
  nav: {
    findCoach: "Coach finden",
    programs: "Programme",
    community: "Community",
    methodology: "Methodik",
    pricing: "Preise",
    more: "Mehr",
    dashboard: "Athleten-Dashboard",
    coachDashboard: "Trainer-Dashboard",
    forCoaches: "Für Coaches",
    signIn: "Anmelden",
    matchMe: "In 60 s matchen",
    menu: "Menü",
    homeAria: "FitConnect — Startseite"
  },
  demo: {
    label: "Demo-Modus",
    body: "Seed-Daten, keine echten Buchungen · Anmeldung / Registrierung sind Platzhalter.",
    cta: "Quellcode auf GitHub ansehen"
  },
  hero: {
    livePill: "Live · 12.418 verifizierte Spezialisten in 10 Sportarten",
    title1: "Die besten",
    titleAccent: "Spezialisten",
    title2: "der Welt. Verifiziert. Geprüft. Für dich.",
    subtitle:
      "Vinyasa, BJJ, Klettern, Surfen — jede Sportart, von Menschen, die sie leben. Mit wissenschaftlichen Tools, die sonst Elite-Athleten vorbehalten sind.",
    primary: "Meinen Spezialisten finden",
    secondary: "So prüfen wir Coaches",
    reviewsLine: "27.840 verifizierte Bewertungen",
    rejectedTitle: "62 % abgelehnt",
    rejectedBody: "Nur die besten Spezialisten schaffen es rein"
  },
  sports: {
    eyebrow: "10 Sportarten. 0 Generalisten.",
    title: "Ein Spezialist für jede Disziplin",
    note: "Kachel hover · Live-Zahlen vor 5 Minuten aktualisiert"
  },
  features: {
    eyebrow: "Der komplette Stack",
    title1: "Kein Verzeichnis.",
    titleAccent: "Ein kompletter Trainings-Stack",
    titleAfter: ".",
    subtitle:
      "Wir haben das Personal-Training-Erlebnis um das herum neu gebaut, was Athleten und Coaches für Ergebnisse brauchen. Zwölf Module — und wir liefern weiter.",
    items: [
      {
        title: "Verifizierte Spezialisten",
        body: "Jeder Trainer wird interviewt; Zertifikate prüfen wir beim ausstellenden Verband. Annahmerate 38 %."
      },
      {
        title: "Integrierter HD-Videoraum",
        body: "Remote-Sessions in der App, mit Bildschirmfreigabe, Zeichenwerkzeugen und Auto-Aufnahmen zur Nachbesprechung."
      },
      {
        title: "Intelligente Terminplanung",
        body: "Zwei-Wege-Kalendersync. Auto-Umbuchung. Zeitzonen. Coaches sehen Verfügbarkeit mit einem Tap."
      },
      {
        title: "Stripe Connect Auszahlungen",
        body: "Coaches behalten 85 % — branchenweit am höchsten. Pakete, Abos und Erstattungen erledigt für dich."
      },
      {
        title: "Recovery-bewusstes Coaching",
        body: "HRV und Schlaf von Apple Watch / Garmin / Whoop fließen direkt in den Plan deines Coaches."
      },
      {
        title: "KI-Plananpassungen",
        body: "Schlecht geschlafen? Deine Intervall-Session wird leise zur Z2-Fahrt. Dein Coach gibt frei."
      },
      {
        title: "Echtzeit-Chat",
        body: "Sprachnotizen, Anhänge, Technik-Uploads — privat zwischen dir und deinem Coach."
      },
      {
        title: "Multi-Sport-Athlet",
        body: "Yoga Montag, BJJ Mittwoch, Lauf Samstag — eine Identität, ein einheitlicher Recovery-Score."
      },
      {
        title: "Programmbibliothek",
        body: "84 Markenprogramme von Signature-Coaches. Von über 12.000 Athleten erprobt."
      },
      {
        title: "Kostenloses 15-Min-Intro",
        body: "Jeden Coach risikofrei testen. Jederzeit wechseln. Dein Athletenprofil reist mit."
      },
      {
        title: "Athleten-Community",
        body: "Check-ins, PRs, Vorher/Nachher. Solo trainieren mit Clubhaus-Energie."
      },
      {
        title: "Kontinuierliche Weiterentwicklung",
        body: "Alle zwei Wochen ein Release. Das Produkt im März sieht im Mai besser aus."
      }
    ]
  },
  pricing: {
    eyebrow: "Preise",
    title1: "Ehrliche Preise, niedrige Einstiegshürde.",
    titleAccent: "Keine versteckten Gebühren",
    subtitle:
      "12 €/Monat ist ein Sechzehntel von Future oder Caliber — weil du deinen Coach nur zahlst, wenn du eine Session buchst.",
    perMonth: "/Monat",
    mostPopular: "Am beliebtesten",
    start: "Starten",
    compareAll: "Alle Features, Gebühren und FAQ vergleichen →",
    freeName: "Kostenlos",
    freeDesc: "Trainer entdecken, Bewertungen lesen, Favoriten speichern — für immer kostenlos.",
    athleteName: "Athlet",
    athleteDesc: "Alles für ernsthaften, messbaren Fortschritt.",
    coachName: "Coach",
    coachDesc:
      "Führe dein Coaching-Business aus einer App — behalte 85 % jeder Buchung.",
    features: {
      free: [
        "Unbegrenztes Stöbern",
        "10 Favoriten speichern",
        "Über 27.000 Bewertungen lesen",
        "Coach-Finder-Quiz"
      ],
      athlete: [
        "Unbegrenzte Buchungen",
        "Kostenloses 15-Min-Intro bei jedem Coach",
        "Volles Athleten-Dashboard (HRV, Schlaf, KI)",
        "Zugang zur Programmbibliothek",
        "Priority-Support · Antwort < 2 h"
      ],
      coach: [
        "Bis zu 50 aktive Kunden",
        "Plan-Builder + 600+ Übungsbibliothek",
        "Stripe Connect Auszahlungen",
        "Marketing-Tools + Featured Listings",
        "Trainer-Dashboard + Analytics"
      ]
    }
  },
  faqs: {
    eyebrow: "Fragen, beantwortet",
    title1: "Wir sind gern",
    titleAccent: "konkret",
    subtitle: "Alles, was wir heute Abend wissen wollen würden, wenn wir uns anmeldeten.",
    items: [
      {
        q: "Wie werden Trainer verifiziert?",
        a: "Jeder Trainer lädt Zertifikate hoch, die wir beim ausstellenden Verband prüfen. Außerdem verlangen wir einen Ausweis, ein 30-minütiges Gespräch mit einem Senior-Coach im FitConnect-Team und ein Background-Check vor der Freischaltung. Nur 4 von 10 Bewerbern kommen durch."
      },
      {
        q: "Kann ich remote trainieren?",
        a: "Ja — unser integrierter HD-Videoraum ist bei jeder Buchung kostenlos dabei. Trainer können sich als online, vor Ort oder hybrid markieren. Der Raum nimmt standardmäßig auf, damit du die Technik später prüfen kannst."
      },
      {
        q: "Wie funktionieren Zahlungen?",
        a: "Alle Buchungen laufen über Stripe Connect. Gelder gehen 24 Stunden nach der Session an den Trainer, mit vollen Erstattungsregeln bei fristgerechter Stornierung. Coaches behalten 85 % jeder Buchung — der höchste Netto-Anteil aller Marktplätze."
      },
      {
        q: "Was, wenn ich mit meinem Trainer unzufrieden bin?",
        a: "Jeder Coach bietet ein kostenloses 15-Minuten-Intro, und du kannst jederzeit wechseln. Abos lassen sich pausieren — ohne Fragen — und unser Coach-Match-Team hilft dir innerhalb von 48 Stunden neu zu matchen."
      },
      {
        q: "Unterstützt ihr Multi-Sport-Athleten?",
        a: "Ja — dein Dashboard behandelt dich als einen Athleten über viele Disziplinen. Vinyasa montags, brasilianisches Jiu-Jitsu mittwochs, Intervalle samstags — ein einheitlicher Recovery-Score steuert deine Woche."
      },
      {
        q: "Worin unterscheidet sich FitConnect von Future oder Caliber?",
        a: "Future und Caliber paaren dich mit einem internen Generalisten-Coach. FitConnect ist ein Marktplatz mit 12.000 verifizierten Spezialisten in 10 Sportarten — Yoga, Surfen, BJJ, Klettern — die Plattformen wie Future schlicht nicht abdecken. Du bekommst die menschliche Verbindlichkeit plus echte sportartspezifische Expertise."
      },
      {
        q: "Sieht mein Coach meine Apple Watch / Garmin / Whoop-Daten?",
        a: "Ja, mit deiner ausdrücklichen Erlaubnis. Wir ziehen HRV, Schlaf, Trainingsbelastung und einen Recovery-Score in Grün / Gelb / Rot; dein Coach kann daraus die Session-Intensität ableiten — oder einen Ruhetag empfehlen."
      },
      {
        q: "Gibt es eine kostenlose Option?",
        a: "Ja — der kostenlose Plan lässt dich stöbern, 10 Favoriten speichern und über 27.000 verifizierte Bewertungen lesen. Du zahlst nur, wenn du eine Session buchst oder einem Programm beitrittst."
      }
    ]
  },
  cta: {
    pill: "Frühlings-Kohorte offen — noch 312 Plätze",
    title1: "Dein",
    titleAccent: "stärkstes Jahr",
    title2: "beginnt morgen um 8 Uhr.",
    subtitle:
      "Schließe dich 184.512 Athleten an, die endlich einen Coach fanden, der ihre Sportart wirklich kennt. Kostenlos starten. Jeden Coach kostenlos testen. 12 €/Monat, wenn du bereit bist.",
    primary: "In 60 Sekunden matchen",
    secondary: "Coaching-Services eintragen",
    reassurance:
      "Keine Kreditkarte · Kostenloses 15-Min-Intro bei jedem Coach · Jederzeit kündbar"
  },
  footer: {
    tagline:
      "Der Marktplatz verifizierter Sportspezialisten mit wissenschaftlichen Tools, die sonst Elite-Athleten vorbehalten sind.",
    productHeading: "Produkt",
    companyHeading: "Unternehmen",
    legalHeading: "Rechtliches",
    buildHeading: "Mit uns bauen",
    buildBody:
      "FitConnect ist Teil der Querinoz-Suite. Build-Notes und Roadmap auf GitHub lesen.",
    seeRepo: "Repository ansehen",
    copyright: "In Lissabon gebaut — mit Disziplin, nicht Hype",
    statusOk: "Alle Systeme normal"
  },
  dashboard: {
    eyebrow: "Dein Athleten-OS",
    welcome: "Willkommen zurück, Inês.",
    streak: "Du bist in einer 5-Wochen-PR-Serie — grünes Licht für heute.",
    schedule: "Terminplan",
    startSession: "Heutige Session starten",
    aiSuggestion: "KI-Workout-Vorschlag",
    approvedBy: "Freigegeben von Tomás",
    applyPlan: "Auf Plan anwenden",
    hrvLabel: "HRV (7-Tage-Ø)",
    readinessTitle: "Bereitschaft",
    readinessGreen: "Grün · hart trainieren",
    upcoming: "Kommende Sessions",
    habits: "Tägliche Gewohnheiten",
    messages: "Coach-Nachrichten",
    weeklyVolume: "Wöchentliche Trainingsbelastung",
    monthlyTrend: "Monatstrend",
    sleepRecovery: "Schlaf & Recovery",
    viewAll: "Alle anzeigen",
    online: "Online",
    inPerson: "Vor Ort",
    tomorrow: "Morgen",
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
    welcome: "Willkommen zurück, Marina.",
    streak: "41 aktive Athleten · €4.280 MTD · 94 % 90-Tage-Retention.",
    schedule: "Kalender",
    viewRoster: "Kader anzeigen",
    aiAlert: "Kader-Bereitschaftsalarm",
    aiAlertBody:
      "3 Athleten amber beim HRV. Leichtere Donnerstag-Intervalle vorschlagen — Pläne per Klick senden.",
    reviewPlans: "Vorschläge prüfen",
    activeAthletes: "Aktive Athleten",
    revenueMtd: "Umsatz MTD",
    sessionsWeek: "Sessions diese Woche",
    retention: "90-Tage-Retention",
    rebookRate: "Rebook-Rate",
    weeklyRevenue: "Wochenumsatz",
    athleteRoster: "HRV-Kader",
    upcomingSessions: "Kommende Sessions",
    clientMessages: "Athleten-Nachrichten",
    retentionInsights: "Retention-Insights"
  },
  dashboardPreview: {
    eyebrow: "Produktvorschau",
    title: "Eine Plattform.",
    titleAccent: "Zwei Dashboards.",
    subtitle:
      "Athleten: wissenschaftliche Bereitschaft. Coaches: Umsatz, Kader-HRV und Ein-Klick-Pläne — gleiches Design-System.",
    athleteTab: "Athleten-Dashboard",
    coachTab: "Trainer-Dashboard",
    tabsAria: "Dashboard-Vorschau wechseln",
    athleteCta: "Athleten-Demo öffnen",
    coachCta: "Coach-Demo öffnen",
    floatingTitle: "Gleiches Ökosystem",
    floatingBody: "Daten fließen Athlet → Coach in Echtzeit",
    features: [
      {
        title: "Tägliche Bereitschaft",
        body: "HRV, Schlaf, Muskelkater, Load — ein grün/gelb/rot Score."
      },
      {
        title: "KI-Trainingsvorschläge",
        body: "Coach-Plan automatisch an die Nachtdaten angepasst."
      },
      {
        title: "Schlaf-Korrelation",
        body: "Apple Watch, Garmin oder Whoop — kein Doppel-Logging."
      },
      {
        title: "Coach Business OS",
        body: "Umsatz, Retention, Kader-HRV und Stripe in einer Ansicht."
      }
    ]
  },
  auth: {
    signInHeading: "Willkommen zurück, Athlet.",
    signUpHeading: "Trainiere mit einem echten Spezialisten.",
    signInSubtitle:
      "Melde dich an, um deinen Plan fortzusetzen, deinem Coach zu schreiben und die heutige Bereitschaft zu prüfen.",
    signUpSubtitle:
      "60 Sekunden bis zum echten Coach. Kostenlos stöbern, kostenloses 15-Min-Intro bei jeder Buchung.",
    continueWith: "Weiter mit",
    or: "oder E-Mail nutzen",
    emailLabel: "E-Mail",
    emailPlaceholder: "du@beispiel.de",
    passwordLabel: "Passwort",
    passwordPlaceholder: "Mindestens 8 Zeichen",
    submitSignIn: "Anmelden",
    submitSignUp: "Konto erstellen",
    noAccount: "Neu bei FitConnect?",
    haveAccount: "Bereits ein Konto?",
    createAccount: "Konto erstellen",
    signInLink: "Anmelden",
    legalNote:
      "Mit dem Fortfahren akzeptierst du unsere AGB und erkennst unsere Datenschutzerklärung an. Wir posten nie in deinem Namen.",
    usernameLabel: "Benutzername oder E-Mail",
    usernamePlaceholder: "Admin",
    signInPasswordPlaceholder: "Dein Passwort",
    invalidCredentials: "Benutzername oder Passwort ungültig. Versuche Admin / Admin.",
    alreadySignedIn: "Du hast bereits eine aktive Sitzung.",
    signedInAs: "Angemeldet als {name}",
    continueToDashboard: "Zum Dashboard",
    signOut: "Abmelden",
    bullets: [
      "12.418 verifizierte Spezialisten in 10 Sportarten",
      "Kostenloses 15-Min-Intro bei jedem Coach",
      "HRV- und Schlaf-Bereitschaftssignale ab Tag eins"
    ]
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Fit.Me-Intro senden",
    modalSubtitle:
      "Ein Tap. Wir senden ein 3-zeiliges Intro mit Sport, Level und Ziel. Sie antworten, du antwortest, ihr trainiert.",
    previewLabel: "Nachrichtenvorschau · automatisch erzeugt",
    sendingLabel: "Intro wird gesendet…",
    sentTitle: "Intro gesendet.",
    sentBody:
      "Wir benachrichtigen dich, sobald sie antworten. Die meisten Spezialisten antworten innerhalb von 90 Minuten.",
    sendButton: "Fit.Me senden",
    closeButton: "Fertig",
    poweredBy: "Fit.Me ist FitConnects Ein-Tap-Intro-Aktion.",
    introLines: [
      "Hallo {name}, ich bin Inês — {sport}-Athletin auf Mittelstufe in Lissabon.",
      "Ich suche einen nachhaltigen 8–12-Wochen-Block zu einem klaren Ziel dieses Quartal und dein Ansatz passt.",
      "Frei für ein 15-Min-Intro diese Woche — morgens oder nach der Arbeit. Sag mir, was passt."
    ]
  },
  ai: {
    bubbleLabel: "FitConnect-Assistent öffnen",
    panelTitle: "FitConnect fragen",
    panelSubtitle: "Dein Tag, deine Bereitschaft, deine nächste Session.",
    demoTag: "Demo-Modus · vorgefertigte Antworten",
    placeholder: "Frag alles zu deinem Training…",
    suggestionsHeading: "Probiere eines davon",
    sendLabel: "Senden",
    closeLabel: "Assistent schließen",
    typingLabel: "FitConnect denkt nach…",
    canned: [
      {
        prompt: "Workout für morgen vorschlagen",
        answer:
          "Morgen ist deine Bereitschaft auf 78 (grün) prognostiziert. Mach das geplante 5×5 Kniebeugen mit 82,5 kg, dann 3 Sätze einbeiniger rumänischer Kreuzheben · 12 Wdh. pro Seite. RPE ≤ 8, Kniebeugen stoppen, wenn die Balkengeschwindigkeit > 15 % fällt."
      },
      {
        prompt: "Meinen Bereitschafts-Score erklären",
        answer:
          "Deine Bereitschaft 82 heute kommt aus drei Signalen: HRV 68 ms (+4 vs. 30-Tage-Baseline), Schlaf 7 h 42 min bei 89 % Effizienz, moderate Belastung am Vortag (1.180 kJ). Kurz: du kannst hart trainieren, Session-RPE aber bei 8,5 deckeln."
      },
      {
        prompt: "Surf-Coach in Ericeira finden",
        answer:
          "Bester Match in der Nähe: Hana Okafor — Profi-Surferin, ISA Level 2, 4,99 Sterne bei 96 Bewertungen. Spezialisiert auf Pop-up bis zur ersten grünen Welle plus Wettkampfvorbereitung. 70 €/h, Buchung 7 Tage im Voraus. Soll ich ein Fit.Me-Intro senden?"
      },
      {
        prompt: "Warum fühlte sich Mittwoch so schwer an?",
        answer:
          "Mittwoch fiel HRV auf 49 ms (−9 vs. deine 30-Tage-Baseline) bei 6 h 24 min Schlaf. Die Schwellen-Session wurde korrekt um 12 % von deinem Coach autoreguliert. Der Dip passt zu deinem Dienstag-Mittwoch-Muster — nächste Woche vielleicht eine Z1-Runde."
      }
    ]
  },
  community: {
    celebrationsHeading: "Heutige Feiern",
    celebrationsSub:
      "PRs, erste Sessions und Serien aus der gesamten FitConnect-Community.",
    chip: {
      pr: "Persönlicher Rekord",
      hire: "Neuer Coach",
      streak: "Serie",
      booking: "Erste Session"
    }
  },
  common: {
    skipToContent: "Zum Hauptinhalt springen",
    languageMenu: "Sprache ändern",
    selectLanguage: "Sprache wählen",
    yes: "Ja",
    no: "Nein",
    removeFilter: "Filter entfernen"
  },
  stats: {
    athletes: "Aktive Athleten",
    specialists: "Verifizierte Spezialisten",
    sessions: "Abgeschlossene Sessions",
    countries: "Länder · 6 Kontinente",
    rating: "Durchschnittliche Coach-Bewertung",
    rebook: "Athleten buchen innerhalb von 30 Tagen erneut"
  },
  discover: {
    search: "Suchen",
    searchPlaceholder: "Name, Stadt, Stichwort…",
    sport: "Sportart",
    allSports: "Alle Sportarten",
    modality: "Modalität",
    anyModality: "Beliebig",
    maxPrice: "Max. Preis",
    minExperience: "Min. Erfahrung",
    resetFilters: "Filter zurücksetzen",
    filtersInstant: "Filter werden sofort angewendet",
    filters: "Filter",
    titleAll: "Finde deinen Spezialisten",
    titleSport: "{sport}-Spezialisten",
    loading: "12.418 verifizierte Coaches werden geladen…",
    matchCount: "{count} von 12.418 Spezialisten passen zu deinen Filtern",
    sortBest: "Bester Match",
    sortRating: "Bestbewertet",
    sortPriceAsc: "Preis · aufsteigend",
    sortPriceDesc: "Preis · absteigend",
    emptyTitle: "Keine Spezialisten passen zu diesen Filtern",
    emptyDesc:
      "Probiere eine höhere Preisobergrenze, eine andere Sportart oder entferne die Modalitäts-Einschränkung.",
    handPairTitle: "Suchst du jemand Bestimmtes?",
    handPairBody:
      "Unser Coach-Match-Team paired dich manuell mit bis zu drei Spezialisten in 24 Stunden. Kostenlos, unverbindlich.",
    handPairCta: "Manuelles Matching anfragen",
    upToPrice: "Bis {price} €/h",
    yearsPlus: "{years}+ Jahre"
  },
  trainers: {
    eyebrow: "Ausgewählte Spezialisten",
    title: "Echte Spezialisten.",
    titleAccent: "Echte Ergebnisse.",
    subtitle:
      "Handverlesen aus 12.418 verifizierten Coaches in 10 Sportarten. Ø 10,4 Jahre Coaching, 96 % Kundenbindung.",
    seeAll: "Alle 12.418 ansehen"
  },
  testimonials: {
    eyebrow: "Athleten-Geschichten",
    title: "Echte Coaches. Echter, messbarer",
    titleAccent: "Fortschritt",
    subtitle:
      "Jeder dieser Athleten hat zugestimmt, seine Daten zu teilen. Die Metrik auf jeder Karte ist die tatsächliche Veränderung im FitConnect-Programm."
  },
  how: {
    eyebrow: "So funktioniert's",
    title: "Von der Anmeldung bis zu deinem ersten PR",
    titleAccent: "in unter einer Woche",
    subtitle: "Drei Schritte. Keine Reibung. Keine Karte, um mit einem echten Coach zu sprechen.",
    steps: [
      {
        title: "Erzähl uns deine Ziele",
        body: "60-Sekunden-Profil. Sport, Level, Zeitplan, bevorzugte Modalität. Wir zeigen deine Top-3-Matches unter 12.418 verifizierten Spezialisten.",
        detail: "Ø Match-Zeit: 47 Sekunden"
      },
      {
        title: "Kostenloses 15-Min-Intro buchen",
        body: "Lerne deinen Top-Coach im Live-Call kennen, bevor du zahlst. Jederzeit wechseln — dein Athletenprofil reist mit. Nie wieder Onboarding.",
        detail: "94 % buchen denselben Coach erneut"
      },
      {
        title: "Trainieren, tracken, weiterentwickeln",
        body: "Wochenpläne. Live-Video-Sessions. Workout-Logs. HRV-bewusste Recovery. Sieh dein Dashboard mit PRs leuchten — und deinen Coach in Echtzeit anpassen.",
        detail: "73 % erreichen ihr 90-Tage-Ziel"
      }
    ]
  },
  why: {
    eyebrow: "Warum FitConnect",
    title: "Sechs Fragen, die jeder Athlet stellt",
    titleAccent: "vor der ersten Session",
    subtitle:
      "Wir antworten mit Zahlen, nicht Adjektiven. Die Metriken kommen wöchentlich aus dem Marketplace-Dashboard.",
    points: [
      {
        title: "Verifizierte Spezialisten, keine Generalisten",
        body: "Jeder Coach wird interviewt; jedes Zertifikat wird beim ausstellenden Verband geprüft.",
        metric: "62%",
        metricLabel: "der Bewerber abgelehnt"
      },
      {
        title: "Coaches antworten schneller als dein Chef",
        body: "Median der Erstantwort auf der Plattform — wöchentlich gemessen.",
        metric: "<2h",
        metricLabel: "Ø Coach-Antwortzeit"
      },
      {
        title: "Auf vier echte Spezialgebiete ausgerichtet",
        body: "Kraft, Mobilität, Ausdauer, Recovery — jeder Coach ist in mindestens einem geprüft.",
        metric: "4",
        metricLabel: "Spezial-Spuren"
      },
      {
        title: "Deine Daten, dein Dashboard",
        body: "HRV, Schlaf, Trainingsbelastung — dir gehören sie. Coaches sehen nur, was du freigibst.",
        metric: "100%",
        metricLabel: "athletengesteuerte Berechtigungen"
      },
      {
        title: "Kostenloses Intro bei jedem Coach",
        body: "15 Minuten mit einem Menschen, bevor ein einziger Euro fließt.",
        metric: "94%",
        metricLabel: "buchen denselben Coach erneut"
      },
      {
        title: "85 % Netto für Coaches",
        body: "Höchste Auszahlung auf jedem Spezial-Coaching-Marktplatz. Direkte Stripe-Connect-Einzahlungen.",
        metric: "85%",
        metricLabel: "Coach-Netto-Anteil"
      }
    ]
  },
  demos: {
    eyebrow: "In Aktion sehen",
    title: "Drei Loops, die zeigen, was Training mit",
    titleAccent: "einem echten Spezialisten",
    subtitle:
      "Keine Videos, kein Marketing-Blabla — das sind die echten Interaktionen am ersten Tag.",
    tiles: [
      {
        label: "Tägliche Bereitschaft",
        body: "HRV und Schlaf landen vor Sonnenaufgang im Dashboard. Heute: hart trainieren."
      },
      {
        label: "Echte Spezialisten, keine Generalisten",
        body: "Coach-Karte antippen. Sieh die von uns geprüften Zertifikate und das unterschriebene Programm."
      },
      {
        label: "Match in 60 Sekunden",
        body: "Drei Fragen. Wir matchen dich mit dem richtigen Spezialisten für deine Sportart."
      }
    ],
    ctaTitle: "Bereit für das Echte?",
    ctaBody: "12.418 verifizierte Spezialisten. Kostenloses 15-Min-Intro bei jedem Coach.",
    ctaButton: "Deinen Spezialisten finden"
  },
  comparison: {
    eyebrow: "Plattformen vergleichen",
    title: "Warum Athleten zu",
    titleAccent: "FitConnect",
    subtitle:
      "Future und Caliber sind exzellent — für allgemeines Fitness. FitConnect ist für Athleten mit einer echten Sportart.",
    feature: "Feature"
  },
  quiz: {
    eyebrow: "Coach-Finder",
    title: "Finde deinen Spezialisten in",
    titleAccent: "60 Sekunden",
    subtitle: "Beantworte fünf kurze Fragen. Wir zeigen sofort deine besten Matches.",
    back: "Zurück",
    next: "Weiter",
    seeMatch: "Meinen Match sehen",
    matchTitle: "Dein Top-Match",
    matchSubtitle: "Nach Sport, Zielen und Zeitplan — buche ein kostenloses Intro, um den Fit zu prüfen.",
    bookIntro: "Kostenloses Intro buchen",
    browseAll: "Alle Coaches durchsuchen",
    steps: [
      "Was ist deine Sportart?",
      "Was ist das Ziel?",
      "Wo stehst du gerade?",
      "Wie oft kannst du trainieren?",
      "Wo möchtest du trainieren?"
    ]
  }
};
