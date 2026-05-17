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
    title1: "Los mejores",
    titleAccent: "especialistas",
    title2: "del mundo. Verificados. Evaluados. Tuyos.",
    subtitle:
      "Vinyasa, BJJ, escalada, surf — cada deporte, con quienes lo viven. Con herramientas de nivel científico reservadas habitualmente a atletas universitarios de élite.",
    primary: "Encontrar mi especialista",
    secondary: "Cómo evaluamos a los coaches",
    reviewsLine: "27.840 reseñas verificadas",
    rejectedTitle: "62 % rechazados",
    rejectedBody: "Solo los mejores especialistas entran"
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
        "Panel completo del atleta (HRV, sueño, IA)",
        "Acceso a la biblioteca de programas",
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
    statusOk: "Todos los sistemas operativos"
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
    retentionInsights: "Insights de retención"
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
  }
};
