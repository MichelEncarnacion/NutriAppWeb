// src/components/landing/LandingBenefits.jsx
import { useRef } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { Stethoscope, BrainCircuit, BarChart3 } from "lucide-react";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

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
  const { fadeInUp, stagger } = useMotionSafe();
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
