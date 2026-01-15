// Internationalization support
export type Language = "en" | "es" | "ar";

export interface Translations {
  // Homepage
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  requestDemo: string;
  exploreFeatures: string;
  designedFor: string;
  playersIndexed: string;
  simulations: string;
  dataPoints: string;
  analysisTime: string;
  aiPoweredFeatures: string;
  intelligentAgents: string;
  intelligentAgentsDesc: string;
  conversationalSearch: string;
  conversationalSearchDesc: string;
  monteCarloSimulations: string;
  monteCarloSimulationsDesc: string;
  contextualFitScoring: string;
  contextualFitScoringDesc: string;
  whatsappIntegration: string;
  whatsappIntegrationDesc: string;
  marketValueEngine: string;
  marketValueEngineDesc: string;
  professionalReports: string;
  professionalReportsDesc: string;
  process: string;
  howItWorks: string;
  howItWorksDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  fasterDecisions: string;
  fasterDecisionsDesc: string;
  getStarted: string;
  readyToDeploy: string;
  readyToDeployDesc: string;
  enterWorkEmail: string;
  requestReceived: string;
  requestReceivedDesc: string;
  noCommitment: string;
  features: string;
  contact: string;

  // Navigation
  dashboard: string;
  aiAssistant: string;
  playerSearch: string;
  watchlist: string;
  comparePlayers: string;
  reports: string;
  analytics: string;
  salePages: string;
  clubProfile: string;
  settings: string;
  signOut: string;

  // Dashboard
  welcomeBack: string;
  searchesToday: string;
  playersAnalyzed: string;
  avgFitScore: string;
  topFitsForClub: string;
  viewAll: string;
  recentlyViewed: string;
  quickActions: string;
  askAiAssistant: string;
  searchPlayers: string;
  viewWatchlist: string;
  fitScore: string;

  // Chat
  howCanIHelp: string;
  askAboutPlayers: string;
  analyzing: string;
  sendMessage: string;

  // Search
  searchPlayersPlaceholder: string;
  filters: string;
  positions: string;
  ageRange: string;
  leagues: string;
  transferStatus: string;
  clearAllFilters: string;
  sortBy: string;
  marketValue: string;
  age: string;
  rating: string;
  potential: string;
  playersFound: string;

  // Player Profile
  overview: string;
  statistics: string;
  career: string;
  analysis: string;
  generateReport: string;
  addToWatchlist: string;
  removeFromWatchlist: string;
  addToComparison: string;
  currentClub: string;
  contractExpiry: string;
  estimatedSalary: string;
  tacticalRole: string;
  strengths: string;
  weaknesses: string;

  // Common
  loading: string;
  error: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  close: string;
  next: string;
  back: string;
  years: string;
  minutes: string;
  goals: string;
  assists: string;
  appearances: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Homepage
    heroTitle1: "AI-Powered",
    heroTitle2: "Football Intelligence",
    heroSubtitle: "Transform your transfer strategy with real-time data analysis, contextual fit scoring, and predictive simulations.",
    requestDemo: "Request Demo",
    exploreFeatures: "Explore Features",
    designedFor: "Designed for clubs competing in",
    playersIndexed: "Players Indexed",
    simulations: "Simulations",
    dataPoints: "Data Points",
    analysisTime: "Analysis Time",
    aiPoweredFeatures: "AI-Powered Features",
    intelligentAgents: "Intelligent Agents at Your Service",
    intelligentAgentsDesc: "Our AI Agents work around the clock to deliver insights that accelerate your decision-making.",
    conversationalSearch: "Conversational Search",
    conversationalSearchDesc: "Ask questions in natural language. Get instant player recommendations matching your club's tactical model and budget.",
    monteCarloSimulations: "Monte Carlo Simulations",
    monteCarloSimulationsDesc: "Quantify the squad impact of any signing with thousands of simulations. See projected points, goals, and table positions.",
    contextualFitScoring: "Contextual Fit Scoring",
    contextualFitScoringDesc: "Every player rated against your club's playing model, positional needs, and tactical preferences. Clear fit indicators.",
    whatsappIntegration: "WhatsApp Integration",
    whatsappIntegrationDesc: "Forward any player link to SKOUTEX bot. Get instant analysis with fit score and executive summary directly in WhatsApp.",
    marketValueEngine: "Market Value Engine",
    marketValueEngineDesc: "AI-generated internal valuations using performance data, transfer history, and market context. No more guesswork.",
    professionalReports: "Professional Reports",
    professionalReportsDesc: "One-click PDF generation with visual charts, spider graphs, and heatmaps. Share branded analysis links with stakeholders.",
    process: "Process",
    howItWorks: "How It Works",
    howItWorksDesc: "From player inquiry to data-driven decision in seconds.",
    step1Title: "Ask or Forward",
    step1Desc: "Type a natural language query or forward a player link via WhatsApp. SKOUTEX understands context.",
    step2Title: "Agent Processing",
    step2Desc: "Your AI Agent runs Monte Carlo simulations and evaluates fit against your club profile in real-time.",
    step3Title: "Decide & Share",
    step3Desc: "Get fit scores, projected impact, and visual reports. Share with decision-makers instantly.",
    fasterDecisions: "Faster decisions. Smarter outcomes.",
    fasterDecisionsDesc: "SKOUTEX AI Agents transform football intelligence, giving clubs the competitive edge they need in every decision.",
    getStarted: "Get Started",
    readyToDeploy: "Ready to Deploy Your AI Agent?",
    readyToDeployDesc: "Request a demo to see how SKOUTEX AI Agents can accelerate your club's football intelligence.",
    enterWorkEmail: "Enter your work email",
    requestReceived: "Request Received",
    requestReceivedDesc: "Our team will be in touch within 24 hours to schedule your demo.",
    noCommitment: "No commitment required. We'll reach out to schedule a personalized demo.",
    features: "Features",
    contact: "Contact",

