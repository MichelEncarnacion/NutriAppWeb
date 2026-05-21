// src/components/landing/LandingFAQ.jsx — FAQs B2B
import { useState } from "react";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";

const FAQS = [
  {
    q: "¿Cuánto cuesta NutriiApp para mi empresa?",
    a: "$28,600 MXN al año para 20 colaboradores, equivalente a $1,430 MXN por persona al año. Somos 50% más baratos que el competidor corporativo más cercano y 65% más económicos que una consulta nutricional tradicional. El punto de equilibrio se alcanza en el mes 3.",
  },
  {
    q: "¿Cómo se calcula el ROI y cuándo veo resultados?",
    a: "El dashboard mide reducción de ausentismo, incremento de productividad y ahorro en servicios médicos. En promedio, nuestros clientes reportan ROI positivo desde el tercer mes. Con un margen bruto del 86.9% y una TIR del 54.6% a 5 años, la inversión en NutriiApp se justifica sola ante el CFO.",
  },
  {
    q: "¿Qué es el NutriiPoint y cómo se instala?",
    a: "NutriiPoint es nuestro dispositivo IoT propio que mide 16+ indicadores corporales por colaborador: composición corporal, biométricos y biomarcadores, en menos de 5 minutos. La instalación en tu empresa toma menos de 1 día y no requiere modificaciones de infraestructura.",
  },
  {
    q: "¿Cómo cumple NutriiApp con NOM-030 y NOM-035?",
    a: "NutriiApp tiene cumplimiento nativo con ambas normas. El dashboard genera automáticamente los reportes de diagnóstico y seguimiento requeridos por la NOM-030 (medidas preventivas) y NOM-035 (factores de riesgo psicosocial) con un solo clic. Tu equipo de RR.HH. no tiene que hacer trabajo extra.",
  },
  {
    q: "¿Cuánto tiempo tarda la implementación completa?",
    a: "La instalación del NutriiPoint y la configuración del dashboard empresarial toman menos de una semana. Los primeros planes personalizados para colaboradores están disponibles en las primeras 48 horas tras la medición inicial.",
  },
  {
    q: "¿Cómo se protege la información médica de mis colaboradores?",
    a: "Los datos biométricos se almacenan con cifrado de extremo a extremo y nunca se comparten con terceros. Cumplimos con la Ley Federal de Protección de Datos Personales (LFPDPPP) y los datos sensibles están segregados por nivel de acceso según el rol (colaborador, RR.HH., administrador).",
  },
];

export default function LandingFAQ() {
  const [expanded, setExpanded] = useState(null);

  return (
    <Box id="faq" sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">

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
            Preguntas frecuentes
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
            Todo lo que necesitas saber
            <br />
            antes de agendar tu demo
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
      </Container>
    </Box>
  );
}
