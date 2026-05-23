// src/components/landing/LandingCTA.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { C, fadeInUp, stagger } from "./landingTokens";

const HIGHLIGHTS = [
  "Sin compromiso de contrato",
  "Demo personalizada en 24 h",
  "50% más barato que la competencia",
];

const HEADLINE_WORDS = ["¿Listo", "para", "medir", "el", "ROI"];
const HEADLINE_WORDS2 = ["de", "tu", "inversión", "en", "salud?"];

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
      {/* Radial base */}
      <Box
        sx={{
          position:        "absolute",
          inset:           0,
          backgroundImage:
            "radial-gradient(circle at 10% 50%, rgba(255,255,255,0.05) 0%, transparent 45%), " +
            "radial-gradient(circle at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)",
          pointerEvents:   "none",
        }}
      />

      {/* Orbe izquierda */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          top:          "-20%",
          left:         "-10%",
          width:        "45%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(165,214,167,0.15), transparent 70%)",
          filter:       "blur(50px)",
          pointerEvents:"none",
        }}
      />

      {/* Orbe derecha */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position:     "absolute",
          bottom:       "-15%",
          right:        "-8%",
          width:        "40%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(67,160,71,0.12), transparent 70%)",
          filter:       "blur(60px)",
          pointerEvents:"none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Headline animado por palabras */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                component="h2"
                sx={{
                  color:      C.white,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "2rem", md: "2.8rem" },
                  lineHeight: 1.15,
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em" }}>
                  {HEADLINE_WORDS.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em" }}>
                  {HEADLINE_WORDS2.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (HEADLINE_WORDS.length + i) * 0.07, duration: 0.4, ease: "easeOut" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </Box>
              </Typography>
            </Box>
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

          {/* Botón con shimmer */}
          <motion.div variants={fadeInUp}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "12px", display: "inline-flex" }}>
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
                    position:      "relative",
                    zIndex:        1,
                  }}
                >
                  Agendar mi demo gratuita
                </Button>
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                  style={{
                    position:    "absolute",
                    top:         0,
                    left:        0,
                    width:       "40%",
                    height:      "100%",
                    background:  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
                    transform:   "skewX(-15deg)",
                    pointerEvents: "none",
                    zIndex:      2,
                  }}
                />
              </Box>
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
