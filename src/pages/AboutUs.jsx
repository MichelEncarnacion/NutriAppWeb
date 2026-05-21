// src/pages/AboutUs.jsx
import { useState, useEffect } from "react";
import { Box, Container, Typography, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { Award, Leaf, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C, fadeInUp, stagger } from "../components/landing/landingTokens";
import { supabase } from "../lib/supabase";

const CATEGORY_COLORS = {
  "Empresa":           { bg: "#E8F5E9", color: C.primary },
  "Investigación":     { bg: "#FFF8E1", color: C.gold    },
  "Salud Corporativa": { bg: "#E3F2FD", color: "#1565C0" },
};

export default function AboutUs() {
  const navigate = useNavigate();
  const [news,          setNews]          = useState([]);
  const [awards,        setAwards]        = useState([]);
  const [founders,      setFounders]      = useState([]);
  const [fotoEquipo,    setFotoEquipo]    = useState(null);
  const [loadingNews,   setLoadingNews]   = useState(true);
  const [loadingAwards, setLoadingAwards] = useState(true);
  const [loadingFounders, setLoadingFounders] = useState(true);

  useEffect(() => {
    supabase
      .from("noticias")
      .select("id, titulo, extracto, categoria, fecha_display, imagen_url, autor, fuente_url")
      .eq("publicado", true)
      .order("orden", { ascending: true })
      .limit(6)
      .then(({ data }) => { setNews(data ?? []); setLoadingNews(false); });

    supabase
      .from("reconocimientos")
      .select("id, nombre, organizacion, fecha_display, descripcion, imagen_url")
      .eq("publicado", true)
      .order("orden", { ascending: true })
      .then(({ data }) => { setAwards(data ?? []); setLoadingAwards(false); });

    supabase
      .from("fundadores")
      .select("id, nombre, rol, descripcion, initials, imagen_url, orden")
      .order("orden", { ascending: true })
      .then(({ data }) => { setFounders(data ?? []); setLoadingFounders(false); });

    supabase
      .from("site_config")
      .select("value")
      .eq("key", "foto_equipo")
      .single()
      .then(({ data }) => setFotoEquipo(data?.value ?? null));
  }, []);

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      <LandingNavbar />

      {/* ── Hero ── */}
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
                  color:                "transparent",
                  backgroundImage:      "linear-gradient(90deg, #A5D6A7, #E8F5E9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip:       "text",
                }}
              >
                activo más rentable
              </Box>
              {" "}de cada empresa mexicana.
            </Typography>
            <Typography
              sx={{
                color:      "rgba(255,255,255,0.78)",
                fontSize:   { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.75,
                maxWidth:   520,
                mx:         "auto",
                mb:         4,
              }}
            >
              Devolviendo a cada colaborador el bienestar que merece y que su organización necesita.
            </Typography>

            {/* Credibility badges */}
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                "1er lugar COPARMEX Start Up 2026",
                "UPAEP · Puebla, México",
                "HealthTech · Nutrición con IA",
              ].map((text) => (
                <Box
                  key={text}
                  sx={{
                    bgcolor:      "rgba(255,255,255,0.10)",
                    border:       "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "100px",
                    px:           2,
                    py:           0.75,
                  }}
                >
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Misión + Visión (lado a lado) ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 7, md: 10 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="md">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Box
              sx={{
                display:             "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap:                 { xs: 0, md: 0 },
                border:              `1px solid ${C.border}`,
                borderRadius:        "20px",
                overflow:            "hidden",
                bgcolor:             C.bgCard,
                boxShadow:           C.shadow,
              }}
            >
              {/* Misión */}
              <motion.div variants={fadeInUp}>
                <Box
                  sx={{
                    p:           { xs: 4, md: 5 },
                    textAlign:   "center",
                    borderRight: { xs: "none", md: `1px solid ${C.border}` },
                    borderBottom:{ xs: `1px solid ${C.border}`, md: "none" },
                    height:      "100%",
                  }}
                >
                  <Box sx={{ width: 48, height: 48, bgcolor: "#E8F5E9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                    <Leaf size={22} color={C.primary} />
                  </Box>
                  <Typography
                    component="h2"
                    sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.3rem", md: "1.5rem" }, mb: 2 }}
                  >
                    Nuestra misión
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.95rem", lineHeight: 1.85, fontStyle: "italic" }}>
                    "Ampliar el acceso a los servicios de nutrición y salud preventiva con el servicio más accesible, personalizado y completo del mercado, para que nadie quede fuera por restricciones de precio o tiempo."
                  </Typography>
                </Box>
              </motion.div>

              {/* Visión */}
              <motion.div variants={fadeInUp}>
                <Box sx={{ p: { xs: 4, md: 5 }, textAlign: "center", height: "100%" }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: C.goldBg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                    <Target size={22} color={C.gold} />
                  </Box>
                  <Typography
                    component="h2"
                    sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.3rem", md: "1.5rem" }, mb: 2 }}
                  >
                    Nuestra visión
                  </Typography>
                  <Typography sx={{ color: C.textMuted, fontSize: "0.95rem", lineHeight: 1.85, fontStyle: "italic" }}>
                    "Ser el primer unicornio mexicano de salud y la empresa número uno en LATAM en HealthTech dedicada a nutrición y planeación alimentaria, medido por ingresos y número de usuarios."
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Quiénes somos ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2 }}
            >
              El equipo detrás de NutriiApp
            </Typography>
          </Box>

          {/* Foto grupal */}
          {fotoEquipo && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 4, md: 5 } }}>
              <Box
                sx={{
                  maxWidth:     360,
                  width:        "100%",
                  borderRadius: "16px",
                  overflow:     "hidden",
                  border:       `1px solid ${C.border}`,
                  boxShadow:    C.shadow,
                  cursor:       "pointer",
                  position:     "relative",
                  "&:hover .foto-overlay": { opacity: 1 },
                  "&:hover img":           { transform: "scale(1.03)" },
                }}
                onClick={() => window.open(fotoEquipo, "_blank")}
              >
                <Box
                  component="img"
                  src={fotoEquipo}
                  alt="El equipo NutriiApp"
                  sx={{ width: "100%", height: "auto", display: "block", transition: "transform 0.4s ease" }}
                />
                <Box
                  className="foto-overlay"
                  sx={{
                    position:       "absolute",
                    inset:          0,
                    bgcolor:        "rgba(0,0,0,0.35)",
                    opacity:        0,
                    transition:     "opacity 0.25s ease",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700 }}>
                    Ver foto completa
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Cards de fundadores */}
          {loadingFounders ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, maxWidth: 860, mx: "auto" }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ bgcolor: C.bgCard, borderRadius: "18px", border: `1px solid ${C.border}`, p: 3, textAlign: "center" }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mx: "auto", mb: 2 }} />
                  <Skeleton variant="text" width="70%" sx={{ mx: "auto", mb: 1 }} />
                  <Skeleton variant="text" width="50%" sx={{ mx: "auto", mb: 1.5 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, maxWidth: 860, mx: "auto" }}>
                {founders.map((f) => (
                  <motion.div key={f.id} variants={fadeInUp} style={{ display: "flex" }}>
                    <Box
                      sx={{
                        bgcolor:       C.bgCard,
                        borderRadius:  "18px",
                        border:        `1px solid ${C.border}`,
                        p:             3,
                        textAlign:     "center",
                        boxShadow:     C.shadow,
                        transition:    "border-color 0.2s, box-shadow 0.2s",
                        "&:hover":     { borderColor: C.accent, boxShadow: C.shadowMd },
                        display:       "flex",
                        flexDirection: "column",
                        alignItems:    "center",
                        width:         "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width:          120,
                          height:         120,
                          borderRadius:   "50%",
                          overflow:       "hidden",
                          mb:             2,
                          border:         `3px solid ${C.border}`,
                          cursor:         f.imagen_url ? "pointer" : "default",
                          position:       "relative",
                          background:     C.heroGrad,
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          flexShrink:     0,
                          "&:hover .fo":  { opacity: f.imagen_url ? 1 : 0 },
                        }}
                        onClick={() => f.imagen_url && window.open(f.imagen_url, "_blank")}
                      >
                        {f.imagen_url ? (
                          <>
                            <Box
                              component="img"
                              src={f.imagen_url}
                              alt={f.nombre}
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                            <Box
                              className="fo"
                              sx={{
                                position:       "absolute",
                                inset:          0,
                                bgcolor:        "rgba(0,0,0,0.4)",
                                opacity:        0,
                                transition:     "opacity 0.2s",
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>Ver</Typography>
                            </Box>
                          </>
                        ) : (
                          <Typography sx={{ fontSize: "2.2rem", fontWeight: 900, color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
                            {f.initials}
                          </Typography>
                        )}
                      </Box>

                      <Typography sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.3, mb: 0.5 }}>
                        {f.nombre}
                      </Typography>
                      <Typography sx={{ color: C.primary, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: f.descripcion ? 1.25 : 0 }}>
                        {f.rol}
                      </Typography>
                      {f.descripcion && (
                        <Typography sx={{ color: C.textMuted, fontSize: "0.82rem", lineHeight: 1.65, flex: 1 }}>
                          {f.descripcion}
                        </Typography>
                      )}
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* ── Noticias ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 6, md: 7 } }}>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2, mb: 1 }}
            >
              Lo último de NutriiApp
            </Typography>
            <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.7 }}>
              Noticias, prensa y recursos del equipo.
            </Typography>
          </Box>

          {loadingNews ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ bgcolor: C.bgCard, borderRadius: "16px", border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <Skeleton variant="rectangular" height={200} />
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" width="40%" sx={{ mb: 1.5 }} />
                    <Skeleton variant="text" width="90%" sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="75%" sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="55%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : news.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: C.textLight, fontSize: "0.95rem" }}>
                Próximamente publicaremos noticias y recursos.
              </Typography>
            </Box>
          ) : (
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
                        transition:    "border-color 0.2s, box-shadow 0.2s",
                        "&:hover":     { borderColor: C.accent, boxShadow: C.shadowMd },
                      }}
                    >
                      {article.imagen_url ? (
                        <Box
                          component="img"
                          src={article.imagen_url}
                          alt={article.titulo}
                          loading="lazy"
                          onClick={() => window.open(article.imagen_url, "_blank")}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          sx={{ width: "100%", height: 200, objectFit: "cover", display: "block", cursor: "pointer" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height:         200,
                            background:     `linear-gradient(135deg, ${cat.bg} 0%, #F0FFF4 100%)`,
                            display:        "flex",
                            alignItems:     "center",
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

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {article.autor && (
                            <Typography sx={{ color: C.textLight, fontSize: "0.75rem" }}>
                              {article.autor}
                            </Typography>
                          )}
                          {article.fuente_url && (
                            <Box
                              component="a"
                              href={article.fuente_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display:        "flex",
                                alignItems:     "center",
                                gap:            0.5,
                                color:          C.primary,
                                fontSize:       "0.83rem",
                                fontWeight:     700,
                                ml:             "auto",
                                textDecoration: "none",
                                "&:hover":      { opacity: 0.75 },
                              }}
                            >
                              Leer más <ArrowRight size={14} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </Container>
      </Box>

      {/* ── Reconocimientos ── */}
      {(loadingAwards || awards.length > 0) && (
        <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: { xs: 6, md: 7 } }}>
              <Typography
                component="h2"
                sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.2, mb: 1 }}
              >
                Premios y distinciones
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.7 }}>
                Reconocimientos que validan el trabajo del equipo.
              </Typography>
            </Box>

            {loadingAwards ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
                {[1, 2].map((i) => (
                  <Box key={i} sx={{ bgcolor: C.bgCard, borderRadius: "20px", border: "1px solid rgba(191,144,0,0.2)", overflow: "hidden" }}>
                    <Skeleton variant="rectangular" height={220} />
                    <Box sx={{ p: 3 }}>
                      <Skeleton variant="text" width="40%" sx={{ mb: 1.5 }} />
                      <Skeleton variant="text" width="85%" sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="65%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                style={{
                  display:             "grid",
                  gridTemplateColumns: awards.length === 1 ? "min(640px, 100%)" : "repeat(auto-fit, minmax(300px, 1fr))",
                  gap:                 24,
                  justifyContent:      "center",
                }}
              >
                {awards.map((award) => (
                  <motion.div key={award.id} variants={fadeInUp}>
                    <Box
                      sx={{
                        bgcolor:      C.bgCard,
                        borderRadius: "20px",
                        border:       "1px solid rgba(191,144,0,0.25)",
                        boxShadow:    "0 4px 24px rgba(191,144,0,0.08)",
                        overflow:     "hidden",
                        mx:           awards.length === 1 ? "auto" : 0,
                      }}
                    >
                      {award.imagen_url ? (
                        <Box
                          onClick={() => window.open(award.imagen_url, "_blank")}
                          sx={{
                            position:  "relative",
                            overflow:  "hidden",
                            cursor:    "pointer",
                            "&:hover .overlay": { opacity: 1 },
                            "&:hover img":      { transform: "scale(1.03)" },
                          }}
                        >
                          <Box
                            component="img"
                            src={award.imagen_url}
                            alt={award.nombre}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                            sx={{ width: "100%", height: "auto", display: "block", transition: "transform 0.4s ease" }}
                          />
                          <Box
                            className="overlay"
                            sx={{
                              position:       "absolute",
                              inset:          0,
                              bgcolor:        "rgba(0,0,0,0.38)",
                              display:        "flex",
                              alignItems:     "center",
                              justifyContent: "center",
                              opacity:        0,
                              transition:     "opacity 0.25s ease",
                            }}
                          >
                            <Typography sx={{ color: "#fff", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              Ver foto completa
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height:         140,
                            background:     "linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)",
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width:          64,
                              height:         64,
                              borderRadius:   "50%",
                              bgcolor:        C.goldBg,
                              border:         "2px solid rgba(191,144,0,0.3)",
                              display:        "flex",
                              alignItems:     "center",
                              justifyContent: "center",
                            }}
                          >
                            <Award size={28} color={C.gold} />
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ p: { xs: 3, md: 4 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                          <Box sx={{ px: 1.5, py: 0.4, bgcolor: C.goldBg, borderRadius: "6px" }}>
                            <Typography sx={{ color: C.gold, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                              {award.organizacion}
                            </Typography>
                          </Box>
                          {award.fecha_display && (
                            <Typography sx={{ color: C.textLight, fontSize: "0.78rem" }}>
                              {award.fecha_display}
                            </Typography>
                          )}
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
                          {award.nombre}
                        </Typography>
                        {award.descripcion && (
                          <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.75 }}>
                            {award.descripcion}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Container>
        </Box>
      )}

      {/* ── CTA ── */}
      <Box
        sx={{
          py:         { xs: 8, md: 10 },
          textAlign:  "center",
          borderTop:  `1px solid ${C.border}`,
          background: C.heroGrad,
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 70%, rgba(255,255,255,0.05), transparent 50%)", pointerEvents: "none" }} />
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.7rem", md: "2.1rem" }, mb: 2, lineHeight: 1.25 }}>
            ¿Quieres conocernos mejor?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "1rem", mb: 4, lineHeight: 1.7 }}>
            Agenda una demo y te mostramos cómo NutriiApp puede transformar la salud de tu empresa.
          </Typography>
          <Button
            onClick={() => navigate("/demo")}
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={17} />}
            sx={{
              bgcolor:       "rgba(255,255,255,0.15)",
              color:         C.white,
              fontWeight:    700,
              textTransform: "none",
              borderRadius:  "12px",
              px:            3.5,
              py:            1.5,
              fontSize:      "1rem",
              border:        "1px solid rgba(255,255,255,0.3)",
              boxShadow:     "none",
              backdropFilter:"blur(8px)",
              "&:hover":     { bgcolor: "rgba(255,255,255,0.25)", boxShadow: "none" },
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
