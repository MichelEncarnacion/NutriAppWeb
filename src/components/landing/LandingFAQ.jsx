// src/components/landing/LandingFAQ.jsx
import { useState } from "react";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const FAQS = [
  {
    q: "¿Cuánto cuesta NutriiApp para mi empresa?",
    a: "$28,600 MXN al año para 20 colaboradores, equivalente a $1,430 MXN por persona al año. Somos 50% más baratos que el competidor corporativo más cercano y 65% más económicos que una consulta nutricional tradicional.",
  },
  {
    q: "¿Cómo se calcula el ROI y cuándo veo resultados?",
    a: "El dashboard mide reducción de ausentismo, incremento de productividad y ahorro en servicios médicos. Con un margen bruto del 86.9% y una TIR del 54.6% a 5 años, la inversión en NutriiApp se justifica sola ante el CFO.",
  },
  {
    q: "¿Qué es el NutriiPoint y cómo se instala?",
    a: "NutriiPoint es nuestro dispositivo IoT propio que mide 16+ indicadores corporales por colaborador en menos de 5 minutos. La instalación en tu empresa toma menos de 1 día y no requiere modificaciones de infraestructura.",
  },
  {
    q: "¿Cómo cumple NutriiApp con NOM-030 y NOM-035?",
    a: "NutriiApp tiene cumplimiento nativo con ambas normas. El dashboard genera automáticamente los reportes requeridos por la NOM-030 y NOM-035 con un solo clic. Tu equipo de RR.HH. no tiene que hacer trabajo extra.",
  },
  {
    q: "¿Cuánto tiempo tarda la implementación completa?",
    a: "La instalación del NutriiPoint y la configuración del dashboard toman menos de una semana. Los primeros planes personalizados están disponibles en las primeras 48 horas tras la medición inicial.",
  },
  {
    q: "¿Cómo se protege la información médica de mis colaboradores?",
    a: "Los datos biométricos se almacenan con cifrado de extremo a extremo y nunca se comparten con terceros. Cumplimos con la Ley Federal de Protección de Datos Personales (LFPDPPP) y los datos sensibles están segregados por nivel de acceso.",
  },
];

export default function LandingFAQ() {
  const [expanded, setExpanded] = useState(null);

  return (
    <Box id="faq" sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", md: "4fr 7fr" },
            gap:                 { xs: 6, md: 10 },
            alignItems:          "flex-start",
          }}
        >
          {/* Left — heading pegado */}
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
                  fontSize:   { xs: "1.9rem", md: "2.3rem" },
                  lineHeight: 1.2,
                  mb:         2,
                }}
              >
                Todo lo que necesitas saber antes de agendar
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "0.95rem", lineHeight: 1.7 }}>
                Si tienes otra pregunta, escríbenos a{" "}
                <Box component="span" sx={{ color: C.primary, fontWeight: 600 }}>hola@nutriiapp.mx</Box>
              </Typography>
            </Box>
          </motion.div>

          {/* Right — acordeón */}
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
                      bgcolor:     C.bgCard,
                      border:      `1px solid ${expanded === i ? C.accent : C.border}`,
                      borderRadius:"12px !important",
                      boxShadow:   expanded === i ? C.shadow : "none",
                      "&::before": { display: "none" },
                      transition:  "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        expanded === i
                          ? <Minus size={16} color={C.primary} />
                          : <Plus  size={16} color={C.textMuted} />
                      }
                      sx={{ px: 3, py: 1.25 }}
                    >
                      <Typography
                        sx={{
                          color:      expanded === i ? C.primary : C.textPrimary,
                          fontWeight: 700,
                          fontSize:   "0.95rem",
                          transition: "color 0.2s",
                        }}
                      >
                        {faq.q}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.78 }}>
                        {faq.a}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
