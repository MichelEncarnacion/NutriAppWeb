// src/components/landing/LandingCredBand.jsx
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { C } from "./landingTokens";
import { useMotionSafe } from "../../hooks/useMotionSafe";

const STATS = [
  { value: "75%",     label: "de adultos mexicanos vive con sobrepeso u obesidad", source: "ENSANUT 2022" },
  { value: "44 días", label: "de ausentismo promedio al año por enfermedad crónica", source: "IMSS / STPS" },
  { value: "60%",     label: "de productividad perdida por enfermedades crónicas no gestionadas", source: "OIT México" },
];

export default function LandingCredBand() {
  const { fadeInUp, stagger } = useMotionSafe();
  return (
    <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 10 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <Box
            sx={{
              display:             "grid",
              gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
              gap:                 { xs: 6, md: 8 },
              alignItems:          "center",
            }}
          >
            {/* Heading */}
            <motion.div variants={fadeInUp}>
              <Typography
                component="h2"
                sx={{
                  color:      C.textPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "1.75rem", md: "2.1rem" },
                  lineHeight: 1.25,
                }}
              >
                La salud de tu equipo
                impacta directamente
                en tus resultados.
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "0.95rem", mt: 2, lineHeight: 1.7 }}>
                Tres realidades que toda empresa mexicana enfrenta, pero pocas miden.
              </Typography>
            </motion.div>

            {/* Stats — sin tarjetas, solo números con divisores */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                {STATS.map((s, i) => (
                  <Box
                    key={s.value}
                    sx={{
                      px:         { xs: 2, md: 3 },
                      py:         { xs: 1, md: 0 },
                      borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                      textAlign:  "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color:      C.primary,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 900,
                        fontSize:   { xs: "2rem", md: "2.6rem" },
                        lineHeight: 1,
                        mb:         1,
                      }}
                    >
                      {s.value}
                    </Typography>
                    <Typography sx={{ color: C.textMuted, fontSize: "0.8rem", lineHeight: 1.6, mb: 0.75 }}>
                      {s.label}
                    </Typography>
                    <Typography sx={{ color: C.textLight, fontSize: "0.67rem", fontWeight: 600 }}>
                      {s.source}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
