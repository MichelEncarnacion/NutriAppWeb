// src/components/landing/LandingHowItWorks.jsx
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Wifi, Sparkles, Smartphone, TrendingUp } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const STEPS = [
  {
    num:   "01",
    Icon:  Wifi,
    title: "Medición con NutriiPoint",
    desc:  "NutriiPoint mide 16+ indicadores biométricos por colaborador en menos de 5 minutos.",
  },
  {
    num:   "02",
    Icon:  Sparkles,
    title: "IA genera el plan personalizado",
    desc:  "La IA crea un plan nutricional considerando biomarcadores, alergias, enfermedades y el presupuesto real de cada persona.",
  },
  {
    num:   "03",
    Icon:  Smartphone,
    title: "El colaborador actúa",
    desc:  "Cada colaborador recibe su plan en la app con guías de alimentación, lista de compra y seguimiento diario.",
  },
  {
    num:   "04",
    Icon:  TrendingUp,
    title: "La empresa mide el impacto",
    desc:  "El dashboard muestra KPIs de salud, productividad y ROI en tiempo real. Reportes NOM-030 y NOM-035 con un clic.",
  },
];

export default function LandingHowItWorks() {
  return (
    <Box id="como-funciona" sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">

        {/* Header — sin eyebrow, alineado a la izquierda en desktop */}
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
          {/* Desktop: horizontal con línea conectora */}
          <Box
            sx={{
              display:             { xs: "none", md: "grid" },
              gridTemplateColumns: "repeat(4, 1fr)",
              gap:                 3,
              position:            "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top:      28,
                left:     "12.5%",
                right:    "12.5%",
                height:   2,
                bgcolor:  C.border,
                zIndex:   0,
              }}
            />

            {STEPS.map((step) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
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
                      boxShadow:      `0 0 0 6px ${C.bgAlt}, 0 0 0 7px ${C.border}`,
                    }}
                  >
                    <step.Icon size={22} color="#fff" />
                  </Box>
                  <Typography
                    sx={{
                      color:      C.textLight,
                      fontSize:   "0.72rem",
                      fontWeight: 700,
                      mb:         0.75,
                    }}
                  >
                    {step.num}
                  </Typography>
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
                  <Typography sx={{ color: C.textMuted, fontSize: "0.82rem", lineHeight: 1.7 }}>
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Mobile: filas sin tarjetas */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column" }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <Box
                  sx={{
                    display:      "flex",
                    gap:          2.5,
                    py:           3,
                    borderTop:    i > 0 ? `1px solid ${C.border}` : "none",
                    alignItems:   "flex-start",
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
                    }}
                  >
                    <step.Icon size={19} color="#fff" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: C.textLight, fontSize: "0.68rem", fontWeight: 700, mb: 0.4 }}>
                      {step.num}
                    </Typography>
                    <Typography sx={{ color: C.textPrimary, fontWeight: 800, fontSize: "0.95rem", mb: 0.75 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: "0.83rem", lineHeight: 1.7 }}>
                      {step.desc}
                    </Typography>
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
