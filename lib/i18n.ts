export type Lang = "en" | "pt";

export const LANGS: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "GB" },
  { code: "pt", label: "Portuguese", native: "Português", flag: "PT" }
];

export const DEFAULT_LANG: Lang = "en";

type Dict = {
  /* nav */
  nav: {
    findCoach: string;
    programs: string;
    community: string;
    methodology: string;
    pricing: string;
    more: string;
    dashboard: string;
    forCoaches: string;
    signIn: string;
    matchMe: string;
    menu: string;
  };
  /* demo banner */
  demo: {
    label: string;
    body: string;
    cta: string;
  };
  /* hero */
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
  /* sports strip */
  sports: {
    eyebrow: string;
    title: string;
    note: string;
  };
  /* features */
  features: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    titleAfter: string;
    subtitle: string;
  };
  /* pricing */
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
  };
  /* faqs */
  faqs: {
    eyebrow: string;
    title1: string;
    titleAccent: string;
    subtitle: string;
  };
  /* cta */
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
  /* footer */
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
  /* dashboard */
  dashboard: {
    eyebrow: string;
    welcome: string;
    streak: string;
  };
  /* signin / signup */
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
  };
  /* fit.me modal */
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
  };
  /* AI assistant */
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
  };
  /* community celebrations */
  community: {
    celebrationsHeading: string;
    celebrationsSub: string;
    chip: {
      pr: string;
      hire: string;
      streak: string;
      booking: string;
    };
  };
  /* generic */
  common: {
    skipToContent: string;
    languageMenu: string;
    selectLanguage: string;
  };
};

const en: Dict = {
  nav: {
    findCoach: "Find a coach",
    programs: "Programs",
    community: "Community",
    methodology: "Methodology",
    pricing: "Pricing",
    more: "More",
    dashboard: "Athlete dashboard",
    forCoaches: "For coaches",
    signIn: "Sign in",
    matchMe: "Match me in 60s",
    menu: "Menu"
  },
  demo: {
    label: "Demo mode",
    body: "Seeded data, no real bookings · sign in / sign up are placeholders.",
    cta: "View source on GitHub"
  },
  hero: {
    livePill: "Live · 12,418 verified specialists across 10 sports",
    title1: "The world's best",
    titleAccent: "specialists",
    title2: "Verified. Vetted. Yours.",
    subtitle:
      "Vinyasa, BJJ, climbing, surf — every sport, by the people who live it. With science-grade tools usually reserved for D1 athletes.",
    primary: "Find my specialist",
    secondary: "How we vet coaches",
    reviewsLine: "27,840 verified reviews",
    rejectedTitle: "62% rejected",
    rejectedBody: "Only the top specialists make it on"
  },
  sports: {
    eyebrow: "10 sports. 0 generalists.",
    title: "A specialist for every discipline",
    note: "Hover a tile · live counts updated 5 minutes ago"
  },
  features: {
    eyebrow: "The complete stack",
    title1: "Not a directory.",
    titleAccent: "An entire training stack",
    titleAfter: ".",
    subtitle:
      "We rebuilt the personal-training experience around what athletes and coaches actually need to get results. Twelve modules — and we're still shipping."
  },
  pricing: {
    eyebrow: "Pricing",
    title1: "Honest, low-floor pricing.",
    titleAccent: "No surprise fees",
    subtitle:
      "€12/mo is a sixteenth of what Future or Caliber charge — because you only pay your coach when you book a session.",
    perMonth: "/month",
    mostPopular: "Most popular",
    start: "Start",
    compareAll: "Compare every feature, fee and FAQ →",
    freeName: "Free",
    freeDesc: "Discover trainers, read reviews, save favourites — forever free.",
    athleteName: "Athlete",
    athleteDesc: "Everything you need for serious, measurable progress.",
    coachName: "Coach",
    coachDesc:
      "Run your coaching business from a single app — keep 85% of every booking."
  },
  faqs: {
    eyebrow: "Questions, answered",
    title1: "We're happy to be",
    titleAccent: "specific",
    subtitle: "Everything we'd want to know if we were signing up tonight."
  },
  cta: {
    pill: "Spring cohort open — 312 spots left",
    title1: "Your",
    titleAccent: "strongest year",
    title2: "starts at 8am tomorrow.",
    subtitle:
      "Join 184,512 athletes who finally found a coach who actually knows their sport. Free to start. Free to try every coach. €12/mo when you're ready.",
    primary: "Match me in 60 seconds",
    secondary: "List your coaching services",
    reassurance: "No credit card · Free 15-min intro with every coach · Cancel any time"
  },
  footer: {
    tagline:
      "The marketplace of verified sport specialists with the science-grade tools usually reserved for D1 athletes.",
    productHeading: "Product",
    companyHeading: "Company",
    legalHeading: "Legal",
    buildHeading: "Build with us",
    buildBody:
      "FitConnect is part of the Querinoz suite. Read our build notes and roadmap on GitHub.",
    seeRepo: "See the repo",
    copyright: "Built in Lisbon with discipline, not hype",
    statusOk: "All systems normal"
  },
  dashboard: {
    eyebrow: "Your athlete OS",
    welcome: "Welcome back, Inês.",
    streak: "You're on a 5-week PR streak — green light to push today."
  },
  auth: {
    signInHeading: "Welcome back, athlete.",
    signUpHeading: "Start training with a real specialist.",
    signInSubtitle: "Sign in to pick up your plan, message your coach, and check today's readiness.",
    signUpSubtitle: "60 seconds to a real coach. Free to browse, free 15-min intro on every booking.",
    continueWith: "Continue with",
    or: "or use email",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    submitSignIn: "Sign in",
    submitSignUp: "Create account",
    noAccount: "New to FitConnect?",
    haveAccount: "Already have an account?",
    createAccount: "Create one",
    signInLink: "Sign in",
    legalNote:
      "By continuing you agree to our Terms and acknowledge our Privacy Policy. We never post on your behalf."
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Send a Fit.Me intro",
    modalSubtitle:
      "One tap. We'll send a 3-line intro that mentions your sport, level and goal. They reply, you reply, you train.",
    previewLabel: "Message preview · auto-generated",
    sendingLabel: "Sending intro…",
    sentTitle: "Intro sent.",
    sentBody:
      "We'll notify you the moment they reply. Most specialists answer within 90 minutes.",
    sendButton: "Send Fit.Me",
    closeButton: "Done",
    poweredBy: "Fit.Me is FitConnect's one-tap intro action."
  },
  ai: {
    bubbleLabel: "Open the FitConnect assistant",
    panelTitle: "Ask FitConnect",
    panelSubtitle: "Your day, your readiness, your next session.",
    demoTag: "Demo mode · canned answers",
    placeholder: "Ask anything about your training…",
    suggestionsHeading: "Try one of these",
    sendLabel: "Send",
    closeLabel: "Close assistant",
    typingLabel: "FitConnect is thinking…"
  },
  community: {
    celebrationsHeading: "Today's celebrations",
    celebrationsSub: "PRs, first sessions and streaks from across the FitConnect community.",
    chip: {
      pr: "Personal record",
      hire: "New coach",
      streak: "Streak",
      booking: "First session"
    }
  },
  common: {
    skipToContent: "Skip to main content",
    languageMenu: "Change language",
    selectLanguage: "Select language"
  }
};

