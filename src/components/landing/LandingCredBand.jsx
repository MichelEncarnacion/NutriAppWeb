// src/components/landing/LandingCredBand.jsx — Stats / Oportunidad
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const STATS = [
  {
    value:   "75%",
    label:   "de adultos mexicanos vive con sobrepeso u obesidad",
    source:  "ENSANUT 2022",
    color:   C.primary,
  },
  {
    value:   "44 días",
    label:   "de ausentismo promedio al año por enfermedad crónica",
    source:  "IMSS / STPS",
    color:   C.primary,
  },
  {
    value:   "60%",
    label:   "de productividad cuando hay enfermedades crónicas no gestionadas",
    source:  "OIT México",
    color:   C.primary,
  },
  {
    value:   "$1,430",
    label:   "MXN por colaborador al año. El plan nutricional personalizado más accesible del mercado.",
    source:  "Precio base NutriiApp",
    color:   C.primary,
  },
];

export default function LandingCredBand() {
  return (
    <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            component="p"
            sx={{
              color:          C.primary,
              fontWeight:     700,
              fontSize:       "0.78rem",
              textTransform:  "uppercase",
              letterSpacing:  "0.1em",
              mb:             1.5,
            }}
          >
            El problema que nadie está midiendo
          </Typography>
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
            La salud de tu equipo impacta directamente
            <br />
            en tus resultados de negocio
          </Typography>
        </Box>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display:               "grid",
            gridTemplateColumns:   "repeat(auto-fit, minmax(220px, 1fr))",
            gap:                   24,
          }}
        >
          {STATS.map((s) => (
            <motion.div key={s.value} variants={fadeInUp}>
              <Box
                sx={{
                  bgcolor:      C.bgCard,
                  borderRadius: "16px",
                  border:       `1px solid ${C.border}`,
                  p:            { xs: 3, md: 3.5 },
                  textAlign:    "center",
                  boxShadow:    C.shadow,
                  transition:   "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover":    {
                    transform:  "translateY(-4px)",
                    boxShadow:  C.shadowMd,
                  },
                }}
              >
                <Typography
                  sx={{
                    color:      s.color,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 900,
                    fontSize:   { xs: "2.4rem", md: "2.8rem" },
                    lineHeight: 1,
                    mb:         1.5,
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    color:      C.textMuted,
                    fontSize:   "0.875rem",
                    lineHeight: 1.65,
                    mb:         1.5,
                  }}
                >
                  {s.label}
                </Typography>
                <Typography
                  sx={{
                    color:      C.textLight,
                    fontSize:   "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.source}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Box>
  );
}
