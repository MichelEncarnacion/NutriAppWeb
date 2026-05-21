// src/components/landing/LandingCTA.jsx — Final CTA Section
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const HIGHLIGHTS = [
  "Sin compromiso de contrato",
  "Demo personalizada en 24 h",
  "Punto de equilibrio en el mes 3",
  "50% más barato que la competencia",
];

export default function LandingCTA() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: C.ctaGrad,
        py:         { xs: 9, md: 13 },
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position:      "absolute",
          inset:         0,
          backgroundImage:
            "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.05) 0%, transparent 45%), " +
            "radial-gradient(circle at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={fadeInUp}>
            <Typography
              component="p"
              sx={{
                color:         "rgba(255,255,255,0.7)",
                fontWeight:    700,
                fontSize:      "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb:            1.5,
                textAlign:     "center",
              }}
            >
              Listo para empezar
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography
              component="h2"
              sx={{
                color:      C.white,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 900,
                fontSize:   { xs: "2rem", md: "2.8rem" },
                lineHeight: 1.15,
                textAlign:  "center",
                mb:         2,
              }}
            >
              ¿Listo para medir el ROI
              <br />
              de tu inversión en salud?
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography
              sx={{
                color:      "rgba(255,255,255,0.78)",
                fontSize:   "1.05rem",
                lineHeight: 1.7,
                textAlign:  "center",
                mb:         5,
                maxWidth:   480,
                mx:         "auto",
              }}
            >
              $28,600 MXN/año para 20 colaboradores. La inversión más inteligente
              que puedes hacer en productividad corporativa.
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button
                onClick={() => navigate("/demo")}
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  bgcolor:       C.white,
                  color:         C.primary,
                  fontWeight:    800,
                  textTransform: "none",
                  borderRadius:  "12px",
                  px:            4,
                  py:            1.7,
                  fontSize:      "1.05rem",
                  boxShadow:     "0 6px 28px rgba(0,0,0,0.2)",
                  "&:hover":     { bgcolor: "#F0FFF4", boxShadow: "0 10px 36px rgba(0,0,0,0.25)" },
                }}
              >
                Agendar mi demo gratuita
              </Button>
            </Box>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Box
              sx={{
                display:        "flex",
                flexWrap:       "wrap",
                justifyContent: "center",
                gap:            { xs: 1.5, md: 3 },
              }}
            >
              {HIGHLIGHTS.map((h) => (
                <Box key={h} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircle2 size={15} color="rgba(255,255,255,0.7)" />
                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.83rem", fontWeight: 600 }}>
                    {h}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
