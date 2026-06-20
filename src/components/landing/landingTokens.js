// src/components/landing/landingTokens.js — B2B Light Theme
//
// Landing uses a corporate green palette (#1B5E20 forest) for B2B positioning.
// App uses a vibrant palette (#3DDC84 neon) defined in index.css @theme tokens.
// Both are intentional — the landing targets decision-makers, the app targets end-users.

export const C = {
  bgMain:      "#FFFFFF",
  bgAlt:       "#F8F9FA",
  bgCard:      "#FFFFFF",
  primary:     "#1B5E20",
  secondary:   "#2E7D32",
  accent:      "#66BB6A",
  gold:        "#BF9000",
  goldBg:      "#FFFBEB",
  textPrimary: "#1A1A1A",
  textMuted:   "#4A5568",
  textLight:   "#718096",
  border:      "#E2E8F0",
  borderGreen: "rgba(27,94,32,0.15)",
  white:       "#FFFFFF",
  heroGrad:    "linear-gradient(135deg, #0D2818 0%, #1B5E20 55%, #2E7D32 100%)",
  ctaGrad:     "linear-gradient(135deg, #0D2818 0%, #1B5E20 55%, #2E7D32 100%)",
  shadow:      "0 2px 12px rgba(0,0,0,0.06)",
  shadowMd:    "0 6px 24px rgba(0,0,0,0.09)",
  shadowLg:    "0 16px 56px rgba(0,0,0,0.13)",
};

export const fadeInUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.18 } },
};

export const floatAnim = {
  animate:    { y: [0, -10, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

export const fadeInUpSafe = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const staggerSafe = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
};
