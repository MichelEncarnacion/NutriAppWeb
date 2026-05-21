// src/components/landing/LandingHowItWorks.jsx — 4 Pasos B2B
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Wifi, Sparkles, Smartphone, TrendingUp } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const STEPS = [
  {
    num:   "01",
    Icon:  Wifi,
    title: "Medición con NutriiPoint",
    desc:  "El dispositivo IoT instalado en tu empresa mide 16+ indicadores biométricos de cada colaborador en menos de 5 minutos: composición corporal, hidratación, masa muscular y biomarcadores clave.",
  },
  {
    num:   "02",
    Icon:  Sparkles,
    title: "IA genera el plan personalizado",
    desc:  "Nuestro motor de IA procesa los datos biométricos junto con alergias, enfermedades, medicamentos y el presupuesto real del colaborador para generar un plan nutricional clínicamente preciso.",
  },
  {
    num:   "03",
    Icon:  Smartphone,
    title: "El colaborador actúa",
    desc:  "Cada colaborador recibe su plan en la app móvil con guías de alimentación, listas de compra y seguimiento diario. Acompañamiento continuo sin depender del equipo de RR.HH.",
  },
  {
    num:   "04",
    Icon:  TrendingUp,
    title: "La empresa mide el impacto",
    desc:  "El dashboard empresarial muestra KPIs de salud, reducción de ausentismo, productividad y ROI en tiempo real. Genera reportes de cumplimiento NOM-030 y NOM-035 con un clic.",
  },
];

export default function LandingHowItWorks() {
  return (
    <Box id="como-funciona" sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            component="p"
            sx={{
              color:         C.primary,
              fontWeight:    700,
              fontSize:      "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb:            1.5,
            }}
          >
            Cómo funciona
          </Typography>
          <Typography
            component="h2"
            sx={{
              color:      C.textPrimary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 900,
              fontSize:   { xs: "1.9rem", md: "2.6rem" },
              lineHeight: 1.2,
              mb:         2,
            }}
          >
            De la medición al ROI
            <br />
            en cuatro pasos simples
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "1rem", maxWidth: 480, mx: "auto" }}>
            Implementación completa en menos de una semana. Primeros resultados medibles desde el mes 1.
          </Typography>
        </Box>

        {/* Steps */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Desktop: horizontal steps with connector line */}
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 3,
              position: "relative",
            }}
          >
            {/* Connector line */}
            <Box
              sx={{
                position:   "absolute",
                top:        28,
                left:       "12.5%",
                right:      "12.5%",
                height:     2,
                bgcolor:    C.border,
                zIndex:     0,
              }}
            />

            {STEPS.map((step) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  {/* Step circle */}
                  <Box
                    sx={{
                      width:           56,
                      height:          56,
                      borderRadius:    "50%",
                      bgcolor:         C.primary,
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                      mb:              2.5,
                      position:        "relative",
                      zIndex:          1,
                      boxShadow:       `0 0 0 6px ${C.bgAlt}, 0 0 0 7px ${C.border}`,
                    }}
                  >
                    <step.Icon size={22} color="#fff" />
                  </Box>

                  <Typography
                    sx={{
                      color:      C.textLight,
                      fontSize:   "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      mb:         0.75,
                    }}
                  >
                    PASO {step.num}
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

          {/* Mobile: vertical steps */}
          <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 3 }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp}>
                <Box
                  sx={{
                    bgcolor:      C.bgCard,
                    borderRadius: "14px",
                    border:       `1px solid ${C.border}`,
                    p:            3,
                    display:      "flex",
                    gap:          2.5,
                    boxShadow:    C.shadow,
                  }}
                >
                  <Box
                    sx={{
                      width:           48,
                      height:          48,
                      borderRadius:    "50%",
                      bgcolor:         C.primary,
                      display:         "flex",
                      alignItems:      "center",
                      justifyContent:  "center",
                      flexShrink:      0,
                    }}
                  >
                    <step.Icon size={20} color="#fff" />
                  </Box>
                  <Box>
                    <Typography sx={{ color: C.textLight, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", mb: 0.5 }}>
                      PASO {step.num}
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
