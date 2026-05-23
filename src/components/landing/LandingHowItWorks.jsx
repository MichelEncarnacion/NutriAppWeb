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
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", height: "100%" }}>
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
                  <Typography sx={{ color: C.textMuted, fontSize: "0.82rem", lineHeight: 1.7, mb: 1.5, flex: 1 }}>
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
