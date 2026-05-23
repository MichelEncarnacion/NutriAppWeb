# Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mejorar visualmente el landing de NutriApp con animaciones dinámicas, mockup 3D flotante, contadores animados, nueva sección de testimonios y un CTA más impactante — sin reescribir, solo capas visuales encima del código existente.

**Architecture:** Mejora progresiva sobre 5 componentes existentes + 1 componente nuevo (`LandingTestimonials`). Cada tarea es independiente y deja el sitio funcional al terminar. No se cambia routing, auth ni estado global.

**Tech Stack:** React 19, MUI v6, Framer Motion v12.3.0 (ya instalado, incluye `useInView`), react-countup (instalar), Lucide React, React Router v7.

---

## Mapa de archivos

| Archivo | Acción |
|---|---|
| `package.json` | Agregar `react-countup` |
| `src/components/landing/landingTokens.js` | Agregar tokens `floatAnim`, `pulseAnim` |
| `src/components/landing/LandingHero.jsx` | Modificar: orbes, 3D mockup, CountUp, badge, shimmer |
| `src/components/landing/LandingBenefits.jsx` | Modificar: eyebrow, icon hover, progress bars, stagger |
| `src/components/landing/LandingHowItWorks.jsx` | Modificar: conector animado, ring icons, mini screenshots, chips |
| `src/components/landing/LandingTestimonials.jsx` | Crear nuevo |
| `src/pages/Landing.jsx` | Agregar import + `<LandingTestimonials />` |
| `src/components/landing/LandingCTA.jsx` | Modificar: orbes, badge, shimmer botón, headline animado |

---

## Task 1: Instalar react-countup

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Instalar dependencia**

```bash
cd NutriAppWeb && npm install react-countup
```

Resultado esperado: `added 1 package` sin errores. `react-countup` aparece en `dependencies` de `package.json`.

- [ ] **Step 2: Verificar instalación**

```bash
node -e "require('react-countup'); console.log('ok')"
```

Resultado esperado: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-countup for animated KPI counters"
```

---

## Task 2: Actualizar landingTokens.js

**Files:**
- Modify: `src/components/landing/landingTokens.js`

- [ ] **Step 1: Agregar tokens de animación**

Reemplaza el contenido completo de `src/components/landing/landingTokens.js` con:

```js
// src/components/landing/landingTokens.js — B2B Light Theme

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

export const cardHover = {
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    transform: "translateY(-4px)",
  },
};

