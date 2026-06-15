export type LandingInfoCard = {
  title: string;
  description: string;
  icon: string; // SVG path or icon identifier
  iconPath?: string; // For image-based icons
  tabAlign: "left" | "center" | "right";
};

export type LandingBenefit = {
  title: string;
  imagePath: string;
  imageAlt: string;
};

export type LandingResource = {
  imagePath: string;
  imageAlt: string;
};

export const LANDING_INFO_CARDS: LandingInfoCard[] = [
  {
    title: "¿Qué es?",
    description:
      "Es una extensión para Visual Studio Code diseñada para facilitar la metodología de Desarrollo Guiado por Pruebas (TDD).",
    icon: "?",
    tabAlign: "left",
  },
  {
    title: "¿Cómo funciona?",
    description:
      "Funciona mediante un ciclo rápido de tres pasos: Rojo (crear un test que falla), Verde (escribir el código mínimo para que pase) y Refactorizar (mejorar el código).",
    icon: "|||",
    iconPath: "/landing/icon-sliders.svg",
    tabAlign: "center",
  },
  {
    title: "¿Para qué sirve?",
    description:
      "Sirve para implementar una metodología de desarrollo de software donde se escriben las pruebas unitarias antes que el código funcional, garantizando un código más limpio, seguro, escalable y con menos errores, automatizando la verificación desde el inicio.",
    icon: "o",
    iconPath: "/landing/icon-bulb.svg",
    tabAlign: "right",
  },
];

export const LANDING_BENEFITS: LandingBenefit[] = [
  {
    title: "Fundamentos de TDD",
    imagePath: "/landing/beneficios-1.png",
    imageAlt: "Ciclo de TDD red green refactor",
  },
  {
    title: "Practicas guiadas",
    imagePath: "/landing/beneficios-2.png",
    imageAlt: "Personas trabajando en laptop en una sesión guiada",
  },
  {
    title: "Comunidad activa",
    imagePath: "/landing/beneficios-3.png",
    imageAlt: "Equipo colaborando alrededor de una mesa",
  },
];

export const LANDING_RESOURCES: LandingResource[] = [
  {
    imagePath: "/landing/recursos-1.jpg",
    imageAlt: "Escritorio con monitor mostrando código",
  },
  {
    imagePath: "/landing/recursos-2.jpg",
    imageAlt: "Análisis de datos en equipo",
  },
  {
    imagePath: "/landing/recursos-3.jpg",
    imageAlt: "Manos unidas representando colaboración",
  },
  {
    imagePath: "/landing/recursos-4.jpg",
    imageAlt: "Fragmento de código en pantalla",
  },
  {
    imagePath: "/landing/recursos-5.jpg",
    imageAlt: "Persona trabajando en portátil",
  },
];

export const LANDING_COPY = {
  heroTitle: "Todo para crear software,\nsin complicaciones.",
  heroSubtitle:
    "Una plataforma todo-en-uno que permite a los desarrolladores probar, ver resultados al instante y aplicar el ciclo rojo-verde-refactor de forma ágil y eficiente.",
  benefitsTitle: "Aprovecha al máximo todos\nlos beneficios",
  resourcesTitle: "Disfruta de nuestros\nrecursos",
  ctaTitle: "EMPIEZA HOY Y\nCONSTRUYE SIN LÍMITES",
  ctaSubtitle:
    "Únete a cientos de desarrolladores que ya optimizan su código con información en tiempo real.",
  authButtonText: "Comienza ahora",
  heroButtonText: "Ir a TDD Lab",
};


