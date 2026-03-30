import { useState } from "react";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const FAQS = [
  {
    q: "¿Necesito saber de nutrición para usar NutriiApp?",
    a: "No. Solo responde las preguntas del diagnóstico y nuestro equipo de nutriólogos junto con la IA hacen todo el trabajo por ti.",
  },
  {
    q: "¿Qué tan personalizado es el plan?",
    a: "Totalmente. Cada plan es diseñado por nutriólogos certificados y personalizado por IA según tu peso, estatura, edad, objetivo, nivel de actividad, alergias, enfermedades y presupuesto quincenal.",
  },
  {
    q: "¿Cada cuánto se actualiza mi plan?",
    a: "Cada 15 días. Completas un formulario de seguimiento y la IA, con supervisión de nuestros especialistas, genera un nuevo plan adaptado a tu progreso.",
  },
  {
    q: "¿Funciona si tengo restricciones alimenticias?",
    a: "Sí. El diagnóstico incluye campos para alergias, intolerancias y condiciones médicas. Tu plan las respeta completamente.",
  },
  {
    q: "¿Es gratis?",
    a: "Hay un plan Freemium gratuito con funciones básicas. El plan Premium desbloquea seguimiento completo de progreso, lecciones nutricionales y planes ilimitados.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Toda tu información se almacena de forma segura y nunca se comparte con terceros. Tu privacidad es nuestra prioridad.",
  },
];

export default function LandingFAQ() {
  const [expanded, setExpanded] = useState(null);

  return (
    <Box id="faq" sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
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
            Preguntas frecuentes
          </Typography>
        </Box>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Accordion
                  expanded={expanded === i}
                  onChange={() => setExpanded(expanded === i ? null : i)}
                  disableGutters
                  elevation={0}
                  sx={{
                    bgcolor: C.bgCard,
                    border: `1px solid ${expanded === i ? "rgba(61,220,132,0.35)" : C.border}`,
                    borderRadius: "12px !important",
                    "&::before": { display: "none" },
                    transition: "border-color 0.2s",
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      expanded === i
                        ? <RemoveIcon sx={{ color: C.green, fontSize: "1.1rem" }} />
                        : <AddIcon    sx={{ color: C.green, fontSize: "1.1rem" }} />
                    }
                    sx={{ px: 3, py: 1 }}
                  >
                    <Typography sx={{ color: C.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3 }}>
                    <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.75 }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
