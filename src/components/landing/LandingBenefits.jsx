import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const BENEFITS = [
  {
    img:   "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&q=80",
    title: "Ahorra horas de investigación",
    desc:  "Olvídate de buscar recetas y calcular macros. Tu plan ya viene con todo: comidas, horarios, calorías y macronutrientes — respaldado por nutriólogos.",
  },
  {
    img:   "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80",
    title: "Adaptado a tu ritmo de vida",
    desc:  "Actividad física, presupuesto, alergias y restricciones médicas — tu plan lo considera todo desde el primer día.",
  },
  {
    img:   "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80",
    title: "15 días sin repetirte",
    desc:  "Cada día trae comidas diferentes para que no te aburras ni abandones tu plan. Variedad garantizada.",
  },
  {
    img:   "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80",
    title: "Evoluciona cada quincena",
    desc:  "Cada 15 días la IA ajusta tu plan según tu progreso real. No más planes estáticos que dejan de funcionar.",
  },
];

export default function LandingBenefits() {
  return (
    <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              color: C.textPrimary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.8rem" },
            }}
          >
            Todo lo que necesitas para comer mejor
          </Typography>
        </Box>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {BENEFITS.map((b) => (
            <motion.div key={b.title} variants={fadeInUp}>
              <Box
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  transition: "transform 0.25s, border-color 0.25s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "rgba(61,220,132,0.4)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={b.img}
                  alt={b.title}
                  loading="lazy"
                  sx={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                />
                <Box sx={{ bgcolor: C.bgCard, p: 3 }}>
                  <Typography
                    sx={{
                      color: C.textPrimary,
                      fontWeight: 700,
                      fontSize: "1rem",
                      mb: 1,
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {b.title}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.75 }}>
                    {b.desc}
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
