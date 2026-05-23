// src/components/landing/LandingHero.jsx
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { C, fadeInUp, stagger, floatAnim } from "./landingTokens";

const TRUST_BADGES = [
  "NOM-030 / NOM-035",
  "IoT propio · NutriiPoint",
  "IA clínica certificada",
];

const EMPLOYEES = [
  { name: "Ana García",    dept: "Finanzas",    score: 87, trend: "+12 pts" },
  { name: "Carlos Méndez", dept: "Operaciones", score: 74, trend: "+8 pts"  },
  { name: "Laura Torres",  dept: "Ventas",      score: 91, trend: "+19 pts" },
];

const KPIS = [
  { label: "Ausentismo",    end: 38, prefix: "−", suffix: "%", sub: "vs. año ant.", color: "#A5D6A7" },
  { label: "Productividad", end: 24, prefix: "+", suffix: "%", sub: "índice gral.", color: "#81C784" },
];

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: C.heroGrad,
        minHeight:  "100vh",
        display:    "flex",
        alignItems: "center",
        pt:         { xs: 11, md: 10 },
        pb:         { xs: 8, md: 10 },
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Radial gradients base */}
      <Box
        sx={{
          position:        "absolute",
          inset:           0,
          backgroundImage:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          pointerEvents:   "none",
        }}
      />

      {/* Orbe top-right */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position:     "absolute",
          top:          "-10%",
          right:        "3%",
          width:        "38%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(165,214,167,0.18), transparent 70%)",
          filter:       "blur(50px)",
          pointerEvents:"none",
        }}
      />

      {/* Orbe bottom-left */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position:     "absolute",
          bottom:       "5%",
          left:         "-5%",
          width:        "30%",
          aspectRatio:  "1",
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(67,160,71,0.14), transparent 70%)",
          filter:       "blur(60px)",
          pointerEvents:"none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display:             "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
            gap:                 { xs: 6, lg: 8 },
            alignItems:          "center",
          }}
        >
          {/* Left column */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            <motion.div variants={fadeInUp}>
              <Typography
                component="h1"
                sx={{
                  color:         C.white,
                  fontFamily:    "Plus Jakarta Sans, sans-serif",
                  fontWeight:    900,
                  fontSize:      { xs: "2.3rem", md: "3rem", lg: "3.4rem" },
                  lineHeight:    1.12,
                  mb:            3,
                  letterSpacing: "-0.01em",
                }}
              >
                Tus colaboradores más sanos.{" "}
                <Box
                  component="span"
                  sx={{
                    color:                "transparent",
                    backgroundImage:      "linear-gradient(90deg, #A5D6A7, #E8F5E9, #A5D6A7)",
                    backgroundSize:       "200% auto",
                    WebkitBackgroundClip: "text",
                    backgroundClip:       "text",
                    animation:            "shimmerText 4s linear infinite",
                    "@keyframes shimmerText": {
                      "0%":   { backgroundPosition: "0% center" },
                      "100%": { backgroundPosition: "200% center" },
                    },
                  }}
                >
                  Tu empresa más productiva.
                </Box>
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography
                sx={{
                  color:      "rgba(255,255,255,0.82)",
                  fontSize:   { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.78,
                  mb:         4,
                  maxWidth:   500,
                }}
              >
                Medimos a cada colaborador con nuestro propio hardware, generamos un plan
                nutricional con IA y entregamos a RR.HH. un dashboard con KPIs de
                productividad y retorno de inversión reales.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 5 }}>
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
                    px:            3.5,
                    py:            1.5,
                    fontSize:      "1rem",
                    boxShadow:     "0 4px 24px rgba(0,0,0,0.18)",
                    "&:hover":     { bgcolor: "#F0FFF4", boxShadow: "0 6px 32px rgba(0,0,0,0.22)" },
                  }}
                >
                  Solicitar demo
                </Button>

                <Button
                  href="#como-funciona"
                  component="a"
                  size="large"
                  startIcon={<PlayCircle size={18} />}
                  sx={{
                    color:         C.white,
                    border:        "1.5px solid rgba(255,255,255,0.4)",
                    textTransform: "none",
                    fontWeight:    600,
                    borderRadius:  "12px",
                    px:            3,
                    py:            1.5,
                    fontSize:      "1rem",
                    "&:hover":     { bgcolor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.7)" },
                  }}
                >
                  Ver cómo funciona
                </Button>
              </Box>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <ShieldCheck size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />
                {TRUST_BADGES.map((badge, i) => (
                  <Box key={badge} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {i > 0 && (
                      <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.35)", mx: 0.5 }} />
                    )}
                    <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", fontWeight: 600 }}>
                      {badge}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </motion.div>

          {/* Right column — dashboard mockup 3D */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          >
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {/* Glow detrás del mockup */}
              <Box
                sx={{
                  position:      "absolute",
                  inset:         "-10%",
                  background:    "radial-gradient(ellipse, rgba(255,255,255,0.1), transparent 70%)",
                  filter:        "blur(30px)",
                  pointerEvents: "none",
                }}
              />

              {/* Dashboard flotante con perspectiva 3D */}
              <motion.div
                {...floatAnim}
                style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
              >
                <Box
                  sx={{
                    borderRadius:   "20px",
                    overflow:       "hidden",
                    border:         "1px solid rgba(255,255,255,0.15)",
                    boxShadow:      "0 32px 80px rgba(0,0,0,0.45)",
                    bgcolor:        "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    transform:      "perspective(800px) rotateX(3deg) rotateY(-4deg)",
                  }}
                >
                  {/* App bar */}
                  <Box
                    sx={{
                      bgcolor:        "rgba(255,255,255,0.08)",
                      px:             2.5,
                      py:             1.5,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      borderBottom:   "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 700 }}>
                      NutriiApp · Dashboard RR.HH.
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem" }}>
                      Mayo 2026
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    {/* KPI row con CountUp */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2, alignItems: "stretch" }}>
                      {KPIS.map((kpi) => (
                        <Box
                          key={kpi.label}
                          sx={{
                            bgcolor:      "rgba(255,255,255,0.07)",
                            borderRadius: "10px",
                            p:            1.25,
                            border:       "1px solid rgba(255,255,255,0.08)",
                            display:      "flex",
                            flexDirection:"column",
                          }}
                        >
                          <Typography sx={{ color: kpi.color, fontWeight: 900, fontSize: "1.15rem", lineHeight: 1 }}>
                            <CountUp
                              end={kpi.end}
                              prefix={kpi.prefix}
                              suffix={kpi.suffix}
                              duration={2.5}
                              enableScrollSpy
                              scrollSpyOnce
                            />
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem", mt: 0.4, fontWeight: 600 }}>
                            {kpi.label}
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.56rem", mt: 0.2 }}>
                            {kpi.sub}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Employee list */}
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.62rem", fontWeight: 600, mb: 1 }}>
                      Colaboradores · plan activo
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {EMPLOYEES.map((emp) => (
                        <Box
                          key={emp.name}
                          sx={{
                            display:      "flex",
                            alignItems:   "center",
                            gap:          1.5,
                            bgcolor:      "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            px:           1.5,
                            py:           0.85,
                            border:       "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Box
                            sx={{
                              width:          28,
                              height:         28,
                              borderRadius:   "50%",
                              bgcolor:        "rgba(165,214,167,0.25)",
                              display:        "flex",
                              alignItems:     "center",
                              justifyContent: "center",
                              flexShrink:     0,
                            }}
                          >
                            <Typography sx={{ color: "#A5D6A7", fontSize: "0.6rem", fontWeight: 800 }}>
                              {emp.name.split(" ").map(w => w[0]).join("")}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.7rem", fontWeight: 700, lineHeight: 1.2 }}>
                              {emp.name}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.38)", fontSize: "0.58rem" }}>
                              {emp.dept}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                            <Typography sx={{ color: "#81C784", fontSize: "0.7rem", fontWeight: 800, lineHeight: 1 }}>
                              {emp.score}
                            </Typography>
                            <Typography sx={{ color: "rgba(129,199,132,0.6)", fontSize: "0.56rem" }}>
                              {emp.trend}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
