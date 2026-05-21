// src/components/landing/LandingBenefits.jsx
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Stethoscope, BrainCircuit, BarChart3 } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const PILLARS = [
  {
    Icon:        Stethoscope,
    title:       "Precisión clínica, no estimaciones",
    desc:        "El NutriiPoint mide 16+ indicadores corporales por colaborador: composición corporal, biométricos y biomarcadores reales. La base clínica que ninguna app de bienestar puede igualar.",
    metric:      "16+",
    metricLabel: "indicadores por colaborador",
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BrainCircuit,
    title:       "IA verdaderamente personalizada",
    desc:        "Nuestro modelo integra biomarcadores, alergias, enfermedades, medicamentos y el presupuesto real de cada persona. No plantillas. No promedios.",
    metric:      "100%",
    metricLabel: "personalizado por persona",
    color:       C.primary,
    iconBg:      "#E8F5E9",
  },
  {
    Icon:        BarChart3,
    title:       "ROI medible desde el día uno",
    desc:        "KPIs de productividad, ausentismo y retorno de inversión en tiempo real. Reportes NOM-030 y NOM-035 con un clic, sin trabajo extra para RR.HH.",
    metric:      "86.9%",
    metricLabel: "margen bruto",
    color:       C.gold,
    iconBg:      "#FFF8E1",
  },
];

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
          {/* Left — heading fijo mientras scrolleas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
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

          {/* Right — pilares como filas, sin tarjetas */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {PILLARS.map(({ Icon, title, desc, metric, metricLabel, color, iconBg }, i) => (
                <motion.div key={title} variants={fadeInUp}>
                  <Box
                    sx={{
                      display:      "flex",
                      gap:          3,
                      py:           { xs: 3.5, md: 4 },
                      borderTop:    i > 0 ? `1px solid ${C.border}` : "none",
                    }}
                  >
                    {/* Icon */}
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
                      }}
                    >
                      <Icon size={24} color={color} />
                    </Box>

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
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
