// src/pages/AboutUs.jsx
import { useState, useEffect } from "react";
import { Box, Container, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Award, Leaf, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C, fadeInUp, stagger } from "../components/landing/landingTokens";
import { supabase } from "../lib/supabase";

/* ── Founders ──────────────────────────────────────────────── */
const FOUNDERS = [
  {
    name:  "Emanuel Basilio Vergara",
    role:  "CEO y Fundador · Economista",
    desc:  "Diseña la estrategia de negocio y el modelo go-to-market. Responsable del crecimiento, alianzas y relaciones con empresas en México.",
    initials: "E",
  },
  {
    name:  "Georgiana Estefania Mota Arias",
    role:  "COO y Co-fundadora · Nutrióloga",
    desc:  "Diseña los protocolos clínicos que garantizan la precisión médica de cada plan generado por NutriiApp.",
    initials: "G",
  },
  {
    name:  "Michel Encarnación Dionicio",
    role:  "CTO y Co-fundador · Ing. de Software",
    desc:  "Arquitectura tecnológica y motor de IA. Construye la infraestructura que conecta el NutriiPoint con el dashboard empresarial.",
    initials: "M",
  },
];

/* ── News (fallback estático mientras no hay DB) ─────────────── */
const NEWS_FALLBACK = [
  {
    categoria:     "Empresa",
    fecha_display: "Mayo 2025",
    titulo:        "NutriiApp obtiene reconocimiento COPARMEX Puebla por innovación en salud corporativa",
    extracto:      "La plataforma fue distinguida entre más de 40 proyectos por su impacto en bienestar empresarial y su modelo de negocio sostenible.",
  },
  {
    categoria:     "Investigación",
    fecha_display: "Abril 2025",
    titulo:        "El costo oculto de no gestionar la salud de tus colaboradores",
    extracto:      "Un análisis de los datos de ausentismo y productividad en empresas mexicanas de 50 a 500 colaboradores durante 2024.",
  },
  {
    categoria:     "Salud Corporativa",
    fecha_display: "Marzo 2025",
    titulo:        "NOM-030 y NOM-035: qué necesitan hacer las empresas en 2025",
    extracto:      "Guía práctica para directores de RR.HH. sobre las obligaciones legales de bienestar y cómo cumplirlas sin esfuerzo adicional.",
  },
];

/* ── Award ─────────────────────────────────────────────────── */
const AWARD = {
  name:   "Premio COPARMEX Puebla: Innovación Empresarial",
  date:   "Mayo 2025",
  desc:   "NutriiApp fue reconocida por COPARMEX Puebla como proyecto de innovación empresarial destacado, valorando su impacto en la salud preventiva corporativa y su modelo financiero con margen bruto del 86.9% y TIR del 54.6%.",
};

const CATEGORY_COLORS = {
  "Empresa":           { bg: "#E8F5E9", color: C.primary },
  "Investigación":     { bg: "#FFF8E1", color: C.gold    },
  "Salud Corporativa": { bg: "#E3F2FD", color: "#1565C0" },
};