    // Navigation
    dashboard: "Dashboard",
    aiAssistant: "AI Assistant",
    playerSearch: "Player Search",
    watchlist: "Watchlist",
    comparePlayers: "Compare Players",
    reports: "Reports",
    analytics: "Analytics",
    salePages: "Sale Pages",
    clubProfile: "Club Profile",
    settings: "Settings",
    signOut: "Sign Out",

    // Dashboard
    welcomeBack: "Welcome back to SKOUTEX",
    searchesToday: "Searches Today",
    playersAnalyzed: "Players Analyzed",
    avgFitScore: "Avg Fit Score",
    topFitsForClub: "Top Fits for Your Club",
    viewAll: "View all",
    recentlyViewed: "Recently Viewed",
    quickActions: "Quick Actions",
    askAiAssistant: "Ask AI Assistant",
    searchPlayers: "Search Players",
    viewWatchlist: "View Watchlist",
    fitScore: "Fit Score",

    // Chat
    howCanIHelp: "How can I help you today?",
    askAboutPlayers: "Ask me about players, transfers, tactics, or market insights",
    analyzing: "Analyzing...",
    sendMessage: "Send message",

    // Search
    searchPlayersPlaceholder: "Search players by name, club, or nationality...",
    filters: "Filters",
    positions: "Positions",
    ageRange: "Age Range",
    leagues: "Leagues",
    transferStatus: "Transfer Status",
    clearAllFilters: "Clear all filters",
    sortBy: "Sort by",
    marketValue: "Market Value",
    age: "Age",
    rating: "Rating",
    potential: "Potential",
    playersFound: "players found",

    // Player Profile
    overview: "Overview",
    statistics: "Statistics",
    career: "Career",
    analysis: "Analysis",
    generateReport: "Generate Report",
    addToWatchlist: "Add to Watchlist",
    removeFromWatchlist: "Remove from Watchlist",
    addToComparison: "Add to Comparison",
    currentClub: "Current Club",
    contractExpiry: "Contract Expiry",
    estimatedSalary: "Estimated Salary",
    tacticalRole: "Tactical Role",
    strengths: "Strengths",
    weaknesses: "Weaknesses",

