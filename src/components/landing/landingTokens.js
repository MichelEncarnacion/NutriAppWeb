// src/components/landing/landingTokens.js

export const C = {
  bgMain:    "#0D1117",
  bgCard:    "#161B22",
  bgFooter:  "#060a0f",
  bgAlt:     "#0a0f16",
  green:     "#3DDC84",
  teal:      "#58A6FF",
  textPrimary: "#E6EDF3",
  textMuted:   "#7D8590",
  border:    "rgba(61,220,132,0.15)",
  glow:      "rgba(61,220,132,0.25)",
};

export const fadeInUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};
