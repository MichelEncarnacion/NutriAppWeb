// src/components/landing/LandingHowItWorks.jsx
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const STEPS = [
  {
    num: "01",
    img: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&q=80",
    title: "Cuéntanos sobre ti",
    desc:  "Responde 24 preguntas sobre tu cuerpo, objetivos, hábitos y presupuesto.",
  },
  {
    num: "02",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80",
    title: "La IA y nuestros expertos diseñan tu plan",
    desc:  "Nuestro equipo de nutriólogos y algoritmo de IA generan un plan de 15 días específico para ti en segundos.",
  },
  {
    num: "03",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80",
    title: "Sigue tu plan día a día",
    desc:  "Marca comidas completadas, monitorea tu progreso y recibe un nuevo plan adaptado cada quincena.",
  },
];

export default function LandingHowItWorks() {
  return (
    <Box id="como-funciona" sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              color: C.textPrimary,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.8rem" },
              mb: 2,
            }}
          >
            Así de simple
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "1.05rem" }}>
            De cero a tu plan personalizado en menos de 10 minutos
          </Typography>
        </Box>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {STEPS.map((step) => (
            <motion.div key={step.num} variants={fadeInUp}>
              <Box
                sx={{
                  bgcolor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: "16px",
                  p: 4,
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  transition: "border-color 0.25s",
                  "&:hover": { borderColor: "rgba(61,220,132,0.4)" },
                }}
              >
                {/* Watermark number */}
                <Typography
                  sx={{
                    position: "absolute",
                    top: 12, right: 16,
                    color: C.green,
                    opacity: 0.1,
                    fontSize: "5rem",
                    fontWeight: 900,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    lineHeight: 1,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {step.num}
                </Typography>

                <Box
                  component="img"
                  src={step.img}
                  alt={step.title}
                  loading="lazy"
                  sx={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", mb: 3 }}
                />
                <Typography
                  sx={{
                    color: C.textPrimary,
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    mb: 1.5,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {step.title}
                </Typography>
                <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.75 }}>
                  {step.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Box>
  );
}