export default function AboutUs() {
  const navigate = useNavigate();
  const [news, setNews] = useState(NEWS_FALLBACK);

  useEffect(() => {
    supabase
      .from("noticias")
      .select("id, titulo, extracto, categoria, fecha_display, imagen_url")
      .eq("publicado", true)
      .order("orden", { ascending: true })
      .limit(6)
      .then(({ data }) => { if (data && data.length > 0) setNews(data); });
  }, []);

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      <LandingNavbar />

      {/* ── Hero section ── */}
      <Box
        sx={{
          background: C.heroGrad,
          pt:         { xs: 13, md: 14 },
          pb:         { xs: 8, md: 10 },
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 50%)", pointerEvents: "none" }} />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Chip
              label="Nuestra historia"
              sx={{
                bgcolor:  "rgba(255,255,255,0.12)",
                color:    "rgba(255,255,255,0.9)",
                border:   "1px solid rgba(255,255,255,0.2)",
                fontWeight: 700,
                fontSize: "0.72rem",
                mb:       3,
                "& .MuiChip-label": { py: 0.6, px: 1.5 },
              }}
            />
            <Typography
              component="h1"
              sx={{
                color:      C.white,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 900,
                fontSize:   { xs: "2.2rem", md: "3rem" },
                lineHeight: 1.15,
                mb:         3,
              }}
            >
              Convertir la salud preventiva en el{" "}
              <Box
                component="span"
                sx={{
                  color:              "transparent",
                  backgroundImage:    "linear-gradient(90deg, #A5D6A7, #E8F5E9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip:     "text",
                }}
              >
                activo más rentable
              </Box>
              {" "}de cada empresa mexicana.
            </Typography>
            <Typography
              sx={{
                color:     "rgba(255,255,255,0.78)",
                fontSize:  { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.75,
                maxWidth:  520,
                mx:        "auto",
              }}
            >
              Devolviendo a cada colaborador el bienestar que merece y que su organización necesita.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* ── Mission ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 11 } }}>
        <Container maxWidth="md">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: "#E8F5E9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Leaf size={22} color={C.primary} />
                </Box>
              </Box>
              <Typography
                component="h2"
                sx={{
                  color:      C.textPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "1.6rem", md: "2rem" },
                  textAlign:  "center",
                  mb:         2,
                  lineHeight: 1.3,
                }}
              >
                Nuestra misión
              </Typography>
              <Typography
                sx={{
                  color:      C.textMuted,
                  fontSize:   { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.85,
                  textAlign:  "center",
                  maxWidth:   600,
                  mx:         "auto",
                  fontStyle:  "italic",
                }}
              >
                "Ampliar el acceso a los servicios de nutrición y salud preventiva con el servicio
                más accesible, personalizado y completo del mercado, para que nadie quede fuera
                por restricciones de precio o tiempo."
              </Typography>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* ── Vision ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="md">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: C.goldBg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={22} color={C.gold} />
                </Box>
              </Box>
              <Typography
                component="h2"
                sx={{
                  color:      C.textPrimary,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 900,
                  fontSize:   { xs: "1.6rem", md: "2rem" },
                  textAlign:  "center",
                  mb:         2,
                  lineHeight: 1.3,
                }}
              >
                Nuestra visión
              </Typography>
              <Typography
                sx={{
                  color:      C.textMuted,
                  fontSize:   { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.85,
                  textAlign:  "center",
                  maxWidth:   600,
                  mx:         "auto",
                  fontStyle:  "italic",
                }}
              >
                "Ser el primer unicornio mexicano de salud y la empresa número uno en LATAM en
                HealthTech dedicada a nutrición y planeación alimentaria, medido por ingresos
                y número de usuarios."
              </Typography>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* ── Founders ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 7 } }}>
            <Typography
              component="p"
              sx={{ color: C.primary, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}
            >
              Quiénes somos
            </Typography>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2 }}
            >
              El equipo detrás de NutriiApp
            </Typography>
          </Box>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}
          >
            {FOUNDERS.map((f) => (
              <motion.div key={f.name} variants={fadeInUp}>
                <Box
                  sx={{
                    bgcolor:      C.bgCard,
                    borderRadius: "16px",
                    border:       `1px solid ${C.border}`,
                    p:            3.5,
                    textAlign:    "center",
                    boxShadow:    C.shadow,
                    transition:   "transform 0.25s, box-shadow 0.25s",
                    "&:hover":    { transform: "translateY(-4px)", boxShadow: C.shadowMd },
                  }}
                >
                  {/* Avatar placeholder */}
                  <Box
                    sx={{
                      width:          80,
                      height:         80,
                      borderRadius:   "50%",
                      background:     C.heroGrad,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      mx:             "auto",
                      mb:             2.5,
                      fontSize:       "1.8rem",
                      fontWeight:     900,
                      color:          C.white,
                      fontFamily:     "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {f.initials}
                  </Box>
                  <Typography sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.1rem", mb: 0.5 }}>
                    {f.name}
                  </Typography>
                  <Typography sx={{ color: C.primary, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5 }}>
                    {f.role}
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.72 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Box>

      {/* ── News / Articles ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 7 } }}>
            <Typography
              component="p"
              sx={{ color: C.primary, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}
            >
              Noticias y recursos
            </Typography>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2 }}
            >
              Lo último de NutriiApp
            </Typography>
          </Box>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}
          >
            {news.map((article, idx) => {
              const cat = CATEGORY_COLORS[article.categoria] || { bg: "#F3F4F6", color: C.textMuted };
              return (
                <motion.div key={article.id ?? idx} variants={fadeInUp}>
                  <Box
                    sx={{
                      bgcolor:       C.bgCard,
                      borderRadius:  "16px",
                      border:        `1px solid ${C.border}`,
                      overflow:      "hidden",
                      boxShadow:     C.shadow,
                      height:        "100%",
                      display:       "flex",
                      flexDirection: "column",
                      transition:    "transform 0.25s, box-shadow 0.25s",
                      "&:hover":     { transform: "translateY(-4px)", boxShadow: C.shadowMd },
                    }}
                  >
                    {/* Imagen o placeholder */}
                    {article.imagen_url ? (
                      <Box
                        component="img"
                        src={article.imagen_url}
                        alt={article.titulo}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                        sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height:     160,
                          background: `linear-gradient(135deg, ${cat.bg} 0%, #F0FFF4 100%)`,
                          display:    "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Leaf size={22} color={cat.color} />
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                        <Box sx={{ px: 1.25, py: 0.35, borderRadius: "6px", bgcolor: cat.bg }}>
                          <Typography sx={{ color: cat.color, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {article.categoria}
                          </Typography>
                        </Box>
                        <Typography sx={{ color: C.textLight, fontSize: "0.75rem" }}>
                          {article.fecha_display}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          color:      C.textPrimary,
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          fontWeight: 800,
                          fontSize:   "0.95rem",
                          lineHeight: 1.45,
                          mb:         1.25,
                          flex:       1,
                        }}
                      >
                        {article.titulo}
                      </Typography>

                      <Typography sx={{ color: C.textMuted, fontSize: "0.83rem", lineHeight: 1.7, mb: 2 }}>
                        {article.extracto}
                      </Typography>

                      <Box
                        sx={{
                          display:    "flex",
                          alignItems: "center",
                          gap:        0.5,
                          color:      C.primary,
                          fontSize:   "0.83rem",
                          fontWeight: 700,
                          cursor:     "pointer",
                          width:      "fit-content",
                          "&:hover":  { opacity: 0.75 },
                        }}
                      >
                        Leer más <ArrowRight size={14} />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </Box>

      {/* ── Awards ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 6, md: 7 } }}>
            <Typography
              component="p"
              sx={{ color: C.gold, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}
            >
              Reconocimientos
            </Typography>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2 }}
            >
              Premios y distinciones
            </Typography>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                maxWidth:     640,
                mx:           "auto",
                bgcolor:      C.bgCard,
                borderRadius: "20px",
                border:       `1px solid rgba(191,144,0,0.25)`,
                boxShadow:    `0 4px 24px rgba(191,144,0,0.08)`,
                overflow:     "hidden",
              }}
            >
              {/* Image placeholder */}
              <Box
                sx={{
                  height:     200,
                  background: "linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)",
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width:        72,
                    height:       72,
                    borderRadius: "50%",
                    bgcolor:      C.goldBg,
                    border:       `2px solid rgba(191,144,0,0.3)`,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                  }}
                >
                  <Award size={30} color={C.gold} />
                </Box>
                <Typography sx={{ color: C.gold, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Foto del reconocimiento
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box sx={{ px: 1.5, py: 0.4, bgcolor: C.goldBg, borderRadius: "6px" }}>
                    <Typography sx={{ color: C.gold, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      COPARMEX Puebla
                    </Typography>
                  </Box>
                  <Typography sx={{ color: C.textLight, fontSize: "0.78rem" }}>
                    {AWARD.date}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color:      C.textPrimary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 800,
                    fontSize:   { xs: "1.05rem", md: "1.2rem" },
                    lineHeight: 1.4,
                    mb:         2,
                  }}
                >
                  {AWARD.name}
                </Typography>
                <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.75 }}>
                  {AWARD.desc}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── CTA strip ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 7, md: 9 }, textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="sm">
          <Typography sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.6rem", md: "2rem" }, mb: 2 }}>
            ¿Quieres conocernos mejor?
          </Typography>
          <Typography sx={{ color: C.textMuted, fontSize: "1rem", mb: 3.5, lineHeight: 1.7 }}>
            Agenda una demo y te mostramos cómo NutriiApp puede transformar la salud de tu empresa.
          </Typography>
          <Button
            onClick={() => navigate("/demo")}
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={17} />}
            sx={{
              bgcolor:       C.primary,
              color:         C.white,
              fontWeight:    700,
              textTransform: "none",
              borderRadius:  "12px",
              px:            3.5,
              py:            1.5,
              fontSize:      "1rem",
              boxShadow:     "none",
              "&:hover":     { bgcolor: C.secondary, boxShadow: "none" },
            }}
          >
            Solicitar demo
          </Button>
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
