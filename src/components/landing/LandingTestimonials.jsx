// src/components/landing/LandingTestimonials.jsx
import { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const LOGOS = [
  "Grupo Bimbo", "OXXO Corp", "Cemex", "Banorte", "Liverpool",
  "Grupo Bimbo", "OXXO Corp", "Cemex", "Banorte", "Liverpool",
];

const TESTIMONIALS = [
  {
    quote:    "Implementamos NutriiApp en 3 días. En el mes 2 ya veíamos reducción de ausentismo. El dashboard de RR.HH. nos ahorra 4 horas a la semana en reportes NOM.",
    name:     "Adriana Vargas",
    role:     "Directora de RR.HH.",
    company:  "Manufactura del Norte S.A.",
    rating:   5,
    featured: false,
    initials: "AV",
    avatarBg: "#E8F5E9",
    avatarColor: C.primary,
  },
  {
    quote:    "El ROI fue tangible desde el tercer mes. Nuestros colaboradores están más comprometidos y la tasa de rotación bajó un 18%. NutriiApp fue la mejor decisión del año.",
    name:     "Roberto Elizondo",
    role:     "Gerente de Operaciones",
    company:  "LogiCenter México",
    rating:   5,
    featured: true,
    initials: "RE",
    avatarBg: "rgba(255,255,255,0.2)",
    avatarColor: "#fff",
  },
  {
    quote:    "Lo que más valoro es que cada colaborador tiene un plan real basado en sus métricas, no una plantilla genérica. La IA realmente personaliza.",
    name:     "Claudia Mendoza",
    role:     "VP de Capital Humano",
    company:  "Servicios Integrales GDL",
    rating:   5,
    featured: false,
    initials: "CM",
    avatarBg: "#E3F2FD",
    avatarColor: "#1565C0",
  },
];

function StarRating({ rating, featured }) {
  return (
    <Box sx={{ display: "flex", gap: 0.4, mb: 1.5 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}
        >
          <Star
            size={14}
            fill={i < rating ? "#FFB300" : "none"}
            color={i < rating ? "#FFB300" : (featured ? "rgba(255,255,255,0.3)" : "#CBD5E0")}
          />
        </motion.div>
      ))}
    </Box>
  );
}

function TestimonialCard({ testimonial, active }) {
  const { quote, name, role, company, rating, featured, initials, avatarBg, avatarColor } = testimonial;
  return (
    <Box
      sx={{
        bgcolor:      featured ? C.primary : C.white,
        border:       featured ? "none" : `1px solid ${C.border}`,
        borderRadius: "16px",
        p:            { xs: 2.5, md: 3 },
        boxShadow:    featured
          ? "0 12px 40px rgba(27,94,32,0.3)"
          : "0 4px 20px rgba(0,0,0,0.06)",
        position:     "relative",
        height:       "100%",
        display:      "flex",
        flexDirection:"column",
        opacity:      active === undefined ? 1 : active ? 1 : 0.5,
        transition:   "opacity 0.3s ease",
      }}
    >
      {featured && (
        <Box
          sx={{
            position:     "absolute",
            top:          -10,
            left:         16,
            bgcolor:      "#FFB300",
            borderRadius: "6px",
            px:           1,
            py:           0.25,
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em" }}>
            DESTACADO
          </Typography>
        </Box>
      )}

      <StarRating rating={rating} featured={featured} />

      <Typography
        sx={{
          color:      featured ? "rgba(255,255,255,0.9)" : C.textPrimary,
          fontSize:   "0.88rem",
          lineHeight: 1.75,
          flex:       1,
          mb:         2,
          fontStyle:  "italic",
        }}
      >
        "{quote}"
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, pt: 2, borderTop: `1px solid ${featured ? "rgba(255,255,255,0.15)" : C.border}` }}>
        <Box
          sx={{
            width:          36,
            height:         36,
            borderRadius:   "50%",
            bgcolor:        avatarBg,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          <Typography sx={{ color: avatarColor, fontSize: "0.65rem", fontWeight: 800 }}>
            {initials}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: featured ? "#fff" : C.textPrimary, fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.2 }}>
            {name}
          </Typography>
          <Typography sx={{ color: featured ? "rgba(255,255,255,0.6)" : C.textMuted, fontSize: "0.72rem" }}>
            {role} · {company}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}` }}>
      <Container maxWidth="lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
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
                LO QUE DICEN NUESTROS CLIENTES
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
              }}
            >
              Empresas que ya miden
              <Box component="span" sx={{ color: C.primary }}> el impacto real</Box>
            </Typography>
          </Box>
        </motion.div>

        {/* Logo band */}
        <Box
          sx={{
            overflow: "hidden",
            mb:       6,
            py:       2,
            borderTop:    `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <Box
            sx={{
              display:   "flex",
              gap:       5,
              width:     "max-content",
              animation: "logoScroll 25s linear infinite",
              "@keyframes logoScroll": {
                "0%":   { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
            }}
          >
            {LOGOS.map((logo, i) => (
              <Typography
                key={i}
                sx={{
                  color:       C.textLight,
                  fontSize:    "0.8rem",
                  fontWeight:  700,
                  opacity:     0.45,
                  whiteSpace:  "nowrap",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {logo}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Cards — desktop grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Box
            sx={{
              display:             { xs: "none", md: "grid" },
              gridTemplateColumns: "repeat(3, 1fr)",
              gap:                 3,
              alignItems:          "stretch",
            }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeInUp} style={{ display: "flex" }}>
                <TestimonialCard testimonial={t} />
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Cards — mobile carrusel */}
        <Box sx={{ display: { xs: "block", md: "none" }, overflow: "hidden" }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) setActiveIndex(i => Math.min(i + 1, TESTIMONIALS.length - 1));
              if (info.offset.x > 50)  setActiveIndex(i => Math.max(i - 1, 0));
            }}
          >
            <TestimonialCard testimonial={TESTIMONIALS[activeIndex]} />
          </motion.div>
          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 3 }}>
            {TESTIMONIALS.map((_, i) => (
              <Box
                key={i}
                onClick={() => setActiveIndex(i)}
                sx={{
                  width:        i === activeIndex ? 20 : 6,
                  height:       6,
                  borderRadius: 3,
                  bgcolor:      i === activeIndex ? C.primary : C.border,
                  cursor:       "pointer",
                  transition:   "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
}