// src/components/landing/LandingBenefits.jsx — 3 Pilares B2B
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Stethoscope, BrainCircuit, BarChart3 } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const PILLARS = [
  {
    Icon:     Stethoscope,
    tag:      "Dispositivo IoT propio",
    title:    "Precisión clínica",
    desc:     "El NutriiPoint mide 16+ indicadores corporales por colaborador: composición corporal, biométricos y biomarcadores reales, no estimaciones. La base clínica que ninguna app de bienestar puede igualar.",
    metric:   "16+",
    metricLabel: "indicadores medidos",
  },
  {
    Icon:     BrainCircuit,
    tag:      "Motor de IA propio",
    title:    "IA verdaderamente personalizada",
    desc:     "Nuestro modelo integra biomarcadores, alergias, enfermedades, medicamentos y el presupuesto real de cada colaborador para generar planes nutricionales clínicamente precisos. No plantillas. No promedios.",
    metric:   "100%",
    metricLabel: "personalizado por persona",
  },
  {
    Icon:     BarChart3,
    tag:      "Dashboard empresarial",
    title:    "ROI medible desde el día uno",
    desc:     "El dashboard entrega KPIs de productividad, ausentismo y retorno de inversión en tiempo real. Los reportes de cumplimiento NOM-030 y NOM-035 se generan con un solo clic, sin trabajo extra para RR.HH.",
    metric:   "86.9%",
    metricLabel: "margen bruto",
  },
];

export default function LandingBenefits() {
  return (
    <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
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
            Por qué NutriiApp
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
            Tres pilares que hacen única
            <br />
            a NutriiApp en el mercado
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "1rem", maxWidth: 540, mx: "auto", lineHeight: 1.7 }}>
            50% más barato que el competidor corporativo más cercano.
            65% más barato que una consulta nutricional tradicional.
          </Typography>
        </Box>

        {/* Pillars grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap:                 24,
          }}
        >
          {PILLARS.map(({ Icon, tag, title, desc, metric, metricLabel }, i) => (
            <motion.div key={title} variants={fadeInUp}>
              <Box
                sx={{
                  bgcolor:      C.bgCard,
                  borderRadius: "16px",
                  border:       `1px solid ${C.border}`,
                  p:            { xs: 3, md: 3.5 },
                  height:       "100%",
                  boxShadow:    C.shadow,
                  display:      "flex",
                  flexDirection:"column",
                  transition:   "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover":    {
                    transform:  "translateY(-4px)",
                    boxShadow:  C.shadowMd,
                    borderColor: C.accent,
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width:        48,
                    height:       48,
                    bgcolor:      i === 0 ? "#E8F5E9" : i === 1 ? "#E8F5E9" : "#FFF8E1",
                    borderRadius: "12px",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    mb:           2.5,
                  }}
                >
                  <Icon size={22} color={i === 2 ? C.gold : C.primary} />
                </Box>

                {/* Tag */}
                <Typography
                  sx={{
                    color:         C.primary,
                    fontSize:      "0.7rem",
                    fontWeight:    700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mb:            1,
                  }}
                >
                  {tag}
                </Typography>

                {/* Title */}
                <Typography
                  sx={{
                    color:      C.textPrimary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 800,
                    fontSize:   "1.15rem",
                    mb:         1.5,
                  }}
                >
                  {title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    color:      C.textMuted,
                    fontSize:   "0.875rem",
                    lineHeight: 1.75,
                    flex:       1,
                  }}
                >
                  {desc}
                </Typography>

                {/* Metric highlight */}
                <Box
                  sx={{
                    mt:           2.5,
                    pt:           2,
                    borderTop:    `1px solid ${C.border}`,
                    display:      "flex",
                    alignItems:   "baseline",
                    gap:          0.75,
                  }}
                >
                  <Typography
                    sx={{
                      color:      i === 2 ? C.gold : C.primary,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 900,
                      fontSize:   "1.7rem",
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
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Box>
  );
}