const pt: Dict = {
  nav: {
    findCoach: "Encontrar um coach",
    programs: "Programas",
    community: "Comunidade",
    methodology: "Metodologia",
    pricing: "Preços",
    more: "Mais",
    dashboard: "Painel do atleta",
    forCoaches: "Para coaches",
    signIn: "Entrar",
    matchMe: "Encontrar em 60s",
    menu: "Menu"
  },
  demo: {
    label: "Modo demo",
    body: "Dados seeded, sem reservas reais · sign in/up são placeholders.",
    cta: "Ver código no GitHub"
  },
  hero: {
    livePill: "Ao vivo · 12 418 especialistas verificados em 10 desportos",
    title1: "Os melhores",
    titleAccent: "especialistas",
    title2: "do mundo. Verificados. Avaliados. Teus.",
    subtitle:
      "Vinyasa, BJJ, escalada, surf — todos os desportos, por quem os vive. Com ferramentas de nível científico habitualmente reservadas a atletas universitários americanos.",
    primary: "Encontrar o meu especialista",
    secondary: "Como avaliamos coaches",
    reviewsLine: "27 840 avaliações verificadas",
    rejectedTitle: "62% rejeitados",
    rejectedBody: "Só os melhores especialistas entram"
  },
  sports: {
    eyebrow: "10 desportos. 0 generalistas.",
    title: "Um especialista para cada disciplina",
    note: "Passa o rato · contagens ao vivo, atualizadas há 5 minutos"
  },
  features: {
    eyebrow: "A pilha completa",
    title1: "Não é um diretório.",
    titleAccent: "É uma pilha de treino completa",
    titleAfter: ".",
    subtitle:
      "Reconstruímos a experiência de personal training à volta do que atletas e coaches realmente precisam para obter resultados. Doze módulos — e continuamos a lançar."
  },
  pricing: {
    eyebrow: "Preços",
    title1: "Preços honestos, à entrada.",
    titleAccent: "Sem surpresas",
    subtitle:
      "12 €/mês é um dezasseis-avos do que Future ou Caliber cobram — porque só pagas o teu coach quando marcas uma sessão.",
    perMonth: "/mês",
    mostPopular: "O mais escolhido",
    start: "Começar",
    compareAll: "Comparar todas as features, taxas e FAQs →",
    freeName: "Grátis",
    freeDesc: "Descobre coaches, lê avaliações, guarda favoritos — para sempre, grátis.",
    athleteName: "Atleta",
    athleteDesc: "Tudo o que precisas para um progresso sério e medível.",
    coachName: "Coach",
    coachDesc:
      "Gere o teu negócio de coaching numa só app — fica com 85% de cada reserva."
  },
  faqs: {
    eyebrow: "Perguntas, respondidas",
    title1: "Gostamos de ser",
    titleAccent: "específicos",
    subtitle: "Tudo o que gostaríamos de saber se nos inscrevêssemos esta noite."
  },
  cta: {
    pill: "Cohort de primavera aberta — 312 lugares",
    title1: "O teu",
    titleAccent: "ano mais forte",
    title2: "começa amanhã às 8h.",
    subtitle:
      "Junta-te a 184 512 atletas que finalmente encontraram um coach que realmente conhece o seu desporto. Começar é grátis. Experimentar cada coach é grátis. 12 €/mês quando estiveres pronto.",
    primary: "Encontrar em 60 segundos",
    secondary: "Listar os teus serviços de coaching",
    reassurance:
      "Sem cartão de crédito · Intro grátis de 15 min com cada coach · Cancela quando quiseres"
  },
  footer: {
    tagline:
      "O marketplace de especialistas desportivos verificados, com as ferramentas de nível científico habitualmente reservadas a atletas universitários americanos.",
    productHeading: "Produto",
    companyHeading: "Empresa",
    legalHeading: "Legal",
    buildHeading: "Constrói connosco",
    buildBody:
      "A FitConnect faz parte da suite Querinoz. Lê as nossas notas de desenvolvimento e o roadmap no GitHub.",
    seeRepo: "Ver o repositório",
    copyright: "Construído em Lisboa com disciplina, sem hype",
    statusOk: "Tudo a funcionar"
  },
  dashboard: {
    eyebrow: "O teu sistema de atleta",
    welcome: "Bem-vinda de volta, Inês.",
    streak: "Estás numa série de 5 semanas com PRs — luz verde para puxar hoje."
  },
  auth: {
    signInHeading: "Bem-vindo de volta, atleta.",
    signUpHeading: "Começa a treinar com um especialista a sério.",
    signInSubtitle:
      "Entra para retomares o teu plano, falares com o teu coach e veres a prontidão de hoje.",
    signUpSubtitle:
      "60 segundos até um coach a sério. Explorar é grátis, intro de 15 min grátis em cada reserva.",
    continueWith: "Continuar com",
    or: "ou usa o email",
    emailLabel: "Email",
    emailPlaceholder: "tu@exemplo.com",
    passwordLabel: "Palavra-passe",
    passwordPlaceholder: "Pelo menos 8 caracteres",
    submitSignIn: "Entrar",
    submitSignUp: "Criar conta",
    noAccount: "Novo na FitConnect?",
    haveAccount: "Já tens conta?",
    createAccount: "Criar uma",
    signInLink: "Entrar",
    legalNote:
      "Ao continuar concordas com os nossos Termos e reconheces a nossa Política de Privacidade. Nunca publicamos em teu nome."
  },
  fitme: {
    cta: "Fit.Me",
    modalTitle: "Enviar uma intro Fit.Me",
    modalSubtitle:
      "Um toque. Enviamos uma intro de 3 linhas com o teu desporto, nível e objetivo. Respondem, respondes, treinas.",
    previewLabel: "Pré-visualização · gerada automaticamente",
    sendingLabel: "A enviar intro…",
    sentTitle: "Intro enviada.",
    sentBody:
      "Avisamos-te no momento em que responderem. A maioria dos especialistas responde em 90 minutos.",
    sendButton: "Enviar Fit.Me",
    closeButton: "Concluir",
    poweredBy: "Fit.Me é a ação de intro de um toque da FitConnect."
  },
  ai: {
    bubbleLabel: "Abrir o assistente FitConnect",
    panelTitle: "Pergunta à FitConnect",
    panelSubtitle: "O teu dia, a tua prontidão, o teu próximo treino.",
    demoTag: "Modo demo · respostas predefinidas",
    placeholder: "Pergunta o que quiseres sobre o teu treino…",
    suggestionsHeading: "Experimenta uma destas",
    sendLabel: "Enviar",
    closeLabel: "Fechar assistente",
    typingLabel: "A FitConnect está a pensar…"
  },
  community: {
    celebrationsHeading: "Celebrações de hoje",
    celebrationsSub:
      "PRs, primeiras sessões e séries de toda a comunidade FitConnect.",
    chip: {
      pr: "Recorde pessoal",
      hire: "Novo coach",
      streak: "Série",
      booking: "Primeira sessão"
    }
  },
  common: {
    skipToContent: "Saltar para o conteúdo principal",
    languageMenu: "Alterar idioma",
    selectLanguage: "Selecionar idioma"
  }
};

export const dict: Record<Lang, Dict> = { en, pt };

export type TFn = <K1 extends keyof Dict, K2 extends keyof Dict[K1]>(
  group: K1,
  key: K2
) => Dict[K1][K2];
