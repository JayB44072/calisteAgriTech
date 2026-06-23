// src/lib/animations.ts
// Bibliothèque d'animations fluides pour CherilleTech
// Utilise uniquement des classes Tailwind + CSS custom - pas de dépendance externe requise

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -32 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 32 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const cardHover = "transition-all duration-300 hover:shadow-xl hover:-translate-y-1";
export const buttonHover = "transition-all duration-200 active:scale-95";
export const navItemHover = "transition-colors duration-200";

// Délai de stagger pour listes (index * délai en ms)
export const staggerDelay = (index: number, base = 60) =>
  `${index * base}ms`;

// CSS keyframes injectés via tailwind.config ou index.css
export const ANIMATION_CLASSES = {
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  slideInLeft: "animate-slide-in-left",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
  shimmer: "animate-shimmer",
} as const;