export const floatAnim = {
  animate:    { y: [0, -10, 0] },
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

export const pulseAnim = {
  animate:    { scale: [1, 1.4, 1] },
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/landingTokens.js
git commit -m "feat(tokens): add floatAnim, pulseAnim tokens and deepen heroGrad/ctaGrad"
```

---

## Task 3: Mejorar LandingHero.jsx

**Files:**
- Modify: `src/components/landing/LandingHero.jsx`

**Cambios:** orbes animadas de fondo, mockup con perspectiva 3D + flotación, KPIs con CountUp, badge flotante con punto pulsante, shimmer en gradiente de headline.

- [ ] **Step 1: Reemplazar LandingHero.jsx completo**

Reemplaza `src/components/landing/LandingHero.jsx` con:

```jsx
// src/components/landing/LandingHero.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { C, fadeInUp, stagger, floatAnim, pulseAnim } from "./landingTokens";

const TRUST_BADGES = [
  "NOM-030 / NOM-035",
  "IoT propio · NutriiPoint",
  "IA clínica certificada",
];

const EMPLOYEES = [
  { name: "Ana García",    dept: "Finanzas",    score: 87, trend: "+12 pts" },
  { name: "Carlos Méndez", dept: "Operaciones", score: 74, trend: "+8 pts"  },
  { name: "Laura Torres",  dept: "Ventas",      score: 91, trend: "+19 pts" },
];

const KPIS = [
  { label: "Ausentismo",    end: 38, prefix: "−", suffix: "%", sub: "vs. año ant.", color: "#A5D6A7" },
  { label: "Productividad", end: 24, prefix: "+", suffix: "%", sub: "índice gral.", color: "#81C784" },
];

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: C.heroGrad,
        minHeight:  "100vh",
        display:    "flex",
        alignItems: "center",
        pt:         { xs: 11, md: 10 },
        pb:         { xs: 8, md: 10 },
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Radial gradients base */}
      <Box
        sx={{
          position:        "absolute",
          inset:           0,
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          pointerEvents:   "none",
        }}
      />

      {/* Orbe top-right */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          top:          "-10%",
          right:        "3%",
          width:        "38%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(165,214,167,0.18), transparent 70%)",
          filter:       "blur(50px)",
          pointerEvents:"none",
        }}
      />

      {/* Orbe bottom-left */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position:     "absolute",
          bottom:       "5%",
          left:         "-5%",
          width:        "30%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(67,160,71,0.14), transparent 70%)",
          filter:       "blur(60px)",
          pointerEvents:"none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
            gap:                 { xs: 6, lg: 8 },
            alignItems:          "center",
          }}
        >
          {/* Left column */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            <motion.div variants={fadeInUp}>
              <Typography
                component="h1"
                sx={{
                  color:         C.white,
                  fontFamily:    "Plus Jakarta Sans, sans-serif",
                  fontWeight:    900,
                  fontSize:      { xs: "2.3rem", md: "3rem", lg: "3.4rem" },
                  lineHeight:    1.12,
                  mb:            3,
                  letterSpacing: "-0.01em",
                }}
              >
                Tus colaboradores más sanos.{" "}
                <Box
                  component="span"
                  sx={{
                    color:                "transparent",
                    backgroundImage:      "linear-gradient(90deg, #A5D6A7, #E8F5E9, #A5D6A7)",
                    backgroundSize:       "200% auto",
                    WebkitBackgroundClip: "text",
                    backgroundClip:       "text",
                    animation:            "shimmerText 4s linear infinite",
                    "@keyframes shimmerText": {
                      "0%":   { backgroundPosition: "0% center" },
                      "100%": { backgroundPosition: "200% center" },
                    },
                  }}
                >
                  Tu empresa más productiva.
                </Box>
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography
                sx={{
                  color:      "rgba(255,255,255,0.82)",
                  fontSize:   { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.78,
                  mb:         4,
                  maxWidth:   500,
                }}
              >
                Medimos a cada colaborador con nuestro propio hardware, generamos un plan
                nutricional con IA y entregamos a RR.HH. un dashboard con KPIs de
                productividad y retorno de inversión reales.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 5 }}>
                <Button
                  onClick={() => navigate("/demo")}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    bgcolor:       C.white,
                    color:         C.primary,
                    fontWeight:    800,
                    textTransform: "none",
                    borderRadius:  "12px",
                    px:            3.5,
                    py:            1.5,
                    fontSize:      "1rem",
                    boxShadow:     "0 4px 24px rgba(0,0,0,0.18)",
                    "&:hover":     { bgcolor: "#F0FFF4", boxShadow: "0 6px 32px rgba(0,0,0,0.22)" },
                  }}
                >
                  Solicitar demo
                </Button>

                <Button
                  href="#como-funciona"
                  component="a"
                  size="large"
                  startIcon={<PlayCircle size={18} />}
                  sx={{
                    color:         C.white,
                    border:        "1.5px solid rgba(255,255,255,0.4)",
                    textTransform: "none",
                    fontWeight:    600,
                    borderRadius:  "12px",
                    px:            3,
                    py:            1.5,
                    fontSize:      "1rem",
                    "&:hover":     { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.7)" },
                  }}
                >
                  Ver cómo funciona
                </Button>
              </Box>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <ShieldCheck size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />
                {TRUST_BADGES.map((badge, i) => (
                  <Box key={badge} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {i > 0 && (
                      <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.35)", mx: 0.5 }} />
                    )}
                    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", fontWeight: 600 }}>
                      {badge}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </motion.div>

          {/* Right column — dashboard mockup 3D */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          >
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {/* Glow detrás del mockup */}
              <Box
                sx={{
                  position:      "absolute",
                  inset:         "-10%",
                  background:    "radial-gradient(ellipse, rgba(255,255,255,0.1), transparent 70%)",
                  filter:        "blur(30px)",
                  pointerEvents: "none",
                }}
              />

              {/* Dashboard flotante con perspectiva 3D */}
              <motion.div
                {...floatAnim}
                style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
              >
                <Box
                  sx={{
                    borderRadius:   "20px",
                    overflow:       "hidden",
                    border:         "1px solid rgba(255,255,255,0.15)",
                    boxShadow:      "0 32px 80px rgba(0,0,0,0.45)",
                    bgcolor:        "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    transform:      "perspective(800px) rotateX(3deg) rotateY(-4deg)",
                  }}
                >
                  {/* App bar */}
                  <Box
                    sx={{
                      bgcolor:        "rgba(255,255,255,0.08)",
                      px:             2.5,
                      py:             1.5,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      borderBottom:   "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 700 }}>
                      NutriiApp · Dashboard RR.HH.
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem" }}>
                      Mayo 2026
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    {/* KPI row con CountUp */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2 }}>
                      {KPIS.map((kpi) => (
                        <Box
                          key={kpi.label}
                          sx={{
                            bgcolor:      "rgba(255,255,255,0.07)",
                            borderRadius: "10px",
                            p:            1.25,
                            border:       "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <Typography sx={{ color: kpi.color, fontWeight: 900, fontSize: "1.15rem", lineHeight: 1 }}>
                            <CountUp
                              end={kpi.end}
                              prefix={kpi.prefix}
                              suffix={kpi.suffix}
                              duration={2.5}
                              enableScrollSpy
                              scrollSpyOnce
                            />
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem", mt: 0.4, fontWeight: 600 }}>
                            {kpi.label}
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.56rem", mt: 0.2 }}>
                            {kpi.sub}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Employee list */}
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: 600, mb: 1 }}>
                      Colaboradores · plan activo
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {EMPLOYEES.map((emp) => (
                        <Box
                          key={emp.name}
                          sx={{
                            display:      "flex",
                            alignItems:   "center",
                            gap:          1.5,
                            bgcolor:      "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            px:           1.5,
                            py:           0.85,
                            border:       "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Box
                            sx={{
                              width:          28,
                              height:         28,
                              borderRadius:   "50%",
                              bgcolor:        "rgba(165,214,167,0.25)",
                              display:        "flex",
                              alignItems:     "center",
                              justifyContent: "center",
                              flexShrink:     0,
                            }}
                          >
                            <Typography sx={{ color: "#A5D6A7", fontSize: "0.6rem", fontWeight: 800 }}>
                              {emp.name.split(" ").map(w => w[0]).join("")}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.7rem", fontWeight: 700, lineHeight: 1.2 }}>
                              {emp.name}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.38)", fontSize: "0.58rem" }}>
                              {emp.dept}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                            <Typography sx={{ color: "#81C784", fontSize: "0.7rem", fontWeight: 800, lineHeight: 1 }}>
                              {emp.score}
                            </Typography>
                            <Typography sx={{ color: "rgba(129,199,132,0.6)", fontSize: "0.56rem" }}>
                              {emp.trend}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Badge flotante */}
                <Box
                  sx={{
                    position:     "absolute",
                    bottom:       -14,
                    right:        16,
                    bgcolor:      C.white,
                    borderRadius: "10px",
                    px:           1.5,
                    py:           0.75,
                    boxShadow:    "0 4px 16px rgba(0,0,0,0.2)",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          0.75,
                    zIndex:       2,
                  }}
                >
                  <motion.div {...pulseAnim}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4CAF50", boxShadow: "0 0 6px #4CAF50" }} />
                  </motion.div>
                  <Typography sx={{ color: C.primary, fontSize: "0.72rem", fontWeight: 700 }}>
                    +124 empresas activas
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: Levantar dev server y verificar visualmente**

```bash
npm run dev
```

Abrir `http://localhost:5173`. Verificar:
- Hero se ve con fondo más oscuro y profundo
- Las dos orbes de luz se animan suavemente
- El dashboard mockup tiene perspectiva 3D y flota
- Los KPIs cuentan al cargar (−38%, +24%)
- Badge verde pulsante visible debajo del mockup
- Gradiente de texto "Tu empresa más productiva" hace shimmer

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHero.jsx
git commit -m "feat(hero): add 3D floating mockup, animated orbs, CountUp KPIs, shimmer headline"
```

---

## Task 4: Mejorar LandingBenefits.jsx

**Files:**
- Modify: `src/components/landing/LandingBenefits.jsx`

- [ ] **Step 1: Reemplazar LandingBenefits.jsx completo**

Reemplaza `src/components/landing/LandingBenefits.jsx` con:

```jsx
// src/components/landing/LandingBenefits.jsx
import { useRef } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { Stethoscope, BrainCircuit, BarChart3 } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const PILLARS = [
  {
    Icon:        Stethoscope,
    title:       "Precisión clínica, no estimaciones",
    desc:        "El NutriiPoint mide 16+ indicadores corporales por colaborador: composición corporal, biométricos y biomarcadores reales. La base clínica que ninguna app de bienestar puede igualar.",
    metric:      "16+",
    metricLabel: "indicadores por colaborador",
    progress:    80,
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BrainCircuit,
    title:       "IA verdaderamente personalizada",
    desc:        "Nuestro modelo integra biomarcadores, alergias, enfermedades, medicamentos y el presupuesto real de cada persona. No plantillas. No promedios.",
    metric:      "100%",
    metricLabel: "personalizado por persona",
    progress:    100,
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BarChart3,
    title:       "ROI medible desde el día uno",
    desc:        "KPIs de productividad, ausentismo y retorno de inversión en tiempo real. Reportes NOM-030 y NOM-035 con un clic, sin trabajo extra para RR.HH.",
    color:       C.gold,
    iconBg:      "#FFF8E1",
  },
];

function ProgressBar({ progress, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <Box
      ref={ref}
      sx={{
        height:       4,
        bgcolor:      "rgba(0,0,0,0.06)",
        borderRadius: 2,
        overflow:     "hidden",
        mt:           1,
        maxWidth:     180,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${progress}%` } : { width: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        style={{
          height:       "100%",
          background:   color === C.gold
            ? "linear-gradient(90deg, #BF9000, #F9A825)"
            : "linear-gradient(90deg, #1B5E20, #66BB6A)",
          borderRadius: 8,
        }}
      />
    </Box>
  );
}

export default function LandingBenefits() {
  return (
    <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
            gap:                 { xs: 6, md: 10 },
            alignItems:          "flex-start",
          }}
        >
          {/* Left — heading sticky en desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
              {/* Eyebrow label */}
              <Box
                sx={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  bgcolor:      "#E8F5E9",
                  border:       "1px solid #C8E6C9",
                  borderRadius: "20px",
                  px:           1.5,
                  py:           0.5,
                  mb:           2,
                }}
              >
                <Typography sx={{ color: C.primary, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                  POR QUÉ NUTRIIAPP
                </Typography>
              </Box>

              <Typography
                component="h2"
                sx={{
                  color:      C.textPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "1.9rem", md: "2.4rem" },
                  lineHeight: 1.2,
                  mb:         2.5,
                }}
              >
                Tres pilares que hacen única a NutriiApp en el mercado
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.75, mb: 3 }}>
                50% más barato que el competidor corporativo más cercano.
                65% más barato que una consulta nutricional tradicional.
              </Typography>
              <Box
                sx={{
                  display:      "inline-block",
                  bgcolor:      "#E8F5E9",
                  borderRadius: "10px",
                  px:           2,
                  py:           1,
                }}
              >
                <Typography sx={{ color: C.primary, fontWeight: 700, fontSize: "0.85rem" }}>
                  Punto de equilibrio en el mes 3
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Right — pilares */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {PILLARS.map(({ Icon, title, desc, metric, metricLabel, progress, color, iconBg }, i) => (
                <motion.div key={title} variants={fadeInUp}>
                  <motion.div whileHover={{ backgroundColor: "rgba(27,94,32,0.025)" }} style={{ borderRadius: 12 }}>
                    <Box
                      sx={{
                        display:   "flex",
                        gap:       3,
                        py:        { xs: 3.5, md: 4 },
                        px:        1,
                        borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      {/* Icon con hover */}
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Box
                          sx={{
                            width:          52,
                            height:         52,
                            borderRadius:   "14px",
                            bgcolor:        iconBg,
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            flexShrink:     0,
                            mt:             0.25,
                            boxShadow:      color === C.gold
                              ? "0 4px 14px rgba(191,144,0,0.2)"
                              : "0 4px 14px rgba(27,94,32,0.15)",
                          }}
                        >
                          <Icon size={24} color={color} />
                        </Box>
                      </motion.div>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color:      C.textPrimary,
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                            fontWeight: 800,
                            fontSize:   "1.05rem",
                            mb:         1,
                            lineHeight: 1.3,
                          }}
                        >
                          {title}
                        </Typography>
                        <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.75, mb: 2 }}>
                          {desc}
                        </Typography>

                        {metric && (
                          <>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                              <Typography
                                sx={{
                                  color:      color,
                                  fontFamily: "Plus Jakarta Sans, sans-serif",
                                  fontWeight: 900,
                                  fontSize:   "1.6rem",
                                  lineHeight: 1,
                                }}
                              >
                                {metric}
                              </Typography>
                              <Typography sx={{ color: C.textMuted, fontSize: "0.78rem", fontWeight: 600 }}>
                                {metricLabel}
                              </Typography>
                            </Box>
                            {progress && <ProgressBar progress={progress} color={color} />}
                          </>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Con el dev server corriendo, navegar al landing y hacer scroll hasta la sección Beneficios. Verificar:
- Chip "POR QUÉ NUTRIIAPP" visible encima del heading
- Al hover sobre cada pilar, el fondo cambia sutilmente a verde muy claro
- El ícono escala y rota ligeramente al hover
- Las barras de progreso se animan al entrar al viewport
- Stagger de entrada más pronunciado entre pilares

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingBenefits.jsx
git commit -m "feat(benefits): add eyebrow label, icon hover, progress bars, row hover effect"
```

---

## Task 5: Mejorar LandingHowItWorks.jsx

**Files:**
- Modify: `src/components/landing/LandingHowItWorks.jsx`

- [ ] **Step 1: Reemplazar LandingHowItWorks.jsx completo**

Reemplaza `src/components/landing/LandingHowItWorks.jsx` con:

```jsx
// src/components/landing/LandingHowItWorks.jsx
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Wifi, Sparkles, Smartphone, TrendingUp } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const STEPS = [
  {
    num:        "01",
    Icon:       Wifi,
    title:      "Medición con NutriiPoint",
    desc:       "NutriiPoint mide 16+ indicadores biométricos por colaborador en menos de 5 minutos.",
    screenshotBg: "linear-gradient(135deg, #E8F5E9, #A5D6A7)",
    screenshotLabel: "NutriiPoint UI",
    screenshotColor: "#1B5E20",
  },
  {
    num:        "02",
    Icon:       Sparkles,
    title:      "IA genera el plan personalizado",
    desc:       "La IA crea un plan nutricional considerando biomarcadores, alergias, enfermedades y el presupuesto real de cada persona.",
    screenshotBg: "linear-gradient(135deg, #E3F2FD, #90CAF9)",
    screenshotLabel: "IA generando plan",
    screenshotColor: "#1565C0",
  },
  {
    num:        "03",
    Icon:       Smartphone,
    title:      "El colaborador actúa",
    desc:       "Cada colaborador recibe su plan en la app con guías de alimentación, lista de compra y seguimiento diario.",
    screenshotBg: "linear-gradient(135deg, #F3E5F5, #CE93D8)",
    screenshotLabel: "App colaborador",
    screenshotColor: "#6A1B9A",
  },
  {
    num:        "04",
    Icon:       TrendingUp,
    title:      "La empresa mide el impacto",
    desc:       "El dashboard muestra KPIs de salud, productividad y ROI en tiempo real. Reportes NOM-030 y NOM-035 con un clic.",
    screenshotBg: "linear-gradient(135deg, #E8F5E9, #66BB6A)",
    screenshotLabel: "Dashboard RR.HH.",
    screenshotColor: "#1B5E20",
  },
];

function AnimatedConnector() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <Box
      ref={ref}
      sx={{ position: "absolute", top: 26, left: "12.5%", right: "12.5%", height: 2, bgcolor: C.border, zIndex: 0, overflow: "hidden" }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : { width: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        style={{ height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, borderRadius: 2 }}
      />
    </Box>
  );
}

export default function LandingHowItWorks() {
  return (
    <Box id="como-funciona" sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">

        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap:                 { xs: 3, md: 6 },
            mb:                  { xs: 6, md: 8 },
            alignItems:          "flex-end",
          }}
        >
          <Typography
            component="h2"
            sx={{
              color:      C.textPrimary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 900,
              fontSize:   { xs: "1.9rem", md: "2.6rem" },
              lineHeight: 1.2,
            }}
          >
            De la medición al ROI
            en cuatro pasos
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.7 }}>
            Implementación completa en menos de una semana.
            Primeros resultados medibles desde el mes 1.
          </Typography>
        </Box>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Desktop: horizontal con línea conectora animada */}
          <Box
            sx={{
              display:             { xs: "none", md: "grid" },
              gridTemplateColumns: "repeat(4, 1fr)",
              gap:                 3,
              position:            "relative",
            }}
          >
            <AnimatedConnector />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                transition={{ delay: i * 0.15 }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  {/* Ícono con ring */}
                  <Box
                    sx={{
                      width:          56,
                      height:         56,
                      borderRadius:   "50%",
                      bgcolor:        C.primary,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      mb:             2.5,
                      position:       "relative",
                      zIndex:         1,
                      boxShadow:      `0 0 0 6px ${C.bgAlt}, 0 0 0 8px #C8E6C9, 0 8px 20px rgba(27,94,32,0.25)`,
                      transition:     "box-shadow 0.3s ease",
                    }}
                  >
                    <step.Icon size={22} color="#fff" />
                  </Box>

                  {/* Chip número */}
                  <Box
                    sx={{
                      bgcolor:      "#E8F5E9",
                      borderRadius: "6px",
                      px:           0.75,
                      py:           0.25,
                      mb:           0.75,
                    }}
                  >
                    <Typography sx={{ color: C.primary, fontSize: "0.7rem", fontWeight: 800 }}>
                      {step.num}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      color:      C.textPrimary,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 800,
                      fontSize:   "0.95rem",
                      mb:         1.25,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.82rem", lineHeight: 1.7, mb: 1.5 }}>
                    {step.desc}
                  </Typography>

                  {/* Mini screenshot */}
                  <Box
                    sx={{
                      width:        "100%",
                      height:       52,
                      borderRadius: "8px",
                      background:   step.screenshotBg,
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      border:       "1px solid rgba(0,0,0,0.06)",
                      boxShadow:    "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Typography sx={{ color: step.screenshotColor, fontSize: "0.72rem", fontWeight: 700 }}>
                      {step.screenshotLabel}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Mobile: filas */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column" }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <Box
                  sx={{
                    display:    "flex",
                    gap:        2.5,
                    py:         3,
                    borderTop:  i > 0 ? `1px solid ${C.border}` : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width:          44,
                      height:         44,
                      borderRadius:   "50%",
                      bgcolor:        C.primary,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      flexShrink:     0,
                      boxShadow:      "0 4px 14px rgba(27,94,32,0.25)",
                    }}
                  >
                    <step.Icon size={19} color="#fff" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Box sx={{ bgcolor: "#E8F5E9", borderRadius: "5px", px: 0.75, py: 0.2 }}>
                        <Typography sx={{ color: C.primary, fontSize: "0.65rem", fontWeight: 800 }}>{step.num}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ color: C.textPrimary, fontWeight: 800, fontSize: "0.95rem", mb: 0.75 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: "0.83rem", lineHeight: 1.7, mb: 1 }}>
                      {step.desc}
                    </Typography>
                    <Box
                      sx={{
                        height:       40,
                        borderRadius: "7px",
                        background:   step.screenshotBg,
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ color: step.screenshotColor, fontSize: "0.7rem", fontWeight: 700 }}>
                        {step.screenshotLabel}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Hacer scroll hasta "Cómo Funciona". Verificar:
- La línea verde se dibuja de izquierda a derecha al entrar al viewport
- Los íconos tienen ring verde alrededor
- Los números de paso usan chip verde en lugar de texto plano
- Cada paso tiene una mini barra de color representando la UI del producto
- Los pasos entran en cascada con stagger visible

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHowItWorks.jsx
git commit -m "feat(howitworks): animated connector line, step chips, product screenshots, cascade entry"
```

---

## Task 6: Crear LandingTestimonials.jsx

**Files:**
- Create: `src/components/landing/LandingTestimonials.jsx`

- [ ] **Step 1: Crear el componente nuevo**

Crea `src/components/landing/LandingTestimonials.jsx` con:

```jsx
// src/components/landing/LandingTestimonials.jsx
import { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const LOGOS = [
  "Grupo Bimbo", "OXXO Corp", "Cemex", "Banorte", "Liverpool",
  "Grupo Bimbo", "OXXO Corp", "Cemex", "Banorte", "Liverpool",
];

const TESTIMONIALS = [
  {
    quote:    "Implementamos NutriiApp en 3 días. En el mes 2 ya veíamos reducción de ausentismo. El dashboard de RR.HH. nos ahorra 4 horas a la semana en reportes NOM.",
    name:     "Adriana Vargas",
    role:     "Directora de RR.HH.",
    company:  "Manufactura del Norte S.A.",
    rating:   5,
    featured: false,
    initials: "AV",
    avatarBg: "#E8F5E9",
    avatarColor: C.primary,
  },
  {
    quote:    "El ROI fue tangible desde el tercer mes. Nuestros colaboradores están más comprometidos y la tasa de rotación bajó un 18%. NutriiApp fue la mejor decisión del año.",
    name:     "Roberto Elizondo",
    role:     "Gerente de Operaciones",
    company:  "LogiCenter México",
    rating:   5,
    featured: true,
    initials: "RE",
    avatarBg: "rgba(255,255,255,0.2)",
    avatarColor: "#fff",
  },
  {
    quote:    "Lo que más valoro es que cada colaborador tiene un plan real basado en sus métricas, no una plantilla genérica. La IA realmente personaliza.",
    name:     "Claudia Mendoza",
    role:     "VP de Capital Humano",
    company:  "Servicios Integrales GDL",
    rating:   5,
    featured: false,
    initials: "CM",
    avatarBg: "#E3F2FD",
    avatarColor: "#1565C0",
  },
];

function StarRating({ rating, featured }) {
  return (
    <Box sx={{ display: "flex", gap: 0.4, mb: 1.5 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}
        >
          <Star
            size={14}
            fill={i < rating ? "#FFB300" : "none"}
            color={i < rating ? "#FFB300" : (featured ? "rgba(255,255,255,0.3)" : "#CBD5E0")}
          />
        </motion.div>
      ))}
    </Box>
  );
}

function TestimonialCard({ testimonial, active }) {
  const { quote, name, role, company, rating, featured, initials, avatarBg, avatarColor } = testimonial;
  return (
    <Box
      sx={{
        bgcolor:      featured ? C.primary : C.white,
        border:       featured ? "none" : `1px solid ${C.border}`,
        borderRadius: "16px",
        p:            { xs: 2.5, md: 3 },
        boxShadow:    featured
          ? "0 12px 40px rgba(27,94,32,0.3)"
          : "0 4px 20px rgba(0,0,0,0.06)",
        position:     "relative",
        height:       "100%",
        display:      "flex",
        flexDirection:"column",
        opacity:      active === undefined ? 1 : active ? 1 : 0.5,
        transition:   "opacity 0.3s ease",
      }}
    >
      {featured && (
        <Box
          sx={{
            position:     "absolute",
            top:          -10,
            left:         16,
            bgcolor:      "#FFB300",
            borderRadius: "6px",
            px:           1,
            py:           0.25,
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em" }}>
            DESTACADO
          </Typography>
        </Box>
      )}

      <StarRating rating={rating} featured={featured} />

      <Typography
        sx={{
          color:      featured ? "rgba(255,255,255,0.9)" : C.textPrimary,
          fontSize:   "0.88rem",
          lineHeight: 1.75,
          flex:       1,
          mb:         2,
          fontStyle:  "italic",
        }}
      >
        "{quote}"
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pt: 2, borderTop: `1px solid ${featured ? "rgba(255,255,255,0.15)" : C.border}` }}>
        <Box
          sx={{
            width:          36,
            height:         36,
            borderRadius:   "50%",
            bgcolor:        avatarBg,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <Typography sx={{ color: avatarColor, fontSize: "0.65rem", fontWeight: 800 }}>
            {initials}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: featured ? "#fff" : C.textPrimary, fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.2 }}>
            {name}
          </Typography>
          <Typography sx={{ color: featured ? "rgba(255,255,255,0.6)" : C.textMuted, fontSize: "0.72rem" }}>
            {role} · {company}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box
              sx={{
                display:      "inline-flex",
                alignItems:   "center",
                bgcolor:      "#E8F5E9",
                border:       "1px solid #C8E6C9",
                borderRadius: "20px",
                px:           1.5,
                py:           0.5,
                mb:           2,
              }}
            >
              <Typography sx={{ color: C.primary, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                LO QUE DICEN NUESTROS CLIENTES
              </Typography>
            </Box>
            <Typography
              component="h2"
              sx={{
                color:      C.textPrimary,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 900,
                fontSize:   { xs: "1.9rem", md: "2.4rem" },
                lineHeight: 1.2,
              }}
            >
              Empresas que ya miden
              <Box component="span" sx={{ color: C.primary }}> el impacto real</Box>
            </Typography>
          </Box>
        </motion.div>

        {/* Logo band */}
        <Box
          sx={{
            overflow: "hidden",
            mb:       6,
            py:       2,
            borderTop:    `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Box
            sx={{
              display:   "flex",
              gap:       5,
              width:     "max-content",
              animation: "logoScroll 25s linear infinite",
              "@keyframes logoScroll": {
                "0%":   { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
            }}
          >
            {LOGOS.map((logo, i) => (
              <Typography
                key={i}
                sx={{
                  color:       C.textLight,
                  fontSize:    "0.8rem",
                  fontWeight:  700,
                  opacity:     0.45,
                  whiteSpace:  "nowrap",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {logo}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Cards — desktop grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Box
            sx={{
              display:             { xs: "none", md: "grid" },
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 3,
              alignItems:          "stretch",
            }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeInUp} style={{ display: "flex" }}>
                <TestimonialCard testimonial={t} />
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Cards — mobile carrusel */}
        <Box sx={{ display: { xs: "block", md: "none" }, overflow: "hidden" }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) setActiveIndex(i => Math.min(i + 1, TESTIMONIALS.length - 1));
              if (info.offset.x > 50)  setActiveIndex(i => Math.max(i - 1, 0));
            }}
          >
            <TestimonialCard testimonial={TESTIMONIALS[activeIndex]} />
          </motion.div>
          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 3 }}>
            {TESTIMONIALS.map((_, i) => (
              <Box
                key={i}
                onClick={() => setActiveIndex(i)}
                sx={{
                  width:        i === activeIndex ? 20 : 6,
                  height:       6,
                  borderRadius: 3,
                  bgcolor:      i === activeIndex ? C.primary : C.border,
                  cursor:       "pointer",
                  transition:   "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: Verificar que el archivo existe y no tiene errores de sintaxis**

```bash
node --input-type=module <<< "import './src/components/landing/LandingTestimonials.jsx'" 2>&1 | head -5
```

Si hay error de módulo ESM, ignorar — el check relevante es en el dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingTestimonials.jsx
git commit -m "feat: add LandingTestimonials component with logo band, cards, mobile carousel"
```

---

## Task 7: Registrar LandingTestimonials en Landing.jsx

**Files:**
- Modify: `src/pages/Landing.jsx`

- [ ] **Step 1: Actualizar Landing.jsx**

Reemplaza `src/pages/Landing.jsx` con:

```jsx
// src/pages/Landing.jsx
import { Box } from "@mui/material";
import LandingNavbar       from "../components/landing/LandingNavbar";
import LandingHero         from "../components/landing/LandingHero";
import LandingCredBand     from "../components/landing/LandingCredBand";
import LandingBenefits     from "../components/landing/LandingBenefits";
import LandingHowItWorks   from "../components/landing/LandingHowItWorks";
import LandingTestimonials from "../components/landing/LandingTestimonials";
import LandingFAQ          from "../components/landing/LandingFAQ";
import LandingCTA          from "../components/landing/LandingCTA";
import LandingFooter       from "../components/landing/LandingFooter";

export default function Landing() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      <LandingNavbar />
      <LandingHero />
      <LandingCredBand />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </Box>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

En el dev server, hacer scroll completo por el landing. La sección de Testimonios aparece entre "Cómo Funciona" y "FAQ". Verificar:
- 3 tarjetas visibles en desktop (la central en verde)
- Logo band con nombres desplazándose
- En móvil (<768px): carrusel con dots y swipe

- [ ] **Step 3: Commit**

```bash
git add src/pages/Landing.jsx
git commit -m "feat: register LandingTestimonials between HowItWorks and FAQ"
```

---

## Task 8: Mejorar LandingCTA.jsx

**Files:**
- Modify: `src/components/landing/LandingCTA.jsx`

- [ ] **Step 1: Reemplazar LandingCTA.jsx completo**

Reemplaza `src/components/landing/LandingCTA.jsx` con:

```jsx
// src/components/landing/LandingCTA.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { C, fadeInUp, stagger, pulseAnim } from "./landingTokens";

const HIGHLIGHTS = [
  "Sin compromiso de contrato",
  "Demo personalizada en 24 h",
  "Punto de equilibrio en el mes 3",
  "50% más barato que la competencia",
];

const HEADLINE_WORDS = ["¿Listo", "para", "medir", "el", "ROI"];
const HEADLINE_WORDS2 = ["de", "tu", "inversión", "en", "salud?"];

export default function LandingCTA() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: C.ctaGrad,
        py:         { xs: 9, md: 13 },
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Radial base */}
      <Box
        sx={{
          position:        "absolute",
          inset:           0,
          backgroundImage:
            "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.05) 0%, transparent 45%), " +
            "radial-gradient(circle at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)",
          pointerEvents:   "none",
        }}
      />

      {/* Orbe izquierda */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          top:          "-20%",
          left:         "-10%",
          width:        "45%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(165,214,167,0.15), transparent 70%)",
          filter:       "blur(50px)",
          pointerEvents:"none",
        }}
      />

      {/* Orbe derecha */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position:     "absolute",
          bottom:       "-15%",
          right:        "-8%",
          width:        "40%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(67,160,71,0.12), transparent 70%)",
          filter:       "blur(60px)",
          pointerEvents:"none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Badge de actividad */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Box
                sx={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          0.75,
                  bgcolor:      "rgba(255,255,255,0.1)",
                  border:       "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "20px",
                  px:           2,
                  py:           0.75,
                }}
              >
                <motion.div {...pulseAnim}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4CAF50", boxShadow: "0 0 8px #4CAF50" }} />
                </motion.div>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", fontWeight: 600 }}>
                  +124 empresas activas este mes
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Headline animado por palabras */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                component="h2"
                sx={{
                  color:      C.white,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "2rem", md: "2.8rem" },
                  lineHeight: 1.15,
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em" }}>
                  {HEADLINE_WORDS.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em" }}>
                  {HEADLINE_WORDS2.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (HEADLINE_WORDS.length + i) * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </Box>
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography
              sx={{
                color:      "rgba(255,255,255,0.78)",
                fontSize:   "1.05rem",
                lineHeight: 1.7,
                textAlign:  "center",
                mb:         5,
                maxWidth:   480,
                mx:         "auto",
              }}
            >
              $28,600 MXN/año para 20 colaboradores. La inversión más inteligente
              que puedes hacer en productividad corporativa.
            </Typography>
          </motion.div>

          {/* Botón con shimmer */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "12px", display: "inline-flex" }}>
                <Button
                  onClick={() => navigate("/demo")}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    bgcolor:       C.white,
                    color:         C.primary,
                    fontWeight:    800,
                    textTransform: "none",
                    borderRadius:  "12px",
                    px:            4,
                    py:            1.7,
                    fontSize:      "1.05rem",
                    boxShadow:     "0 6px 28px rgba(0,0,0,0.2)",
                    "&:hover":     { bgcolor: "#F0FFF4", boxShadow: "0 10px 36px rgba(0,0,0,0.25)" },
                    position:      "relative",
                    zIndex:        1,
                  }}
                >
                  Agendar mi demo gratuita
                </Button>
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                  style={{
                    position:    "absolute",
                    top:         0,
                    left:        0,
                    width:       "40%",
                    height:      "100%",
                    background:  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                    transform:   "skewX(-15deg)",
                    pointerEvents: "none",
                    zIndex:      2,
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Box
              sx={{
                display:        "flex",
                flexWrap:       "wrap",
                justifyContent: "center",
                gap:            { xs: 1.5, md: 3 },
              }}
            >
              {HIGHLIGHTS.map((h) => (
                <Box key={h} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircle2 size={15} color="rgba(255,255,255,0.7)" />
                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.83rem", fontWeight: 600 }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Hacer scroll hasta el CTA final. Verificar:
- Fondo más profundo con orbes animadas (mismo estilo que el Hero)
- Badge verde pulsante "+124 empresas activas"
- Headline aparece palabra por palabra al entrar al viewport
- El botón tiene un destello de luz que lo atraviesa cada ~4 segundos

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingCTA.jsx
git commit -m "feat(cta): add orbs, pulsing badge, shimmer button, word-by-word headline"
```

---

## Task 9: Push final a GitHub

**Files:** ninguno nuevo

- [ ] **Step 1: Verificar estado del repo**

```bash
git log --oneline -8
```

Resultado esperado: los 7 commits de esta implementación más los anteriores.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Verificar en GitHub**

Abrir `https://github.com/MichelEncarnacion/NutriAppWeb` y confirmar que los commits aparecen en la rama main.