    // Common
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    next: "Next",
    back: "Back",
    years: "years",
    minutes: "minutes",
    goals: "Goals",
    assists: "Assists",
    appearances: "Appearances",
  },
  es: {
    // Homepage
    heroTitle1: "Inteligencia",
    heroTitle2: "Futbolistica con IA",
    heroSubtitle: "Transforma tu estrategia de fichajes con analisis de datos en tiempo real, puntuacion de ajuste contextual y simulaciones predictivas.",
    requestDemo: "Solicitar Demo",
    exploreFeatures: "Explorar Funciones",
    designedFor: "Disenado para clubes que compiten en",
    playersIndexed: "Jugadores Indexados",
    simulations: "Simulaciones",
    dataPoints: "Puntos de Datos",
    analysisTime: "Tiempo de Analisis",
    aiPoweredFeatures: "Funciones con IA",
    intelligentAgents: "Agentes Inteligentes a Tu Servicio",
    intelligentAgentsDesc: "Nuestros Agentes de IA trabajan las 24 horas para ofrecerte insights que aceleran tu toma de decisiones.",
    conversationalSearch: "Busqueda Conversacional",
    conversationalSearchDesc: "Haz preguntas en lenguaje natural. Obtén recomendaciones instantaneas de jugadores que coinciden con el modelo tactico y presupuesto de tu club.",
    monteCarloSimulations: "Simulaciones Monte Carlo",
    monteCarloSimulationsDesc: "Cuantifica el impacto en la plantilla de cualquier fichaje con miles de simulaciones. Ve puntos proyectados, goles y posiciones en la tabla.",
    contextualFitScoring: "Puntuacion de Ajuste Contextual",
    contextualFitScoringDesc: "Cada jugador evaluado contra el modelo de juego de tu club, necesidades posicionales y preferencias tacticas. Indicadores claros de ajuste.",
    whatsappIntegration: "Integracion con WhatsApp",
    whatsappIntegrationDesc: "Reenvia cualquier enlace de jugador al bot de SKOUTEX. Obtén analisis instantaneo con puntuacion de ajuste y resumen ejecutivo directamente en WhatsApp.",
    marketValueEngine: "Motor de Valor de Mercado",
    marketValueEngineDesc: "Valoraciones internas generadas por IA usando datos de rendimiento, historial de transferencias y contexto de mercado. Sin mas conjeturas.",
    professionalReports: "Informes Profesionales",
    professionalReportsDesc: "Generacion de PDF con un clic con graficos visuales, graficos de arana y mapas de calor. Comparte enlaces de analisis con tu marca con las partes interesadas.",
    process: "Proceso",
    howItWorks: "Como Funciona",
    howItWorksDesc: "De la consulta del jugador a la decision basada en datos en segundos.",
    step1Title: "Pregunta o Reenvia",
    step1Desc: "Escribe una consulta en lenguaje natural o reenvia un enlace de jugador via WhatsApp. SKOUTEX entiende el contexto.",
    step2Title: "Procesamiento del Agente",
    step2Desc: "Tu Agente de IA ejecuta simulaciones Monte Carlo y evalua el ajuste contra el perfil de tu club en tiempo real.",
    step3Title: "Decide y Comparte",
    step3Desc: "Obtén puntuaciones de ajuste, impacto proyectado e informes visuales. Comparte con los tomadores de decisiones al instante.",
    fasterDecisions: "Decisiones mas rapidas. Resultados mas inteligentes.",
    fasterDecisionsDesc: "Los Agentes de IA de SKOUTEX transforman la inteligencia futbolistica, dando a los clubes la ventaja competitiva que necesitan en cada decision.",
    getStarted: "Comenzar",
    readyToDeploy: "Listo para Desplegar tu Agente de IA?",
    readyToDeployDesc: "Solicita una demo para ver como los Agentes de IA de SKOUTEX pueden acelerar la inteligencia futbolistica de tu club.",
    enterWorkEmail: "Ingresa tu correo de trabajo",
    requestReceived: "Solicitud Recibida",
    requestReceivedDesc: "Nuestro equipo se pondra en contacto dentro de 24 horas para programar tu demo.",
    noCommitment: "Sin compromiso requerido. Nos comunicaremos para programar una demo personalizada.",
    features: "Funciones",
    contact: "Contacto",

    // Navigation
    dashboard: "Panel",
    aiAssistant: "Asistente IA",
    playerSearch: "Buscar Jugadores",
    watchlist: "Seguimiento",
    comparePlayers: "Comparar Jugadores",
    reports: "Informes",
    analytics: "Análisis",
    salePages: "Páginas de Venta",
    clubProfile: "Perfil del Club",
    settings: "Configuración",
    signOut: "Cerrar Sesión",

    // Dashboard
    welcomeBack: "Bienvenido a SKOUTEX",
    searchesToday: "Búsquedas Hoy",
    playersAnalyzed: "Jugadores Analizados",
    avgFitScore: "Ajuste Promedio",
    topFitsForClub: "Mejores Ajustes para tu Club",
    viewAll: "Ver todos",
    recentlyViewed: "Vistos Recientemente",
    quickActions: "Acciones Rápidas",
    askAiAssistant: "Preguntar al Asistente IA",
    searchPlayers: "Buscar Jugadores",
    viewWatchlist: "Ver Seguimiento",
    fitScore: "Puntuación de Ajuste",

    // Chat
    howCanIHelp: "¿Cómo puedo ayudarte hoy?",
    askAboutPlayers: "Pregúntame sobre jugadores, fichajes, tácticas o el mercado",
    analyzing: "Analizando...",
    sendMessage: "Enviar mensaje",

    // Search
    searchPlayersPlaceholder: "Buscar jugadores por nombre, club o nacionalidad...",
    filters: "Filtros",
    positions: "Posiciones",
    ageRange: "Rango de Edad",
    leagues: "Ligas",
    transferStatus: "Estado de Fichaje",
    clearAllFilters: "Limpiar filtros",
    sortBy: "Ordenar por",
    marketValue: "Valor de Mercado",
    age: "Edad",
    rating: "Puntuación",
    potential: "Potencial",
    playersFound: "jugadores encontrados",

    // Player Profile
    overview: "Resumen",
    statistics: "Estadísticas",
    career: "Carrera",
    analysis: "Análisis",
    generateReport: "Generar Informe",
    addToWatchlist: "Añadir a Seguimiento",
    removeFromWatchlist: "Quitar de Seguimiento",
    addToComparison: "Añadir a Comparación",
    currentClub: "Club Actual",
    contractExpiry: "Fin de Contrato",
    estimatedSalary: "Salario Estimado",
    tacticalRole: "Rol Táctico",
    strengths: "Fortalezas",
    weaknesses: "Debilidades",

    // Common
    loading: "Cargando...",
    error: "Error",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    next: "Siguiente",
    back: "Atrás",
    years: "años",
    minutes: "minutos",
    goals: "Goles",
    assists: "Asistencias",
    appearances: "Partidos",
  },
  ar: {
    // Homepage
    heroTitle1: "ذكاء كرة القدم",
    heroTitle2: "بالذكاء الاصطناعي",
    heroSubtitle: "حول استراتيجية الانتقالات الخاصة بك مع تحليل البيانات في الوقت الفعلي وتسجيل التوافق السياقي والمحاكاة التنبؤية.",
    requestDemo: "طلب عرض توضيحي",
    exploreFeatures: "استكشف الميزات",
    designedFor: "مصمم للأندية المنافسة في",
    playersIndexed: "لاعب مفهرس",
    simulations: "محاكاة",
    dataPoints: "نقاط بيانات",
    analysisTime: "وقت التحليل",
    aiPoweredFeatures: "ميزات مدعومة بالذكاء الاصطناعي",
    intelligentAgents: "وكلاء أذكياء في خدمتك",
    intelligentAgentsDesc: "يعمل وكلاء الذكاء الاصطناعي لدينا على مدار الساعة لتقديم رؤى تسرع عملية اتخاذ القرار.",
    conversationalSearch: "البحث المحادثي",
    conversationalSearchDesc: "اطرح أسئلة بلغة طبيعية. احصل على توصيات فورية للاعبين تتوافق مع النموذج التكتيكي والميزانية لناديك.",
    monteCarloSimulations: "محاكاة مونت كارلو",
    monteCarloSimulationsDesc: "قم بقياس تأثير أي صفقة على الفريق من خلال آلاف المحاكاة. شاهد النقاط المتوقعة والأهداف ومراكز الجدول.",
    contextualFitScoring: "تسجيل التوافق السياقي",
    contextualFitScoringDesc: "كل لاعب يتم تقييمه مقابل نموذج لعب ناديك والاحتياجات الموقعية والتفضيلات التكتيكية. مؤشرات توافق واضحة.",
    whatsappIntegration: "تكامل واتساب",
    whatsappIntegrationDesc: "أرسل أي رابط لاعب إلى بوت SKOUTEX. احصل على تحليل فوري مع نسبة التوافق والملخص التنفيذي مباشرة في واتساب.",
    marketValueEngine: "محرك القيمة السوقية",
    marketValueEngineDesc: "تقييمات داخلية يتم إنشاؤها بواسطة الذكاء الاصطناعي باستخدام بيانات الأداء وتاريخ الانتقالات وسياق السوق. لا مزيد من التخمين.",
    professionalReports: "تقارير احترافية",
    professionalReportsDesc: "إنشاء PDF بنقرة واحدة مع رسوم بيانية مرئية ورسوم العنكبوت وخرائط الحرارة. شارك روابط التحليل ذات العلامة التجارية مع أصحاب المصلحة.",
    process: "العملية",
    howItWorks: "كيف يعمل",
    howItWorksDesc: "من استفسار اللاعب إلى القرار المبني على البيانات في ثوانٍ.",
    step1Title: "اسأل أو أرسل",
    step1Desc: "اكتب استعلامًا بلغة طبيعية أو أرسل رابط لاعب عبر واتساب. SKOUTEX يفهم السياق.",
    step2Title: "معالجة الوكيل",
    step2Desc: "يقوم وكيل الذكاء الاصطناعي الخاص بك بتشغيل محاكاة مونت كارلو وتقييم التوافق مع ملف ناديك في الوقت الفعلي.",
    step3Title: "قرر وشارك",
    step3Desc: "احصل على نسب التوافق والتأثير المتوقع والتقارير المرئية. شارك مع صناع القرار على الفور.",
    fasterDecisions: "قرارات أسرع. نتائج أذكى.",
    fasterDecisionsDesc: "وكلاء SKOUTEX للذكاء الاصطناعي يحولون ذكاء كرة القدم، مما يمنح الأندية الميزة التنافسية التي يحتاجونها في كل قرار.",
    getStarted: "ابدأ الآن",
    readyToDeploy: "مستعد لنشر وكيل الذكاء الاصطناعي الخاص بك؟",
    readyToDeployDesc: "اطلب عرضًا توضيحيًا لترى كيف يمكن لوكلاء SKOUTEX للذكاء الاصطناعي تسريع ذكاء كرة القدم في ناديك.",
    enterWorkEmail: "أدخل بريدك الإلكتروني للعمل",
    requestReceived: "تم استلام الطلب",
    requestReceivedDesc: "سيتواصل فريقنا معك خلال 24 ساعة لجدولة العرض التوضيحي الخاص بك.",
    noCommitment: "لا التزام مطلوب. سنتواصل معك لجدولة عرض توضيحي مخصص.",
    features: "الميزات",
    contact: "اتصل بنا",

    // Navigation
    dashboard: "لوحة التحكم",
    aiAssistant: "المساعد الذكي",
    playerSearch: "البحث عن لاعبين",
    watchlist: "قائمة المتابعة",
    comparePlayers: "مقارنة اللاعبين",
    reports: "التقارير",
    analytics: "التحليلات",
    salePages: "صفحات البيع",
    clubProfile: "ملف النادي",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",

    // Dashboard
    welcomeBack: "مرحباً بعودتك إلى SKOUTEX",
    searchesToday: "عمليات البحث اليوم",
    playersAnalyzed: "اللاعبون المحللون",
    avgFitScore: "متوسط التوافق",
    topFitsForClub: "أفضل اللاعبين لناديك",
    viewAll: "عرض الكل",
    recentlyViewed: "المشاهدات الأخيرة",
    quickActions: "إجراءات سريعة",
    askAiAssistant: "اسأل المساعد الذكي",
    searchPlayers: "البحث عن لاعبين",
    viewWatchlist: "عرض قائمة المتابعة",
    fitScore: "نسبة التوافق",

    // Chat
    howCanIHelp: "كيف يمكنني مساعدتك اليوم؟",
    askAboutPlayers: "اسألني عن اللاعبين أو الانتقالات أو التكتيكات أو السوق",
    analyzing: "جاري التحليل...",
    sendMessage: "إرسال رسالة",

    // Search
    searchPlayersPlaceholder: "ابحث عن لاعبين بالاسم أو النادي أو الجنسية...",
    filters: "الفلاتر",
    positions: "المراكز",
    ageRange: "الفئة العمرية",
    leagues: "الدوريات",
    transferStatus: "حالة الانتقال",
    clearAllFilters: "مسح الفلاتر",
    sortBy: "ترتيب حسب",
    marketValue: "القيمة السوقية",
    age: "العمر",
    rating: "التقييم",
    potential: "الإمكانيات",
    playersFound: "لاعب تم العثور عليهم",

    // Player Profile
    overview: "نظرة عامة",
    statistics: "الإحصائيات",
    career: "المسيرة",
    analysis: "التحليل",
    generateReport: "إنشاء تقرير",
    addToWatchlist: "إضافة للمتابعة",
    removeFromWatchlist: "إزالة من المتابعة",
    addToComparison: "إضافة للمقارنة",
    currentClub: "النادي الحالي",
    contractExpiry: "انتهاء العقد",
    estimatedSalary: "الراتب التقديري",
    tacticalRole: "الدور التكتيكي",
    strengths: "نقاط القوة",
    weaknesses: "نقاط الضعف",

    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    delete: "حذف",
    edit: "تعديل",
    close: "إغلاق",
    next: "التالي",
    back: "رجوع",
    years: "سنة",
    minutes: "دقيقة",
    goals: "أهداف",
    assists: "تمريرات حاسمة",
    appearances: "مباريات",
  },
};

export function getDirection(lang: Language): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("skoutex-language") as Language;
  return stored && ["en", "es", "ar"].includes(stored) ? stored : "en";
}
