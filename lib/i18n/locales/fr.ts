import type { Dict } from "../types";

export const fr = {
  nav: {
    findCoach: "Trouver un coach",
    programs: "Programmes",
    community: "Communauté",
    methodology: "Méthodologie",
    pricing: "Tarifs",
    more: "Plus",
    dashboard: "Tableau de bord athlète",
    coachDashboard: "Tableau de bord coach",
    forCoaches: "Pour les coaches",
    signIn: "Se connecter",
    matchMe: "Me matcher en 60 s",
    menu: "Menu",
    homeAria: "FitConnect — accueil"
  },
  demo: {
    label: "Mode démo",
    body: "Données de test, pas de vraies réservations · connexion / inscription sont des placeholders.",
    cta: "Voir le code sur GitHub"
  },
  hero: {
    livePill: "En direct · 12 418 spécialistes vérifiés dans 10 sports",
    title1: "Les meilleurs",
    titleAccent: "spécialistes",
    title2: "du monde. Vérifiés. Évalués. À vous.",
    subtitle:
      "Vinyasa, BJJ, escalade, surf — chaque sport, par ceux qui le vivent. Avec des outils de niveau scientifique habituellement réservés aux athlètes universitaires d'élite.",
    primary: "Trouver mon spécialiste",
    secondary: "Comment nous évaluons les coaches",
    reviewsLine: "27 840 avis vérifiés",
    rejectedTitle: "62 % refusés",
    rejectedBody: "Seuls les meilleurs spécialistes sont acceptés"
  },
  sports: {
    eyebrow: "10 sports. 0 généralistes.",
    title: "Un spécialiste pour chaque discipline",
    note: "Survolez une tuile · compteurs en direct mis à jour il y a 5 minutes"
  },
  features: {
    eyebrow: "La stack complète",
    title1: "Pas un annuaire.",
    titleAccent: "Toute une stack d'entraînement",
    titleAfter: ".",
    subtitle:
      "Nous avons reconstruit l'expérience du coaching personnel autour de ce dont athlètes et coaches ont besoin pour obtenir des résultats. Douze modules — et nous continuons à livrer.",
    items: [
      {
        title: "Spécialistes vérifiés",
        body: "Chaque entraîneur est interviewé et nous validons les certifications auprès de l'organisme émetteur. Taux d'acceptation de 38 %."
      },
      {
        title: "Salle vidéo HD intégrée",
        body: "Sessions à distance dans l'app, avec partage d'écran, outils de dessin et enregistrements automatiques pour révision."
      },
      {
        title: "Planning intelligent",
        body: "Synchronisation bidirectionnelle du calendrier. Reprogrammation automatique. Fuseaux horaires. Les coaches voient les disponibilités en un tap."
      },
      {
        title: "Paiements Stripe Connect",
        body: "Les coaches gardent 85 % — le plus élevé du secteur. Packs, abonnements et remboursements gérés pour vous."
      },
      {
        title: "Coaching conscient de la récupération",
        body: "HRV et sommeil depuis Apple Watch / Garmin / Whoop arrivent directement dans le plan de votre coach."
      },
      {
        title: "Ajustements de plan par IA",
        body: "Mauvaise nuit ? Votre séance d'intervalles devient discrètement une sortie en Z2. Votre coach valide."
      },
      {
        title: "Chat en temps réel",
        body: "Notes vocales, pièces jointes, vidéos de technique — privé entre vous et votre coach."
      },
      {
        title: "Athlète multi-sport",
        body: "Yoga lundi, BJJ mercredi, course samedi — une identité, un score de récupération unifié."
      },
      {
        title: "Bibliothèque de programmes",
        body: "84 programmes de marque par des coaches signature. Testés par plus de 12 000 athlètes."
      },
      {
        title: "Appel intro gratuit de 15 min",
        body: "Essayez chaque coach sans risque. Changez quand vous voulez. Votre profil athlète vous suit."
      },
      {
        title: "Communauté d'athlètes",
        body: "Check-ins, PR, avant/après. Entraînez-vous seul avec l'énergie d'un club."
      },
      {
        title: "Évolution continue",
        body: "Livraison toutes les deux semaines. Le produit de mars est meilleur en mai."
      }
    ]
  },
  pricing: {
    eyebrow: "Tarifs",
    title1: "Tarifs honnêtes, seuil bas.",
    titleAccent: "Sans frais cachés",
    subtitle:
      "12 €/mois, soit un seizième de ce que facturent Future ou Caliber — car vous ne payez votre coach que lorsque vous réservez une séance.",
    perMonth: "/mois",
    mostPopular: "Le plus populaire",
    start: "Commencer",
    compareAll: "Comparer toutes les fonctionnalités, frais et FAQ →",
    freeName: "Gratuit",
    freeDesc: "Découvrez les entraîneurs, lisez les avis, enregistrez vos favoris — gratuit pour toujours.",
    athleteName: "Athlète",
    athleteDesc: "Tout ce qu'il faut pour des progrès sérieux et mesurables.",
    coachName: "Coach",
    coachDesc:
      "Gérez votre activité de coaching depuis une seule app — gardez 85 % de chaque réservation.",
    features: {
      free: [
        "Navigation illimitée",
        "Enregistrer 10 favoris",
        "Lire plus de 27 000 avis",
        "Quiz pour trouver un coach"
      ],
      athlete: [
        "Réservations illimitées",
        "Intro gratuite de 15 min avec chaque coach",
        "Tableau de bord athlète complet (HRV, sommeil, IA)",
        "Accès à la bibliothèque de programmes",
        "Support prioritaire · réponse < 2 h"
      ],
      coach: [
        "Jusqu'à 50 clients actifs",
        "Créateur de plans + bibliothèque de 600+ exercices",
        "Paiements Stripe Connect",
        "Outils marketing + annonces en vedette",
        "Tableau de bord coach + analytiques"
      ]
    }
  },
  faqs: {
    eyebrow: "Questions, réponses",
    title1: "Nous aimons être",
    titleAccent: "précis",
    subtitle: "Tout ce que nous voudrions savoir si nous nous inscrivions ce soir.",
    items: [
      {
        q: "Comment les entraîneurs sont-ils vérifiés ?",
        a: "Chaque entraîneur télécharge des certifications que nous validons auprès de l'organisme émetteur. Nous exigeons aussi une pièce d'identité, un entretien de 30 minutes avec un coach senior de l'équipe FitConnect et une vérification des antécédents avant activation. Seuls 4 candidats sur 10 sont retenus."
      },
      {
        q: "Puis-je faire des séances à distance ?",
        a: "Oui — notre salle vidéo HD intégrée est incluse gratuitement avec chaque réservation. Les entraîneurs peuvent se déclarer en ligne, en présentiel ou hybride. La salle enregistre par défaut pour réviser la technique ensuite."
      },
      {
        q: "Comment fonctionnent les paiements ?",
        a: "Toutes les réservations passent par Stripe Connect. Les fonds sont versés à l'entraîneur 24 heures après la séance, avec des règles de remboursement complètes si vous annulez dans le délai prévu. Les coaches gardent 85 % de chaque réservation — le revenu net le plus élevé de tout marketplace."
      },
      {
        q: "Et si je ne suis pas satisfait de mon entraîneur ?",
        a: "Chaque coach propose un appel intro gratuit de 15 minutes et vous pouvez changer d'entraîneur à tout moment. Les abonnements peuvent être mis en pause — sans questions — et notre équipe Coach Match vous aidera à trouver un nouveau binôme sous 48 heures."
      },
      {
        q: "Prenez-vous en charge les athlètes multi-sport ?",
        a: "Oui — votre tableau de bord vous traite comme un seul athlète sur plusieurs disciplines. Vinyasa lundi, jiu-jitsu brésilien mercredi, intervalles samedi, et un score de récupération unifié guide votre semaine."
      },
      {
        q: "En quoi FitConnect diffère-t-il de Future ou Caliber ?",
        a: "Future et Caliber vous associent à un coach généraliste interne. FitConnect est un marketplace de 12 000 spécialistes vérifiés dans 10 sports — yoga, surf, BJJ, escalade — que des plateformes comme Future ne couvrent tout simplement pas. Vous gardez la responsabilité humaine qu'ils offrent, plus une vraie expertise sportive."
      },
      {
        q: "Mon coach peut-il voir mes données Apple Watch / Garmin / Whoop ?",
        a: "Oui, avec votre permission explicite. Nous récupérons HRV, sommeil, charge d'entraînement et un score de récupération vert / ambre / rouge, et votre coach peut l'utiliser pour suggérer l'intensité de séance — ou recommander un jour de repos."
      },
      {
        q: "Existe-t-il une option gratuite ?",
        a: "Oui — le plan gratuit permet de naviguer, enregistrer 10 favoris et lire plus de 27 000 avis vérifiés. Vous ne payez que lorsque vous réservez une séance ou rejoignez un programme."
      }
    ]
  },
  cta: {
    pill: "Cohorte de printemps ouverte — 312 places restantes",
    title1: "Votre",
    titleAccent: "meilleure année",
    title2: "commence demain à 8 h.",
    subtitle:
      "Rejoignez 184 512 athlètes qui ont enfin trouvé un coach qui connaît vraiment leur sport. Gratuit pour commencer. Gratuit pour essayer chaque coach. 12 €/mois quand vous êtes prêt.",
    primary: "Me matcher en 60 secondes",
    secondary: "Publier vos services de coaching",
    reassurance:
      "Sans carte bancaire · Intro gratuite de 15 min avec chaque coach · Résiliation à tout moment"
  },
  footer: {
    tagline:
      "Le marketplace de spécialistes sportifs vérifiés avec les outils de niveau scientifique habituellement réservés aux athlètes universitaires d'élite.",
    productHeading: "Produit",
    companyHeading: "Entreprise",
    legalHeading: "Mentions légales",
    buildHeading: "Construire avec nous",
    buildBody:
      "FitConnect fait partie de la suite Querinoz. Consultez nos notes de build et la feuille de route sur GitHub.",
    seeRepo: "Voir le dépôt",
    copyright: "Conçu à Lisbonne avec discipline, pas du hype",
    statusOk: "Tous les systèmes opérationnels"
  },
  dashboard: {
    eyebrow: "Votre OS athlète",
    welcome: "Bon retour, Inês.",
    streak: "Vous êtes sur une série de PR de 5 semaines — feu vert pour pousser aujourd'hui.",
    schedule: "Planning",
    startSession: "Démarrer la séance du jour",
    aiSuggestion: "Suggestion d'entraînement IA",
    approvedBy: "Approuvé par Tomás",
    applyPlan: "Appliquer au plan",
    hrvLabel: "HRV (moy. 7 jours)",
    readinessTitle: "Préparation",
    readinessGreen: "Vert · entraînement intense",
    upcoming: "Séances à venir",
    habits: "Habitudes quotidiennes",
    messages: "Messages du coach",
    weeklyVolume: "Charge hebdomadaire",
    monthlyTrend: "Tendance mensuelle",
    sleepRecovery: "Sommeil et récupération",
    viewAll: "Tout voir",
    online: "En ligne",
    inPerson: "En présentiel",
    tomorrow: "Demain",
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
    welcome: "Bon retour, Marina.",
    streak: "41 athlètes actifs · €4 280 MTD · 94 % rétention 90 j.",
    schedule: "Calendrier",
    viewRoster: "Voir le roster",
    aiAlert: "Alerte préparation du roster",
    aiAlertBody:
      "3 athlètes en ambre sur le HRV. Proposer des intervalles plus légers jeudi — plans pré-rédigés en un clic.",
    reviewPlans: "Voir les suggestions",
    activeAthletes: "Athlètes actifs",
    revenueMtd: "Revenus MTD",
    sessionsWeek: "Séances cette semaine",
    retention: "Rétention 90 j.",
    rebookRate: "Taux de rebook",
    weeklyRevenue: "Revenus hebdo",
    athleteRoster: "Roster HRV",
    upcomingSessions: "Séances à venir",
    clientMessages: "Messages athlètes",
    retentionInsights: "Insights rétention"
  },
  dashboardPreview: {
    eyebrow: "Aperçu produit",
    title: "Une plateforme.",
    titleAccent: "Deux tableaux de bord.",
    subtitle:
      "Athlètes : préparation de niveau labo. Coaches : revenus, HRV du roster et suggestions en un clic — même design system.",
    athleteTab: "Tableau athlète",
    coachTab: "Tableau coach",
    tabsAria: "Changer l'aperçu du tableau de bord",
    athleteCta: "Ouvrir la démo athlète",
    coachCta: "Ouvrir la démo coach",
    floatingTitle: "Même écosystème",
    floatingBody: "Les données circulent athlète → coach en temps réel",
    features: [
      {
        title: "Préparation quotidienne",
        body: "HRV, sommeil, courbatures, charge — un score vert/ambre/rouge."
      },
      {
        title: "Suggestions IA",
        body: "Plan du coach ajusté aux données de la nuit."
      },
      {
        title: "Corrélation sommeil",
        body: "Apple Watch, Garmin ou Whoop — sans double saisie."
      },
      {
        title: "Coach business OS",
        body: "Revenus, rétention, HRV roster et paiements Stripe en une vue."
      }
    ]
  },
  auth: {
    signInHeading: "Bon retour, athlète.",
    signUpHeading: "Commencez à vous entraîner avec un vrai spécialiste.",
    signInSubtitle:
      "Connectez-vous pour reprendre votre plan, écrire à votre coach et consulter la préparation du jour.",
    signUpSubtitle:
      "60 secondes pour un vrai coach. Navigation gratuite, intro gratuite de 15 min à chaque réservation.",
    continueWith: "Continuer avec",
    or: "ou utiliser l'e-mail",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Au moins 8 caractères",
    submitSignIn: "Se connecter",
    submitSignUp: "Créer un compte",
    noAccount: "Nouveau sur FitConnect ?",
    haveAccount: "Vous avez déjà un compte ?",
    createAccount: "En créer un",
    signInLink: "Se connecter",
    legalNote:
      "En continuant, vous acceptez nos Conditions et reconnaissez notre Politique de confidentialité. Nous ne publions jamais en votre nom.",
    usernameLabel: "Nom d'utilisateur ou e-mail",
    usernamePlaceholder: "Admin",
    signInPasswordPlaceholder: "Votre mot de passe",
    invalidCredentials: "Identifiant ou mot de passe incorrect. Essayez Admin / Admin.",
    alreadySignedIn: "Vous avez déjà une session active.",
    signedInAs: "Connecté en tant que {name}",
    continueToDashboard: "Aller au tableau de bord",
    signOut: "Se déconnecter",
    bullets: [
      "12 418 spécialistes vérifiés dans 10 sports",
      "Intro gratuite de 15 min avec chaque coach",
      "Signaux de préparation HRV + sommeil dès le premier jour"
    ]
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Envoyer une intro Fit.Me",
    modalSubtitle:
      "Un tap. Nous envoyons une intro de 3 lignes avec votre sport, niveau et objectif. Ils répondent, vous répondez, vous vous entraînez.",
    previewLabel: "Aperçu du message · généré automatiquement",
    sendingLabel: "Envoi de l'intro…",
    sentTitle: "Intro envoyée.",
    sentBody:
      "Nous vous préviendrons dès qu'ils répondent. La plupart des spécialistes répondent sous 90 minutes.",
    sendButton: "Envoyer Fit.Me",
    closeButton: "Terminé",
    poweredBy: "Fit.Me est l'action d'intro en un tap de FitConnect.",
    introLines: [
      "Bonjour {name}, je suis Inês — athlète {sport} niveau intermédiaire à Lisbonne.",
      "Je cherche un bloc durable de 8 à 12 semaines vers un objectif clair ce trimestre et votre approche me convient.",
      "Disponible pour une intro de 15 min cette semaine — matins ou après le travail. Dites-moi ce qui vous arrange."
    ]
  },
  ai: {
    bubbleLabel: "Ouvrir l'assistant FitConnect",
    panelTitle: "Demander à FitConnect",
    panelSubtitle: "Votre journée, votre préparation, votre prochaine séance.",
    demoTag: "Mode démo · réponses préenregistrées",
    placeholder: "Posez une question sur votre entraînement…",
    suggestionsHeading: "Essayez l'une de ces suggestions",
    sendLabel: "Envoyer",
    closeLabel: "Fermer l'assistant",
    typingLabel: "FitConnect réfléchit…",
    canned: [
      {
        prompt: "Suggérer l'entraînement de demain",
        answer:
          "Demain votre préparation est prévue à 78 (vert). Faites le 5×5 squat arrière prévu à 82,5 kg, puis terminez par 3 séries de soulevé roumain unilatéral · 12 reps par côté. Gardez RPE ≤ 8 et arrêtez les squats si la vitesse de barre chute de plus de 15 %."
      },
      {
        prompt: "Expliquer mon score de préparation",
        answer:
          "Votre préparation de 82 aujourd'hui vient de trois signaux : HRV 68 ms (+4 vs moyenne 30 jours), sommeil 7 h 42 à 89 % d'efficacité, et charge modérée la veille (1 180 kJ). En clair : vous pouvez vous entraîner fort, mais plafonnez le RPE de séance à 8,5."
      },
      {
        prompt: "Trouver un coach surf à Ericeira",
        answer:
          "Meilleur match à proximité : Hana Okafor — surfeuse pro, ISA Niveau 2, 4,99 étoiles sur 96 avis. Spécialiste pop-up jusqu'à la première vague verte et prep compétition. 70 €/h, réservation 7 jours à l'avance. Envoyer une intro Fit.Me ?"
      },
      {
        prompt: "Pourquoi mercredi a été si lourd ?",
        answer:
          "Mercredi le HRV est tombé à 49 ms (−9 vs votre moyenne 30 jours) avec 6 h 24 de sommeil. La séance au seuil a été correctement autorrégulée à −12 % par votre coach. La baisse correspond à votre schéma mardi-mercredi en milieu de semaine — essayez un footing Z1 la semaine prochaine."
      }
    ]
  },
  community: {
    celebrationsHeading: "Célébrations du jour",
    celebrationsSub:
      "PR, premières séances et séries de toute la communauté FitConnect.",
    chip: {
      pr: "Record personnel",
      hire: "Nouveau coach",
      streak: "Série",
      booking: "Première séance"
    }
  },
  common: {
    skipToContent: "Aller au contenu principal",
    languageMenu: "Changer de langue",
    selectLanguage: "Choisir la langue",
    yes: "Oui",
    no: "Non",
    removeFilter: "Retirer le filtre"
  },
  stats: {
    athletes: "Athlètes actifs",
    specialists: "Spécialistes vérifiés",
    sessions: "Séances réalisées",
    countries: "Pays · 6 continents",
    rating: "Note moyenne des coaches",
    rebook: "Athlètes qui réservent à nouveau sous 30 jours"
  },
  discover: {
    search: "Rechercher",
    searchPlaceholder: "Nom, ville, mot-clé…",
    sport: "Sport",
    allSports: "Tous les sports",
    modality: "Modalité",
    anyModality: "Toutes",
    maxPrice: "Prix max.",
    minExperience: "Expérience min.",
    resetFilters: "Réinitialiser les filtres",
    filtersInstant: "Les filtres s'appliquent instantanément",
    filters: "Filtres",
    titleAll: "Trouvez votre spécialiste",
    titleSport: "Spécialistes {sport}",
    loading: "Chargement de 12 418 coaches vérifiés…",
    matchCount: "{count} sur 12 418 spécialistes correspondent à vos filtres",
    sortBest: "Meilleur match",
    sortRating: "Mieux notés",
    sortPriceAsc: "Prix · croissant",
    sortPriceDesc: "Prix · décroissant",
    emptyTitle: "Aucun spécialiste ne correspond à ces filtres",
    emptyDesc:
      "Essayez un plafond de prix plus élevé, un autre sport ou retirez la contrainte de modalité.",
    handPairTitle: "Vous cherchez quelqu'un de précis ?",
    handPairBody:
      "Notre équipe Coach Match vous associera manuellement à jusqu'à trois spécialistes sous 24 heures. Gratuit, sans engagement.",
    handPairCta: "Demander un appariement manuel",
    upToPrice: "Jusqu'à {price} €/h",
    yearsPlus: "{years}+ ans"
  },
  trainers: {
    eyebrow: "Spécialistes en vedette",
    title: "De vrais spécialistes.",
    titleAccent: "De vrais résultats.",
    subtitle:
      "Sélectionnés parmi 12 418 coaches vérifiés dans 10 sports. Moyenne de 10,4 ans d'expérience, 96 % de rétention client.",
    seeAll: "Voir les 12 418"
  },
  testimonials: {
    eyebrow: "Histoires d'athlètes",
    title: "De vrais coaches. Des progrès",
    titleAccent: "mesurables",
    subtitle:
      "Chacun de ces athlètes a choisi de partager ses données. La métrique sur chaque carte est le changement réel suivi pendant leur programme FitConnect."
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "De l'inscription à votre premier PR",
    titleAccent: "en moins d'une semaine",
    subtitle: "Trois étapes. Zéro friction. Pas de carte pour parler à un vrai coach.",
    steps: [
      {
        title: "Parlez-nous de vos objectifs",
        body: "Profil en 60 secondes. Sport, niveau, planning, modalité préférée. Nous affichons vos 3 meilleurs matchs parmi 12 418 spécialistes vérifiés.",
        detail: "Temps moyen de match : 47 secondes"
      },
      {
        title: "Réservez une intro gratuite de 15 min",
        body: "Rencontrez votre coach principal en appel live avant de payer. Changez quand vous voulez — votre profil athlète vous suit. Jamais de ré-onboarding.",
        detail: "94 % réservent à nouveau le même coach"
      },
      {
        title: "Entraînez-vous, suivez, évoluez",
        body: "Plans hebdomadaires. Séances vidéo live. Journaux d'entraînement. Récupération avec HRV. Voyez votre tableau de bord s'illuminer de PR — et votre coach ajuster en temps réel.",
        detail: "73 % atteignent leur objectif à 90 jours"
      }
    ]
  },
  why: {
    eyebrow: "Pourquoi FitConnect",
    title: "Six questions que tout athlète pose",
    titleAccent: "avant la première séance",
    subtitle:
      "Nous y répondons avec des chiffres, pas des adjectifs. Les métriques viennent du tableau de bord marketplace mis à jour chaque semaine.",
    points: [
      {
        title: "Spécialistes vérifiés, pas des généralistes",
        body: "Chaque coach est interviewé ; chaque certificat est vérifié auprès de l'organisme émetteur.",
        metric: "62%",
        metricLabel: "de candidatures refusées"
      },
      {
        title: "Les coaches répondent plus vite que votre boss",
        body: "Temps médian de réponse au premier message sur la plateforme — mesuré chaque semaine.",
        metric: "<2h",
        metricLabel: "temps moyen de réponse coach"
      },
      {
        title: "Construit autour de quatre spécialités réelles",
        body: "Force, mobilité, endurance, récupération — chaque coach est évalué dans au moins une.",
        metric: "4",
        metricLabel: "parcours de spécialité"
      },
      {
        title: "Vos données, votre tableau de bord",
        body: "HRV, sommeil, charge d'entraînement — vous les possédez. Les coaches ne voient que ce que vous autorisez.",
        metric: "100%",
        metricLabel: "permissions contrôlées par l'athlète"
      },
      {
        title: "Appel intro gratuit, chaque coach",
        body: "Parlez 15 minutes à un humain avant qu'un seul euro ne bouge.",
        metric: "94%",
        metricLabel: "réservent à nouveau le même coach"
      },
      {
        title: "85 % de revenu net pour les coaches",
        body: "Le paiement le plus élevé sur tout marketplace de coaching spécialisé. Virements directs Stripe Connect.",
        metric: "85%",
        metricLabel: "taux de revenu net coach"
      }
    ]
  },
  demos: {
    eyebrow: "Voir en action",
    title: "Trois boucles qui montrent s'entraîner avec",
    titleAccent: "un vrai spécialiste",
    subtitle:
      "Pas de vidéos, pas de marketing creux — ce sont les interactions réelles du premier jour.",
    tiles: [
      {
        label: "Préparation quotidienne",
        body: "HRV et sommeil arrivent sur votre tableau de bord avant le lever du soleil. Aujourd'hui : entraînement intense."
      },
      {
        label: "De vrais spécialistes, pas des généralistes",
        body: "Touchez une carte coach. Voyez les certificats validés et le programme signé."
      },
      {
        label: "Match en 60 secondes",
        body: "Trois questions. Nous vous associons au bon spécialiste pour votre sport."
      }
    ],
    ctaTitle: "Prêt pour le vrai ?",
    ctaBody: "12 418 spécialistes vérifiés. Intro gratuite de 15 min avec chaque coach.",
    ctaButton: "Trouver votre spécialiste"
  },
  comparison: {
    eyebrow: "Comparer les plateformes",
    title: "Pourquoi les athlètes passent à",
    titleAccent: "FitConnect",
    subtitle:
      "Future et Caliber sont excellents — pour le fitness général. FitConnect est fait pour les athlètes qui ont un vrai sport.",
    feature: "Fonctionnalité"
  },
  quiz: {
    eyebrow: "Trouveur de coach",
    title: "Trouvez votre spécialiste en",
    titleAccent: "60 secondes",
    subtitle: "Répondez à cinq questions rapides. Nous affichons vos meilleurs matchs instantanément.",
    back: "Retour",
    next: "Suivant",
    seeMatch: "Voir mon match",
    matchTitle: "Votre meilleur match",
    matchSubtitle: "Selon sport, objectifs et planning — réservez une intro gratuite pour confirmer l'adéquation.",
    bookIntro: "Réserver intro gratuite",
    browseAll: "Parcourir tous les coaches",
    steps: [
      "Quel est votre sport ?",
      "Quel est l'objectif ?",
      "Où en êtes-vous ?",
      "À quelle fréquence pouvez-vous vous entraîner ?",
      "Où voulez-vous vous entraîner ?"
    ]
  }
};
