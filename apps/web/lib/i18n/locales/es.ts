import type { Dict } from "../types";

export const es = {
  nav: {
    findCoach: "Encontrar un coach",
    programs: "Programas",
    community: "Comunidad",
    methodology: "Metodología",
    pricing: "Precios",
    more: "Más",
    dashboard: "Panel del atleta",
    coachDashboard: "Panel del entrenador",
    forCoaches: "Para coaches",
    signIn: "Iniciar sesión",
    matchMe: "Encuéntrame en 60 s",
    menu: "Menú",
    homeAria: "FitConnect — inicio"
  },
  demo: {
    label: "Modo demo",
    body: "Datos de prueba, sin reservas reales · inicio de sesión / registro son placeholders.",
    cta: "Ver código en GitHub"
  },
  hero: {
    livePill: "En vivo · 12.418 especialistas verificados en 10 deportes",
    tagline: "Sistemas · en producción · especialistas verificados",
    title1: "Los mejores",
    titleAccent: "especialistas",
    title2: "del mundo. Verificados. Evaluados. Tuyos.",
    subtitle:
      "Vinyasa, BJJ, escalada, surf — cada deporte, con quienes lo viven. Con herramientas de nivel científico reservadas habitualmente a atletas universitarios de élite.",
    primary: "Encontrar mi especialista",
    secondary: "Cómo evaluamos a los coaches",
    signupCta: "Empezar gratis",
    coachCta: "Ser coach",
    reviewsLine: "27.840 reseñas verificadas",
    rejectedTitle: "62 % rechazados",
    rejectedBody: "Solo los mejores especialistas entran",
    reassurance:
      "Intro gratis de 15 min con cada coach · €12/mes cuando estés listo",
    demoCta: "Ver demo en vivo",
    fullScreenDemo: "Demo a pantalla completa",
    avatarAthleteAlt: "Atleta verificada",
    avatarCoachAlt: "Coach verificado",
    deviceMock: {
      readinessLabel: "Preparación",
      metricsLine: "HRV 68 ms · Sueño 7h 42m · Carga moderada",
      athleteName: "Inês Silva",
      activityName: "Carrera matutina",
      coachName: "Tomás Reyes"
    },
    immersive: {
      connect: "connect.",
      train: "train.",
      perform: "perform.",
      scrollHint: "desplázate para explorar",
      tagline: "eleva cada sesión",
      badge: "hecho para atletas en todo el mundo",
      headline: "la ciencia de la recuperación encuentra",
      headlineAccent: "el rendimiento humano",
      exploreMenu: "explorar fitconnect",
      menuLabel: "menú",
      menuAthletes: "athlete os",
      menuCoaches: "coach os",
      menuCommunity: "mapa community",
      menuPricing: "precios",
      menuMethodology: "metodología",
      statAthletes: "+12k atletas",
      statCoaches: "+500 coaches",
      statActivities: "+2M actividades",
      ctaPrimary: "empezar gratis",
      ctaSecondary: "demo en vivo"
    }
  },
  heroExtras: {
    metricsReadiness: "Preparación",
    metricsReadinessDelta: "+4 HRV",
    metricsCoachFit: "Encaje coach",
    metricsCoachFitDelta: "verificado",
    metricsLoad: "Carga",
    metricsLoadDelta: "en vivo",
    cardTitle: "FitConnect se convierte en tu sistema operativo de entrenamiento.",
    cardBody: "Marketplace de coaches, inteligencia wearable y feedback en vivo en un solo flujo.",
    liveDemo: "Demo en vivo",
    sportStrength: "Fuerza",
    sportYoga: "Yoga",
    sportRunning: "Running"
  },
  landingV2: {
    scrollStory: {
      eyebrow: "cómo funciona",
      title: "una plataforma.",
      titleAccent: "tres historias.",
      subtitle: "desplázate por flujos de atleta, coach y sesión en vivo — cinematográfico.",
      chapter: "capítulo",
      athletesTitle: "para atletas.",
      athletesBody: "cada movimiento. entiende tu cuerpo. supera límites.",
      athletesCta: "abrir athlete os",
      coachesTitle: "para coaches.",
      coachesBody: "rosters. programas. evolución de atletas.",
      coachesCta: "abrir coach os",
      togetherTitle: "juntos.",
      togetherBody: "sesiones en tiempo real. feedback en vivo.",
      togetherCta: "explorar community",
      footerHint: "listo cuando tú lo estés",
      footerCta: "empezar gratis"
    }
  },
  downloadSection: {
    eyebrow: "Primero en móvil",
    title: "Entrena desde el bolsillo",
    subtitle:
      "Instala FitConnect como PWA para paneles listos sin conexión, alertas push y sincronización en vivo con tu coach.",
    installApp: "Instalar app",
    openLiveDemo: "Abrir demo en vivo",
    tryMobileDemo: "Probar demo móvil"
  },
  mobileApp: {
    launcher: {
      badge: "Demo de la app móvil",
      titleDesktop: "Previsualiza la app antes de iniciar sesión.",
      subtitleDesktop:
        "Alterna entre vistas de atleta y coach y lanza la demo en vivo con un toque.",
      titleMobile: "Elige la vista de la app que quieres abrir.",
      subtitleMobile:
        "Estos botones inician sesión en las cuentas demo y abren las rutas reales del panel móvil con dock inferior.",
      athleteTitle: "Panel del atleta",
      athleteSubtitle: "Preparación, plan de hoy, sesión en vivo y actualizaciones del coach.",
      coachTitle: "Panel del coach",
      coachSubtitle: "Preparación del plantel, alertas IA y seguimiento de atletas.",
      openAthlete: "Abrir app atleta",
      openCoach: "Abrir app coach",
      useAnotherAccount: "Usar otra cuenta",
      backHomeAria: "Volver a FitConnect",
      metaTitle: "Demo de la app móvil — FitConnect",
      metaDescription: "Vista previa de FitConnect en iPhone con paneles de atleta y coach."
    },
    nav: {
      today: "Hoy",
      sessions: "Sesiones",
      map: "Mapa",
      coach: "Coach",
      roster: "Plantel",
      inbox: "Bandeja",
      profile: "Perfil",
      ariaLabel: "Navegación de la app de vista previa"
    },
    header: {
      athleteEyebrow: "Athlete OS",
      coachEyebrow: "Coach OS",
      athleteGreeting: "Buenos días, Inês",
      coachGreeting: "Buenas tardes, Diego",
      syncBadge: "Whoop sincronizado",
      syncAgo: "hace 12 s"
    },
    today: {
      readiness: "Preparación IA",
      rosterGreen: "Plantel en verde",
      trainHard: "Entrena fuerte",
      startSession: "Empezar sesión",
      returnToLive: "Volver al directo",
      hrv: "HRV",
      amberAlerts: "alertas ámbar",
      msDelta: "+4 ms",
      streak: "Racha",
      personalBest: "mejor personal",
      sleep: "Sueño",
      sleepQuality: "89 % de calidad",
      load: "Carga",
      sevenDay: "7 días",
      weeklyLoad: "Carga semanal",
      onTarget: "En objetivo",
      coachAiFlag: "La IA marcó 3 atletas para un jueves más ligero.",
      athleteAiSuggest: "La IA sugiere mover el umbral al jueves.",
      planApproved: "Actualización del plan aprobada",
      basedOnSignals: "Según HRV, sueño y carga de la última sesión.",
      approveUpdate: "Aprobar actualización"
    },
    sessions: {
      title: "Sesiones",
      liveNow: "En directo",
      nextUp: "Próxima",
      workoutTitle: "Fuerza de tren inferior",
      workoutMeta: "45 min · coach Diego · RPE objetivo 7",
      hr: "FC",
      pace: "Ritmo",
      load: "Carga",
      chartTitle: "Curva de strain en vivo",
      chartSubtitle: "FC, ritmo y carga",
      endSession: "Terminar sesión",
      startLive: "Iniciar sesión en vivo"
    },
    coach: {
      rosterTitle: "Plantel",
      coachTitle: "Coach Diego",
      activeAthletes: "41 atletas activos",
      onlineNow: "En línea ahora",
      greenReadiness: "Preparación verde",
      amberReadiness: "Preparación ámbar",
      sendCheckIn: "Enviar check-in",
      messageSent: "Mensaje enviado"
    },
    inbox: {
      title: "Bandeja",
      kicker: "Actualizaciones en tiempo real",
      planApprovedTitle: "Actualización del plan aprobada",
      planApprovedBody: "Umbral del jueves movido. El coach tiene la actualización.",
      planPendingBody: "La IA recomienda un jueves más ligero según la recuperación.",
      approve: "Aprobar",
      checkInTitle: "Check-in del coach",
      checkInSentBody: "Tu nota ya es visible en la vista previa de la app.",
      checkInPrompt: "¿Cómo se sintió la última serie?"
    },
    profile: {
      title: "Perfil",
      athleteKicker: "Perfil de atleta",
      coachKicker: "Perfil de coach",
      athleteName: "Inês Martins",
      coachName: "Diego Alvarez",
      athleteRole: "Atleta híbrida · Lisboa",
      coachRole: "Coach de fuerza · Madrid",
      streak: "Racha",
      score: "Puntuación"
    },
    appearance: {
      title: "Apariencia",
      dark: "Oscuro",
      light: "Claro"
    },
    accessibility: {
      title: "Accesibilidad",
      reduceMotion: "Reducir movimiento",
      reduceMotionDesc: "Transiciones más suaves en toda la app",
      highContrast: "Alto contraste",
      highContrastDesc: "Texto y bordes de tarjetas más marcados"
    },
    security: {
      title: "Seguridad y privacidad",
      wearables: "Gestionar wearables conectados",
      dataExport: "Exportación de datos y controles de privacidad",
      demoNote:
        "Controles solo de demo — conectar a ajustes reales de cuenta en producción."
    },
    voltline: "Voltline"
  },
  trustStrip: {
    reviews: "4,94 ★ · 27k+ reseñas verificadas",
    rejected: "62 % de solicitudes rechazadas",
    coaches: "12.418 coaches verificados"
  },
  featuredCoaches: {
    eyebrow: "Coaches destacados",
    title: "Entrena con",
    titleAccent: "especialistas de élite",
    subtitle:
      "Credenciales verificadas, reseñas reales, intro gratuita de 15 min con cada coach.",
    bookIntro: "Reservar intro gratuita",
    perHour: "/hora",
    sessions: "sesiones",
    verified: "Verificado",
    seeAll: "Ver todos los coaches"
  },
  scienceAndTech: {
    eyebrow: "Ciencia y tecnología",
    title: "Herramientas de laboratorio para",
    titleAccent: "cada atleta",
    subtitle:
      "Preparación IA, HRV, webhooks de Strava y sesiones en vivo — no es un directorio con chat.",
    cta: "Leer la metodología",
    tiles: [
      {
        title: "Puntuación de preparación IA",
        body: "HRV, sueño, strain y carga fusionados en un solo dial en el que confía tu coach."
      },
      {
        title: "Webhooks de Strava",
        body: "Actividades sincronizadas en segundos — sin polling ni paneles obsoletos."
      },
      {
        title: "Sesiones en vivo",
        body: "Sala de vídeo HD con overlay de FC y avisos del coach en tiempo real."
      },
      {
        title: "Gestión de carga",
        body: "Ajustes automáticos cuando baja la recuperación — el coach aprueba con un toque."
      }
    ]
  },
  integrationsStrip: {
    eyebrow: "Datos conectados",
    title: "Conectar · Entrenar · Evolucionar",
    subtitle:
      "Strava, Garmin, Apple Health, Whoop y Oura alimentan tu puntuación de preparación.",
    step1: "Conectar wearables",
    step2: "Sincronizar actividades automáticamente",
    step3: "El coach ve el panorama completo",
    syncLabel: "Sincronizado con Strava",
    syncDemo: "hace 2 min"
  },
  methodologyPreview: {
    eyebrow: "The Specialist Standard™",
    title1: "No construimos un marketplace. Construimos un",
    titleAccent: "sistema de verificación",
    title2: "que resulta ser uno.",
    body: "Seis principios separan a un especialista real de alguien con una página web. Exigimos todos a nuestros coaches.",
    cta: "Leer la metodología completa"
  },
  pressStrip: {
    label: "Coaches y atletas mencionados en"
  },
  emailCapture: {
    placeholder: "tu@email.com",
    button: "Acceso anticipado",
    success: "Estás en la lista — revisa tu bandeja de entrada."
  },
  sports: {
    eyebrow: "10 deportes. 0 generalistas.",
    title: "Un especialista para cada disciplina",
    note: "Pasa el cursor · conteos en vivo actualizados hace 5 minutos"
  },
  features: {
    eyebrow: "El stack completo",
    title1: "No es un directorio.",
    titleAccent: "Es todo un ecosistema de entrenamiento",
    titleAfter: ".",
    subtitle:
      "Reconstruimos la experiencia de entrenamiento personal en torno a lo que atletas y coaches necesitan para obtener resultados. Doce módulos — y seguimos lanzando.",
    items: [
      {
        title: "Especialistas verificados",
        body: "Cada entrenador pasa entrevista y validamos sus certificaciones con el organismo emisor. Tasa de aceptación del 38 %."
      },
      {
        title: "Sala de vídeo HD integrada",
        body: "Sesiones remotas en la app, con pantalla compartida, herramientas de dibujo y grabaciones automáticas para revisar."
      },
      {
        title: "Agenda inteligente",
        body: "Sincronización bidireccional del calendario. Reprogramación automática. Zonas horarias. Los coaches ven disponibilidad en un toque."
      },
      {
        title: "Pagos con Stripe Connect",
        body: "Los coaches se quedan con el 85 % — el más alto del sector. Packs, suscripciones y reembolsos gestionados por ti."
      },
      {
        title: "Coaching consciente de la recuperación",
        body: "HRV y sueño de Apple Watch / Garmin / Whoop llegan directo al plan de tu coach."
      },
      {
        title: "Ajustes de plan con IA",
        body: "¿Mal sueño anoche? Tu sesión de intervalos pasa discretamente a un rodaje en Z2. Tu coach lo aprueba."
      },
      {
        title: "Chat en tiempo real",
        body: "Notas de voz, adjuntos, vídeos de técnica — privado entre tú y tu coach."
      },
      {
        title: "Atleta multideporte",
        body: "Yoga el lunes, BJJ el miércoles, carrera el sábado — una identidad, una puntuación de recuperación unificada."
      },
      {
        title: "Biblioteca de programas",
        body: "84 programas de marca de coaches destacados. Probados por más de 12.000 atletas."
      },
      {
        title: "Llamada intro gratuita de 15 min",
        body: "Prueba a cualquier coach sin riesgo. Cambia cuando quieras. Tu perfil de atleta te acompaña."
      },
      {
        title: "Comunidad de atletas",
        body: "Check-ins, PRs, antes/después. Entrena en solitario con la energía de un club."
      },
      {
        title: "Evolución continua",
        body: "Lanzamos cada dos semanas. El producto de marzo mejora en mayo."
      }
    ]
  },
  pricing: {
    eyebrow: "Precios",
    title1: "Precios honestos, barrera baja.",
    titleAccent: "Sin sorpresas",
    subtitle:
      "12 €/mes es una décima parte de lo que cobran Future o Caliber — porque solo pagas a tu coach cuando reservas una sesión.",
    perMonth: "/mes",
    mostPopular: "Más popular",
    start: "Empezar",
    compareAll: "Comparar todas las funciones, tarifas y FAQ →",
    freeName: "Gratis",
    freeDesc: "Descubre entrenadores, lee reseñas, guarda favoritos — gratis para siempre.",
    athleteName: "Atleta",
    athleteDesc: "Todo lo que necesitas para un progreso serio y medible.",
    coachName: "Coach",
    coachDesc:
      "Gestiona tu negocio de coaching desde una sola app — quédate con el 85 % de cada reserva.",
    compareNote:
      "vs Trainerize (~50 €/mes) y TrueCoach (~35 €/mes) — solo pagas a tu coach cuando reservas.",
    features: {
      free: [
        "Navegación ilimitada",
        "Guarda 10 favoritos",
        "Lee más de 27.000 reseñas",
        "Cuestionario para encontrar coach"
      ],
      athlete: [
        "Reservas ilimitadas",
        "Intro gratuita de 15 min con cada coach",
        "Sincronización automática con Strava + preparación IA",
        "Panel completo del atleta (HRV, sueño, carga)",
        "Chat con coach + biblioteca de programas",
        "Soporte prioritario · respuesta < 2 h"
      ],
      coach: [
        "Hasta 50 clientes activos",
        "Constructor de planes + biblioteca de 600+ ejercicios",
        "Pagos con Stripe Connect",
        "Herramientas de marketing + listados destacados",
        "Panel del entrenador + analíticas"
      ]
    }
  },
  faqs: {
    eyebrow: "Preguntas, respondidas",
    title1: "Nos gusta ser",
    titleAccent: "concretos",
    subtitle: "Todo lo que querríamos saber si nos registráramos esta noche.",
    items: [
      {
        q: "¿Cómo se verifican los entrenadores?",
        a: "Cada entrenador sube certificaciones que validamos con el organismo emisor. También exigimos documento de identidad, una entrevista de 30 minutos con un coach senior del equipo FitConnect y una verificación de antecedentes antes de la activación. Solo 4 de cada 10 solicitudes pasan."
      },
      {
        q: "¿Puedo hacer sesiones a distancia?",
        a: "Sí — nuestra sala de vídeo HD integrada está incluida gratis en cada reserva. Los entrenadores pueden marcarse como online, presencial o híbrido. La sala graba por defecto para que revises la técnica después."
      },
      {
        q: "¿Cómo funcionan los pagos?",
        a: "Todas las reservas se procesan con Stripe Connect. Los fondos se liberan al entrenador 24 horas después de la sesión, con reglas de reembolso completas si cancelas dentro de la política. Los coaches se quedan con el 85 % de cada reserva — el mayor ingreso neto de cualquier marketplace."
      },
      {
        q: "¿Y si no estoy contento con mi entrenador?",
        a: "Cada coach ofrece una llamada intro gratuita de 15 minutos y puedes cambiar de entrenador en cualquier momento. Las suscripciones se pueden pausar — sin preguntas — y nuestro equipo Coach Match te ayudará a encontrar otro en 48 horas."
      },
      {
        q: "¿Apoyáis a atletas multideporte?",
        a: "Sí — tu panel te trata como un solo atleta en varias disciplinas. Vinyasa el lunes, jiu-jitsu brasileño el miércoles, intervalos el sábado y una puntuación de recuperación unificada que guía tu semana."
      },
      {
        q: "¿En qué se diferencia FitConnect de Future o Caliber?",
        a: "Future y Caliber te emparejan con un coach generalista interno. FitConnect es un marketplace de 12.000 especialistas verificados en 10 deportes — yoga, surf, BJJ, escalada — que plataformas como Future simplemente no cubren. Obtienes la responsabilidad humana que ofrecen, más expertise deportiva real."
      },
      {
        q: "¿Puede mi coach ver mis datos de Apple Watch / Garmin / Whoop?",
        a: "Sí, con tu permiso explícito. Extraemos HRV, sueño, carga de entrenamiento y una puntuación de recuperación en verde / ámbar / rojo, y tu coach puede usarla para sugerir la intensidad de la sesión — o recomendar un día de descanso."
      },
      {
        q: "¿Hay una opción gratuita?",
        a: "Sí — el plan gratuito te permite navegar, guardar 10 favoritos y leer más de 27.000 reseñas verificadas. Solo pagas cuando reservas una sesión o te unes a un programa."
      }
    ]
  },
  cta: {
    pill: "Cohorte de primavera abierta — quedan 312 plazas",
    title1: "Tu",
    titleAccent: "mejor año",
    title2: "empieza mañana a las 8.",
    subtitle:
      "Únete a 184.512 atletas que por fin encontraron un coach que conoce de verdad su deporte. Gratis para empezar. Gratis para probar a cada coach. 12 €/mes cuando estés listo.",
    primary: "Encuéntrame en 60 segundos",
    secondary: "Publica tus servicios de coaching",
    reassurance:
      "Sin tarjeta de crédito · Intro gratuita de 15 min con cada coach · Cancela cuando quieras"
  },
  footer: {
    tagline:
      "El marketplace de especialistas deportivos verificados con herramientas de nivel científico reservadas habitualmente a atletas universitarios de élite.",
    productHeading: "Producto",
    companyHeading: "Empresa",
    legalHeading: "Legal",
    buildHeading: "Construye con nosotros",
    buildBody:
      "FitConnect forma parte del suite Querinoz. Lee nuestras notas de desarrollo y la hoja de ruta en GitHub.",
    seeRepo: "Ver el repositorio",
    copyright: "Hecho en Lisboa con disciplina, no con hype",
    statusOk: "Todos los sistemas operativos",
    about: "Sobre nosotros",
    careers: "Carreras",
    press: "Prensa",
    partnerships: "Alianzas",
    privacy: "Privacidad",
    terms: "Términos",
    trustSafety: "Confianza y seguridad",
    contact: "Contacto",
    stravaAttribution:
      "Datos de actividad de Strava mostrados con permiso. Powered by Strava."
  },
  dashboard: {
    eyebrow: "Tu OS de atleta",
    welcome: "Bienvenida de nuevo, Inês.",
    streak: "Llevas 5 semanas de racha de PR — luz verde para exigirte hoy.",
    schedule: "Agenda",
    startSession: "Empezar la sesión de hoy",
    aiSuggestion: "Sugerencia de entrenamiento con IA",
    approvedBy: "Aprobado por Tomás",
    applyPlan: "Aplicar al plan",
    hrvLabel: "HRV (media 7 días)",
    readinessTitle: "Preparación",
    readinessGreen: "Verde · entrena fuerte",
    upcoming: "Próximas sesiones",
    habits: "Hábitos diarios",
    messages: "Mensajes del coach",
    weeklyVolume: "Carga semanal de entrenamiento",
    monthlyTrend: "Tendencia mensual",
    sleepRecovery: "Sueño y recuperación",
    viewAll: "Ver todo",
    online: "Online",
    inPerson: "Presencial",
    tomorrow: "Mañana",
    coachPlanTitle: "Plan de tu coach",
    coachPlanSubtitle:
      "Prescrito por tu especialista — las actualizaciones se sincronizan con tu coach en tiempo real.",
    wearableSyncHint:
      "Sincroniza tu wearable para desbloquear ajustes IA de tu coach.",
    noAthleteProfile:
      "No hay perfil de atleta en esta cuenta. Inicia sesión como Athlete / Athlete para la demo.",
    os: {
      greetingMorning: "Buenos días 👋",
      greetingAfternoon: "Buenas tardes 👋",
      greetingEvening: "Buenas noches 👋",
      greetingLateNight: "Madrugada 👋",
      titleSuffix: "Athlete OS de {name}",
      hrvTrendUp: "HRV +{delta} ms vs línea base.",
      hrvTrendDown: "HRV −{delta} ms vs línea base.",
      trainHard: "Entrena fuerte hoy.",
      trainSmart: "Entrena con inteligencia hoy.",
      wearables: "Wearables",
      findCoach: "Encontrar coach",
      athleteRole: "Atleta · {tier}",
      upgradeTitle: "Upgrade a Athlete",
      upgradeBody: "HRV, insights IA y panel completo.",
      upgradeCta: "Empezar — €12/mes",
      quickActions: "Acciones rápidas",
      findSpecialist: "Encontrar especialista",
      browsePrograms: "Explorar programas",
      profile: "Perfil",
      edit: "Editar",
      sports: "Deportes",
      goal90: "Objetivo 90 días",
      wearable: "Wearable",
      plan: "Plan",
      navOverview: "Resumen",
      navMyCoach: "Mi coach",
      navPrograms: "Programas",
      navCommunity: "Comunidad",
      navSettings: "Ajustes"
    },
    todayPlan: {
      title: "Plan de hoy",
      startSession: "Iniciar sesión de hoy",
      noPlan: "Aún sin plan asignado.",
      approvedBy: "Aprobado por {coach}"
    },
    readiness_ring: {
      title: "Preparación",
      subtitle: "HRV · sueño · carga",
      viewDetails: "Ver detalles"
    },
    map: {
      title: "Mapa de actividad",
      subtitle: "Rutas, coaches y spots de entrenamiento cerca",
      viewFull: "Abrir mapa completo",
      noToken: "OpenFreeMap · OpenStreetMap"
    },
    activity_feed: {
      title: "Feed de actividad",
      live: "En vivo",
      empty: "Sin actividades recientes.",
      justNow: "Ahora",
      hoursAgo: "hace {hours}h",
      daysAgo: "hace {days}d"
    },
    strava_sync: {
      title: "Sync Strava",
      synced: "Sincronizado",
      lastSync: "Última sync {time}",
      connect: "Conectar Strava"
    },
    pr_tracker: {
      title: "Tracker de PRs",
      streak: "Racha de PRs de {weeks} semanas",
      recent: "PR reciente",
      weeks: "semanas"
    }
  },
  hub: {
    mobileNav: "Navegación del panel",
    yourCoach: "Tu coach",
    wearableSync: "Apple · Garmin · Whoop",
    sessionsMonth: "Sesiones este mes",
    hoursTrained: "Horas entrenadas",
    prStreak: "Racha de PRs",
    personalBest: "Mejor personal",
    goalCompletion: "Progreso del objetivo",
    roster: "Plantel",
    monitor: "Monitorizar",
    backToRoster: "Volver al plantel",
    monitorAthlete: "Monitor del atleta",
    readiness: "Preparación",
    recoveryNotes: "Notas de recuperación y plan",
    noPlanYet: "Aún no hay plan asignado.",
    sendRecoveryNudge: "Enviar aviso de recuperación",
    athleteNotFound: "Atleta no encontrado en tu plantel.",
    map: {
      title: "Mapa de actividad",
      nearby: "Entreno cercano"
    },
    activity_feed: {
      title: "Feed en vivo",
      live: "En vivo"
    },
    strava_sync: {
      label: "Strava"
    },
    pr_tracker: {
      label: "PRs"
    },
    readiness_ring: {
      label: "Preparación"
    }
  },
  coachDashboard: {
    eyebrow: "Coach OS",
    welcome: "Bienvenida de nuevo, Marina.",
    streak: "41 atletas activos · €4.280 MTD · 94% retención 90 días.",
    schedule: "Calendario",
    viewRoster: "Ver plantilla",
    aiAlert: "Alerta de preparación del plantel",
    aiAlertBody:
      "3 atletas en ámbar en HRV. Sugerir intervalos más suaves el jueves — planes pre-redactados para enviar con un toque.",
    reviewPlans: "Revisar sugerencias",
    activeAthletes: "Atletas activos",
    revenueMtd: "Ingresos MTD",
    sessionsWeek: "Sesiones esta semana",
    retention: "Retención 90 días",
    rebookRate: "Tasa de rebook",
    weeklyRevenue: "Ingresos semanales",
    athleteRoster: "Plantilla HRV",
    upcomingSessions: "Próximas sesiones",
    clientMessages: "Mensajes de atletas",
    retentionInsights: "Insights de retención",
    navOverview: "Resumen",
    navAthletes: "Atletas",
    navSessions: "Sesiones",
    navEarnings: "Ingresos",
    navSettings: "Ajustes",
    defaultCoachTitle: "Especialista en ciclismo",
    thisMonth: "Este mes",
    takeHome: "neto",
    welcomeBack: "Bienvenido de nuevo 👋",
    commandCenterTitle: "Centro de mando del entrenador",
    attentionToday: "{count} atleta necesita tu atención hoy.",
    live: "En vivo",
    notifications: "Notificaciones",
    mrr: "MRR",
    sessionsThisMonth: "Sesiones este mes",
    retentionRate: "Tasa de retención",
    earningsStripeConnect: "Ingresos y Stripe Connect",
    rosterMapTitle: "Mapa del plantel",
    rosterMapSubtitle: "{count} atletas en tus zonas de coaching",
    programBuilderTitle: "Constructor de programas",
    programBuilderSubtitle: "Arrastra bloques para reordenar la plantilla de sesión",
    saveDraft: "Guardar borrador",
    saved: "Guardado",
    publishProgram: "Publicar",
    addBlock: "Añadir bloque",
    dragBlock: "Arrastrar para reordenar",
    minutesShort: " min",
    athletePlanLabel: "Atleta de {name}"
  },
  dashboardPreview: {
    eyebrow: "Vista previa",
    title: "Una plataforma.",
    titleAccent: "Dos paneles.",
    subtitle:
      "Atletas con preparación de nivel científico. Coaches con ingresos, HRV del plantel y sugerencias con un toque — el mismo design system.",
    athleteTab: "Panel del atleta",
    coachTab: "Panel del entrenador",
    tabsAria: "Cambiar vista previa del panel",
    athleteCta: "Abrir demo atleta",
    coachCta: "Abrir demo entrenador",
    floatingTitle: "Mismo ecosistema",
    floatingBody: "Datos fluyen atleta → coach en tiempo real",
    features: [
      {
        title: "Preparación diaria",
        body: "HRV, sueño, dolor muscular, carga — un score verde/ámbar/rojo."
      },
      {
        title: "Sugerencias IA",
        body: "Plan del coach ajustado a los datos de anoche."
      },
      {
        title: "Correlación sueño",
        body: "Apple Watch, Garmin o Whoop — sin doble registro."
      },
      {
        title: "Coach business OS",
        body: "Ingresos, retención, HRV del plantel y pagos Stripe en una vista."
      }
    ]
  },
  auth: {
    signInHeading: "Bienvenido de nuevo, atleta.",
    signUpHeading: "Empieza a entrenar con un especialista de verdad.",
    signInSubtitle:
      "Inicia sesión para retomar tu plan, escribir a tu coach y consultar la preparación de hoy.",
    signUpSubtitle:
      "60 segundos hasta un coach de verdad. Navega gratis, intro gratuita de 15 min en cada reserva.",
    continueWith: "Continuar con",
    or: "o usa el correo",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@ejemplo.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Al menos 8 caracteres",
    submitSignIn: "Iniciar sesión",
    submitSignUp: "Crear cuenta",
    noAccount: "¿Nuevo en FitConnect?",
    haveAccount: "¿Ya tienes cuenta?",
    createAccount: "Crear una",
    signInLink: "Iniciar sesión",
    legalNote:
      "Al continuar aceptas nuestros Términos y reconoces nuestra Política de privacidad. Nunca publicamos en tu nombre.",
    usernameLabel: "Usuario o correo",
    usernamePlaceholder: "Admin",
    signInPasswordPlaceholder: "Tu contraseña",
    invalidCredentials: "Usuario o contraseña incorrectos. Prueba Admin / Admin.",
    alreadySignedIn: "Ya tienes una sesión activa.",
    signedInAs: "Sesión iniciada como {name}",
    continueToDashboard: "Ir al panel",
    signOut: "Cerrar sesión",
    bullets: [
      "12.418 especialistas verificados en 10 deportes",
      "Intro gratuita de 15 min con cada coach",
      "Señales de preparación HRV + sueño desde el primer día"
    ]
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Enviar una intro Fit.Me",
    modalSubtitle:
      "Un toque. Enviamos una intro de 3 líneas con tu deporte, nivel y objetivo. Ellos responden, tú respondes, entrenáis.",
    previewLabel: "Vista previa del mensaje · generado automáticamente",
    sendingLabel: "Enviando intro…",
    sentTitle: "Intro enviada.",
    sentBody:
      "Te avisaremos en cuanto respondan. La mayoría de especialistas contestan en 90 minutos.",
    sendButton: "Enviar Fit.Me",
    closeButton: "Listo",
    poweredBy: "Fit.Me es la acción de intro en un toque de FitConnect.",
    introLines: [
      "Hola {name}, soy Inês — atleta de {sport} nivel intermedio en Lisboa.",
      "Busco un bloque sostenible de 8–12 semanas hacia un objetivo claro este trimestre y tu enfoque encaja.",
      "Libre para una intro de 15 min esta semana — mañanas o después del trabajo. Dime qué te va bien."
    ]
  },
  ai: {
    bubbleLabel: "Abrir el asistente FitConnect",
    panelTitle: "Pregunta a FitConnect",
    panelSubtitle: "Tu día, tu preparación, tu próxima sesión.",
    demoTag: "Modo demo · respuestas predefinidas",
    placeholder: "Pregunta lo que quieras sobre tu entrenamiento…",
    suggestionsHeading: "Prueba una de estas",
    sendLabel: "Enviar",
    closeLabel: "Cerrar asistente",
    typingLabel: "FitConnect está pensando…",
    canned: [
      {
        prompt: "Sugiere el entrenamiento de mañana",
        answer:
          "Mañana tu preparación se prevé en 78 (verde). Haz el 5×5 de sentadilla trasera planificado a 82,5 kg, luego cierra con 3 series de peso muerto rumano a una pierna · 12 reps por lado. Mantén RPE ≤ 8 y para las sentadillas si la velocidad de la barra cae más del 15 %."
      },
      {
        prompt: "Explica mi puntuación de preparación",
        answer:
          "Tu preparación de hoy, 82, viene de tres señales: HRV 68 ms (+4 vs media 30 días), sueño 7 h 42 min al 89 % de eficiencia y carga moderada del día anterior (1.180 kJ). Traducción: puedes entrenar fuerte, pero limita el RPE de sesión a 8,5."
      },
      {
        prompt: "Encuéntrame un coach de surf en Ericeira",
        answer:
          "Mejor encaje cerca: Hana Okafor — surfista pro, ISA Nivel 2, 4,99 estrellas en 96 reseñas. Especialista en pop-up hasta la primera ola verde y prep de competición. 70 €/h, reserva con 7 días de antelación. ¿Quieres que envíe una intro Fit.Me?"
      },
      {
        prompt: "¿Por qué el miércoles se sintió tan pesado?",
        answer:
          "El miércoles el HRV bajó a 49 ms (−9 vs tu media de 30 días) con 6 h 24 min de sueño. La sesión de umbral que hiciste se autoreguló correctamente un 12 % menos por tu coach. La caída encaja con tu patrón martes-miércoles de mitad de semana — prueba un rodaje Z1 la próxima semana para romperlo."
      }
    ]
  },
  community: {
    celebrationsHeading: "Celebraciones de hoy",
    celebrationsSub:
      "PRs, primeras sesiones y rachas de toda la comunidad FitConnect.",
    chip: {
      pr: "Récord personal",
      hire: "Nuevo coach",
      streak: "Racha",
      booking: "Primera sesión"
    }
  },
  common: {
    skipToContent: "Saltar al contenido principal",
    languageMenu: "Cambiar idioma",
    selectLanguage: "Seleccionar idioma",
    yes: "Sí",
    no: "No",
    removeFilter: "Quitar filtro"
  },
  stats: {
    athletes: "Atletas activos",
    specialists: "Especialistas verificados",
    sessions: "Sesiones completadas",
    countries: "Países · 6 continentes",
    rating: "Valoración media de coaches",
    rebook: "Atletas que vuelven a reservar en 30 días"
  },
  discover: {
    search: "Buscar",
    searchPlaceholder: "Nombre, ciudad, palabra clave…",
    sport: "Deporte",
    allSports: "Todos los deportes",
    modality: "Modalidad",
    anyModality: "Cualquiera",
    maxPrice: "Precio máx.",
    minExperience: "Experiencia mín.",
    resetFilters: "Restablecer filtros",
    filtersInstant: "Los filtros se aplican al instante",
    filters: "Filtros",
    titleAll: "Encuentra tu especialista",
    titleSport: "Especialistas en {sport}",
    loading: "Cargando 12.418 coaches verificados…",
    matchCount: "{count} de 12.418 especialistas coinciden con tus filtros",
    sortBest: "Mejor encaje",
    sortRating: "Mejor valorados",
    sortPriceAsc: "Precio · menor a mayor",
    sortPriceDesc: "Precio · mayor a menor",
    emptyTitle: "Ningún especialista coincide con esos filtros",
    emptyDesc:
      "Prueba un techo de precio más alto, otro deporte o quita la restricción de modalidad.",
    handPairTitle: "¿Buscas a alguien concreto?",
    handPairBody:
      "Nuestro equipo Coach Match te emparejará manualmente con hasta tres especialistas en 24 horas. Gratis, sin compromiso.",
    handPairCta: "Solicitar emparejamiento manual",
    upToPrice: "Hasta {price} €/h",
    yearsPlus: "{years}+ años"
  },
  trainers: {
    eyebrow: "Especialistas destacados",
    title: "Especialistas reales.",
    titleAccent: "Resultados reales.",
    subtitle:
      "Seleccionados entre 12.418 coaches verificados en 10 deportes. Media de 10,4 años de experiencia, 96 % de retención de clientes.",
    seeAll: "Ver los 12.418"
  },
  testimonials: {
    eyebrow: "Historias de atletas",
    title: "Coaches reales. Progreso",
    titleAccent: "medible",
    subtitle:
      "Cada uno de estos atletas optó por compartir sus datos. La métrica de cada tarjeta es el cambio real que registraron durante su programa FitConnect."
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Del registro a tu primer PR",
    titleAccent: "en menos de una semana",
    subtitle: "Tres pasos. Cero fricción. Sin tarjeta para hablar con un coach de verdad.",
    steps: [
      {
        title: "Cuéntanos tus objetivos",
        body: "Perfil de 60 segundos. Deporte, nivel, horario, modalidad preferida. Te mostramos tus 3 mejores coincidencias entre 12.418 especialistas verificados.",
        detail: "Tiempo medio de emparejamiento: 47 segundos"
      },
      {
        title: "Reserva una intro gratuita de 15 min",
        body: "Conoce a tu coach principal en una llamada en vivo antes de pagar. Cambia cuando quieras — tu perfil de atleta te acompaña. Sin volver a empezar.",
        detail: "94 % vuelven a reservar con el mismo coach"
      },
      {
        title: "Entrena, registra, evoluciona",
        body: "Planes semanales. Sesiones en vídeo en vivo. Registro de entrenamientos. Recuperación con HRV. Mira tu panel llenarse de PRs — y tu coach ajustar en tiempo real.",
        detail: "73 % alcanzan su objetivo a 90 días"
      }
    ]
  },
  why: {
    eyebrow: "Por qué FitConnect",
    title: "Seis cosas que todo atleta pregunta",
    titleAccent: "antes de la primera sesión",
    subtitle:
      "Las respondemos con números, no con adjetivos. Las métricas vienen del panel del marketplace actualizado cada semana.",
    points: [
      {
        title: "Especialistas verificados, no generalistas",
        body: "Cada coach pasa entrevista; cada certificado se contrasta con el organismo emisor.",
        metric: "62%",
        metricLabel: "de solicitudes rechazadas"
      },
      {
        title: "Los coaches responden más rápido que tu jefe",
        body: "Tiempo medio de respuesta al primer mensaje en la plataforma — medido cada semana.",
        metric: "<2h",
        metricLabel: "tiempo medio de respuesta del coach"
      },
      {
        title: "Construido en torno a cuatro especialidades reales",
        body: "Fuerza, movilidad, resistencia, recuperación — cada coach está evaluado en al menos una.",
        metric: "4",
        metricLabel: "líneas de especialidad"
      },
      {
        title: "Tus datos, tu panel",
        body: "HRV, sueño, carga de entrenamiento — son tuyos. Los coaches solo ven lo que autorizas.",
        metric: "100%",
        metricLabel: "permisos controlados por el atleta"
      },
      {
        title: "Llamada intro gratuita, con cada coach",
        body: "Habla 15 minutos con una persona real antes de que se mueva un solo euro.",
        metric: "94%",
        metricLabel: "vuelven a reservar con el mismo coach"
      },
      {
        title: "85 % de ingreso neto para coaches",
        body: "El mayor pago en cualquier marketplace de coaching especializado. Depósitos directos con Stripe Connect.",
        metric: "85%",
        metricLabel: "ingreso neto del coach"
      }
    ]
  },
  demos: {
    eyebrow: "Míralo en acción",
    title: "Tres bucles que muestran entrenar con",
    titleAccent: "un especialista de verdad",
    titleSuffix: "se ve.",
    subtitle:
      "Sin vídeos, sin marketing vacío — son las interacciones reales del primer día.",
    tiles: [
      {
        label: "Preparación diaria",
        body: "HRV y sueño llegan a tu panel antes del amanecer. Hoy dice: entrena fuerte."
      },
      {
        label: "Especialistas reales, no generalistas",
        body: "Toca una tarjeta de coach. Ve los certificados que validamos y el programa que firmó."
      },
      {
        label: "Encaje en 60 segundos",
        body: "Tres preguntas. Te emparejamos con el especialista adecuado para tu deporte."
      }
    ],
    ctaTitle: "¿Listo para lo real?",
    ctaBody: "12.418 especialistas verificados. Intro gratuita de 15 min con cada coach.",
    ctaButton: "Encuentra tu especialista"
  },
  comparison: {
    eyebrow: "Comparar plataformas",
    title: "Por qué los atletas cambian a",
    titleAccent: "FitConnect",
    subtitle:
      "Future y Caliber son excelentes — para fitness general. FitConnect está hecho para atletas con un deporte de verdad.",
    feature: "Función"
  },
  quiz: {
    eyebrow: "Buscador de coach",
    title: "Encuentra tu especialista en",
    titleAccent: "60 segundos",
    subtitle: "Responde cinco preguntas rápidas. Te mostramos tus mejores coincidencias al instante.",
    back: "Atrás",
    next: "Siguiente",
    seeMatch: "Ver mi coincidencia",
    matchTitle: "Tu mejor coincidencia",
    matchSubtitle: "Según deporte, objetivos y horario — reserva una intro gratuita para confirmar el encaje.",
    bookIntro: "Reservar intro gratuita",
    browseAll: "Ver todos los coaches",
    steps: [
      "¿Cuál es tu deporte?",
      "¿Cuál es el objetivo?",
      "¿Dónde estás ahora?",
      "¿Con qué frecuencia puedes entrenar?",
      "¿Dónde quieres entrenar?"
    ]
  },
  communityFeed: {
    eyebrow: "Comunidad",
    title: "El club, en línea.",
    subtitle:
      "Atletas celebrando PRs, preguntas reales, antes/después. Coaches especialistas pasan por aquí. Sin economía de likes.",
    shareCta: "Compartir check-in",
    searchPlaceholder: "Buscar en el feed…",
    activityType: "Tipo de actividad",
    sport: "Deporte",
    allSports: "Todos los deportes",
    liveActivity: "Actividad en vivo",
    trendingClubs: "Clubes en tendencia",
    upcomingMeetups: "Próximos encuentros",
    join: "Unirse",
    members: "miembros",
    going: "asisten",
    emptyTitle: "Aún no hay publicaciones",
    emptyDesc:
      "Amplía los filtros o sé el primero en publicar con esta combinación.",
    kinds: {
      all: "Todos",
      pr: "PR",
      checkin: "Check-in",
      beforeAfter: "Antes/Después",
      race: "Carrera",
      question: "Pregunta"
    },
    stats: {
      postsToday: "Publicaciones hoy",
      prsWeek: "PRs esta semana",
      activeClubs: "Clubes activos"
    }
  },
  programsPage: {
    eyebrow: "Biblioteca de programas",
    titleLine1: "84 programas de referencia.",
    titleAccent: "Escritos por los coaches que los dirigen.",
    subtitle:
      "Probados, basados en evidencia, con RPE. Cada programa incluye check-ins semanales y actualizaciones de por vida.",
    featuredBadge: "Destacado",
    weeks: "semanas",
    athletesJoined: "atletas inscritos",
    joinProgram: "Unirse al programa",
    seeSampleWeek: "Ver semana de ejemplo",
    searchPlaceholder: "Buscar programas…",
    allSports: "Todos los deportes",
    emptyTitle: "Ningún programa coincide con esos filtros",
    emptyDesc: "Prueba otro deporte o quita el filtro de nivel.",
    browseAll: "Ver todos los programas",
    levels: {
      all: "Todos",
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado"
    }
  },
  pricingPage: {
    eyebrow: "Precios",
    title: "Precios honestos para",
    titleAccent: "entrenamiento honesto",
    subtitle:
      "12 €/mes por la plataforma. La tarifa de tu coach es la que él fije. Sin comisiones ocultas. Sin contratos de 12 meses. Pausa cuando lo necesites.",
    monthly: "Mensual",
    annual: "Anual",
    saveBadge: "Ahorra 25 %",
    perMonth: "/mes",
    billedAnnually: "facturado anualmente",
    sessionRatesTitle: "Tarifas típicas de sesión por deporte",
    sessionRatesSubtitle:
      "Los coaches fijan sus tarifas. Estas son medianas del marketplace.",
    sport: "Deporte",
    from: "Desde",
    typical: "Típico",
    premium: "Premium",
    faqTitle: "Preguntas sobre precios",
    faqSubtitle: "Respuestas directas. Sin guiones de ventas.",
    plans: {
      free: {
        name: "Gratis",
        desc: "Descubre coaches, lee 27.000+ reseñas, guarda favoritos.",
        cta: "Empezar gratis",
        features: [
          "Navegación ilimitada",
          "10 favoritos",
          "Cuestionario de coach",
          "Todas las reseñas",
          "Soporte por email"
        ]
      },
      athlete: {
        name: "Atleta",
        desc: "Todo para un progreso serio. Pagas sesiones aparte.",
        cta: "Empezar Atleta",
        features: [
          "Reservas ilimitadas",
          "Intro gratuita de 15 min con cada coach",
          "Panel completo (HRV, sueño, entrenamiento IA)",
          "Biblioteca de programas + actualizaciones",
          "Soporte prioritario · < 2 h",
          "Reservas conscientes de la recuperación",
          "Comunidad y clubes"
        ]
      },
      team: {
        name: "Equipo",
        desc: "Para familias, clubes y compañeros de entrenamiento.",
        cta: "Empezar Equipo",
        features: [
          "Hasta 5 perfiles de atleta",
          "Calendario compartido",
          "Descuento en sesiones de grupo (-15 %)",
          "Facturación familiar",
          "Todo del plan Atleta"
        ]
      },
      coach: {
        name: "Coach",
        desc: "Gestiona tu negocio en una app. Quédate con el 85 %.",
        cta: "Solicitar como coach",
        features: [
          "Hasta 50 clientes activos",
          "Constructor de planes + 600 ejercicios",
          "Pagos con Stripe Connect",
          "Marketing y listados destacados",
          "Analíticas y retención",
          "Sesiones de grupo",
          "Página de coach personalizada"
        ]
      }
    },
    reassurance: [
      {
        title: "Intro gratuita de 15 min",
        body: "Con todos los coaches. Tu perfil de atleta te acompaña si cambias."
      },
      {
        title: "Sin contratos de 12 meses",
        body: "Pausa cuando quieras. No cobramos por algo que no uses."
      },
      {
        title: "Ingreso neto honesto",
        body: "Los coaches se quedan con el 85 % — el mayor ingreso neto del mercado."
      }
    ],
    faqs: [
      {
        q: "¿Por qué la cuota de la plataforma es tan baja frente a Future o Caliber?",
        a: "Future y Caliber incluyen un coach en el precio mensual fijo. FitConnect cobra 12 €/mes y eliges al coach a su tarifa horaria — muchos atletas pagan un 30-60 % menos."
      },
      {
        q: "¿Cobráis comisión a los coaches?",
        a: "Sí — 15 %. Los coaches se quedan con el 85 %, el mayor ingreso neto del mercado."
      },
      {
        q: "¿Qué pasa si mi coach cancela?",
        a: "Reembolso completo + 25 % de crédito. Nuevo emparejamiento en 48 h."
      },
      {
        q: "¿Puedo cancelar en cualquier momento?",
        a: "Sí. La suscripción se pausa al instante; mantienes acceso hasta fin de ciclo."
      }
    ]
  },
  coachLanding: {
    eyebrow: "Para coaches especialistas",
    title: "Entrena tu deporte.",
    titleAccent: "Quédate con el 85 %.",
    subtitle:
      "Marketplace para atletas verificados y conscientes de la recuperación. Mediana de 3.420 €/mes en 90 días.",
    applyCta: "Solicitar ahora",
    seeEarnings: "Ver ingresos de coaches",
    perks: [
      {
        title: "Quédate con el 85 % de cada reserva",
        body: "Ingreso neto líder — publicamos el P&L."
      },
      {
        title: "Vídeo HD y agenda gratis",
        body: "Sala integrada, sin Zoom, con grabación."
      },
      {
        title: "Pagos con Stripe Connect",
        body: "Fondos en tu cuenta en 24 h tras la sesión."
      },
      {
        title: "Destacado para 184.512 atletas",
        body: "Marketing incluido. Destacados merecidos."
      },
      {
        title: "Planes y biblioteca de ejercicios",
        body: "600+ ejercicios, bloques personalizados."
      },
      {
        title: "Insignia de coach verificado",
        body: "Specialist Standard™. Los atletas lo notan."
      }
    ],
    earningsTitle: "Lo que puedes",
    earningsTitleAccent: "ganar de verdad",
    earningsSubtitle:
      "Mediana y top 10 % de ingresos brutos mensuales por tiempo en la plataforma.",
    cohortMonths: "Mes {range}",
    median: "mediana",
    top10: "top 10 %",
    voicesTitle: "Historias de coaches",
    voicesSubtitle: "Especialistas en la plataforma hoy.",
    stats: {
      activeCoaches: "Coaches activos",
      avgTakeHome: "Ingreso neto medio",
      coachNps: "NPS coaches"
    },
    earningsBullets: [
      "Sin comisiones en intros gratuitas",
      "Rebate del 9 % para ≥ 60 h/mes",
      "Destacados por retención, no pagados"
    ],
    earningsSource:
      "Fuente: cohorte activa Q1 2026, ingresos brutos (verificados en Stripe).",
    floatingMedian: "3.420 € / mes",
    floatingMedianSub: "Mediana en el mes 4",
    floatingAthletes: "+12 nuevos atletas",
    floatingAthletesSub: "Esta semana · auto-match",
    voices: [
      {
        name: "Marina Costa",
        role: "Yoga · Lisboa",
        quote:
          "Pasé de 6 a 41 atletas en cinco meses. Son personas que entrenan de verdad."
      },
      {
        name: "Tomás Reyes",
        role: "Powerlifting · Madrid",
        quote: "Me quedo con 52 € de cada 60 € — no 30 €."
      },
      {
        name: "Diego Almeida",
        role: "Maratón · Oporto",
        quote: "Leo tendencias de HRV en lugar de preguntar cómo fue la semana."
      }
    ],
    onboardingEyebrow: "Onboarding",
    onboardingTitle: "Tres pasos. Catorce días.",
    onboardingTitleAccent: "Activo.",
    onboardingSteps: [
      {
        title: "Solicitud en 12 minutos",
        body: "Deporte, certificaciones, vídeo, agenda.",
        detail: "01"
      },
      {
        title: "Entrevista de 30 min",
        body: "Técnica, filosofía de programación y ética.",
        detail: "02"
      },
      {
        title: "Activación del perfil",
        body: "Credenciales verificadas. Destacado los primeros 90 días.",
        detail: "03"
      }
    ]
  },
  methodologyPage: {
    eyebrow: "The Specialist Standard™",
    title: "La metodología detrás de cada",
    titleAccent: "coach FitConnect.",
    subtitle:
      "Seis principios que cada coach debe cumplir antes de que los atletas vean su perfil — y la evidencia detrás.",
    pillarsTitle: "Leer los seis pilares",
    pillarOf: "Pilar {n} de {total}",
    sourceLabel: "Fuente:",
    evidenceEyebrow: "La evidencia",
    evidenceTitle: "La ciencia en la que nos apoyamos",
    evidenceSubtitle:
      "Somos marketplace, no laboratorio. Estos principios moldean entrevistas y aprobación de programas.",
    evidence: [
      {
        title: "Distribución polarizada",
        citation: "Seiler & Tønnessen, 2009",
        body: "80 % fácil / 20 % intenso — patrón en endurance de élite."
      },
      {
        title: "Entrenamiento guiado por HRV",
        citation: "Vesterinen et al., 2016",
        body: "Ajustes por HRV con ganancias iguales o superiores a planes fijos."
      },
      {
        title: "Especificidad de la habilidad",
        citation: "Schmidt & Lee, 2019",
        body: "La transferencia entre deportes es pequeña. Los generalistas no sustituyen a especialistas."
      },
      {
        title: "Autorregulación vía RPE",
        citation: "Helms et al., 2016",
        body: "El RPE produce hipertrofia equivalente con mejor adherencia."
      }
    ],
    quote:
      "Un coach genérico te pone en forma. Un especialista te lleva donde quieres ir.",
    quoteAuthor: "Diego Almeida, maratonista sub-2:25 y coach FitConnect",
    stats: {
      interviewed: "Coaches entrevistados en 2026",
      accepted: "Coaches aceptados",
      acceptanceRate: "Tasa de aceptación"
    },
    auditNote: "Datos auditados por equipo externo, Q1 2026"
  },
  methodologyPillars: [
    {
      title: "Especialista, no generalista",
      subtitle: "Coaches que viven un deporte",
      body: "Los planes genéricos se estancan en la semana ocho. Nuestros coaches se comprometen con una o dos disciplinas.",
      metricLabel: "Experiencia media",
      metricValue: "10,4 años",
      citation: "Roster FitConnect 2026, n=12.418"
    },
    {
      title: "Programación consciente de la recuperación",
      subtitle: "HRV + sueño guían cada sesión",
      body: "El panel lee HRV, FC en reposo y sueño. La señal de preparación llega al coach en tiempo real.",
      metricLabel: "Lesiones vs. control",
      metricValue: "−41 %",
      citation: "Estudio interno, 1.840 atletas, 2025-26"
    },
    {
      title: "Verificación real",
      subtitle: "Certificaciones validadas",
      body: "Cada certificado se verifica. Entrevista de 30 min. 38 % de candidatos rechazados.",
      metricLabel: "Tasa de rechazo",
      metricValue: "62 %",
      citation: "Onboarding 2026, Trust & Safety"
    },
    {
      title: "Progresión visible",
      subtitle: "El panel del atleta dice la verdad",
      body: "Ritmo, potencia, HRV, RPE, sueño — en un solo lugar.",
      metricLabel: "Objetivos a tiempo",
      metricValue: "73 %",
      citation: "Cohorte 2026 H1"
    },
    {
      title: "Intro gratuita, siempre",
      subtitle: "Nunca pagues antes de hablar con un humano",
      body: "Llamada de 15 min en cada perfil antes de cualquier euro.",
      metricLabel: "Cambio en 30 días",
      metricValue: "<5 %",
      citation: "Análisis de churn 2026"
    },
    {
      title: "Multideporte, una identidad",
      subtitle: "Vinyasa lunes, BJJ miércoles, intervalos sábado",
      body: "Te modelamos como un atleta en varias disciplinas. La recuperación cuenta todo.",
      metricLabel: "Usuarios multideporte",
      metricValue: "61 %",
      citation: "Análisis de usuarios 2026"
    }
  ],
  meta: {
    title: "FitConnect — Entrena con especialistas de élite",
    description:
      "Marketplace de coaches verificados con IA Readiness, sync Strava y sesiones en vivo. Yoga, surf, escalada, MMA y más — presencial u online.",
    ogTitle: "FitConnect — Entrena con especialistas de élite",
    ogDescription:
      "Descubre, reserva y entrena con los mejores coaches deportivos del mundo.",
    twitterDescription:
      "Coaches de élite para cada deporte. IA Readiness, sync Strava e intro gratis de 15 min."
  }
};
