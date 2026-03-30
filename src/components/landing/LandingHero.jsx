// src/components/landing/LandingHero.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { C, fadeInUp, stagger } from "./landingTokens";
import { useAuth } from "../../hooks/useAuth";

export default function LandingHero() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.bgMain,
        display: "flex",
        alignItems: "center",
        pt: 10,
        pb: 8,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, right: 0,
          width: "60%", height: "70%",
          background: "radial-gradient(ellipse at 80% 20%, rgba(61,220,132,0.1), transparent 60%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 6,
            alignItems: "center",
          }}
        >
          {/* ── Left column ── */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeInUp}>
              <Chip
                label="✦ IA + Expertos en Nutrición Certificados"
                sx={{
                  bgcolor: "rgba(61,220,132,0.08)",
                  color: C.green,
                  border: `1px solid ${C.border}`,
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  mb: 3,
                  borderRadius: "20px",
                  height: "auto",
                  "& .MuiChip-label": { py: 0.5, px: 1.5 },
                }}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography
                variant="h1"
                sx={{
                  color: C.textPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: "2.2rem", md: "3.4rem" },
                  lineHeight: 1.15,
                  mb: 3,
                }}
              >
                Tu plan nutricional personalizado,{" "}
                <Box component="span" sx={{ color: C.green }}>
                  listo en minutos
                </Box>
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography
                sx={{
                  color: C.textMuted,
                  fontSize: "1.1rem",
                  lineHeight: 1.75,
                  mb: 4,
                  maxWidth: 480,
                }}
              >
                Planes creados por nutriólogos certificados y potenciados por IA.
                Adaptados a tu cuerpo, objetivos y presupuesto. Sin esperas.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 5 }}>
                <Button
                  onClick={() => navigate(session ? "/panel" : "/registro")}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: C.green, color: "#000", fontWeight: 700,
                    textTransform: "none", borderRadius: "12px",
                    px: 4, py: 1.5, fontSize: "1rem",
                    boxShadow: "0 0 32px rgba(61,220,132,0.25)",
                    "&:hover": { bgcolor: "#5EF0A0" },
                  }}
                >
                  {session ? "Ir al panel →" : "Comenzar gratis →"}
                </Button>
                {!session && (
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: C.border, color: C.textMuted,
                      textTransform: "none", borderRadius: "12px",
                      px: 4, py: 1.5, fontSize: "1rem",
                      "&:hover": { borderColor: C.green, color: C.textPrimary },
                    }}
                  >
                    Ya tengo cuenta
                  </Button>
                )}
              </Box>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {["Plan de 15 días", "24 preguntas", "100% personalizado"].map((stat, i) => (
                  <Box key={stat} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {i > 0 && (
                      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: C.textMuted, flexShrink: 0 }} />
                    )}
                    <Typography sx={{ color: C.textMuted, fontSize: "0.85rem", fontWeight: 600 }}>
                      {stat}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </motion.div>

          {/* ── Right column — image ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
              {/* Glow blob */}
              <Box
                sx={{
                  position: "absolute",
                  inset: "-20%",
                  background:
                    "radial-gradient(ellipse, rgba(61,220,132,0.18), rgba(88,166,255,0.08), transparent 70%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80"
                alt="Plan nutricional personalizado"
                fetchPriority="high"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                sx={{
                  width: "100%",
                  maxWidth: 500,
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                  objectFit: "cover",
                  aspectRatio: "4/3",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
