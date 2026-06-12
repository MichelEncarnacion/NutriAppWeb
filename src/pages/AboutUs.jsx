// src/pages/AboutUs.jsx
import { useState, useEffect } from "react";
import { Box, Container, Typography, Skeleton, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Award, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C, fadeInUp, stagger } from "../components/landing/landingTokens";
import { supabase } from "../lib/supabase";

const CATEGORY_COLORS = {
  "Empresa":           { bg: "#E8F5E9", color: C.primary },
  "Investigación":     { bg: "#FFF8E1", color: C.gold    },
  "Salud Corporativa": { bg: "#E3F2FD", color: "#1565C0" },
};

/* Ficha técnica del hero */
const COMPANY_FACTS = [
  { value: "2025",  label: "Año de fundación",        sub: "Puebla, México"   },
  { value: "1°",    label: "Lugar COPARMEX Start Up", sub: "edición 2026"     },
  { value: "16+",   label: "Indicadores biométricos", sub: "por NutriiPoint"  },
];

/* Trayectoria — hitos fechados */
const MILESTONES = [
  {
    year:  "2025",
    title: "Nace NutriiApp en Puebla",
    desc:  "Fundamos la empresa con una pregunta incómoda: ¿por qué las empresas invierten en capacitaciones, herramientas y tecnología, pero casi nadie mide la salud de sus colaboradores con datos reales?",
  },
  {
    year:  "2025",
    title: "NutriiPoint: hardware propio",
    desc:  "Desarrollamos nuestro dispositivo IoT que mide 16+ indicadores corporales por colaborador, lo que otros solo estiman, y el modelo de IA que convierte esos datos en planes de nutrición realmente personalizados.",
  },
  {
    year:  "2026",
    title: "1er lugar COPARMEX Start Up",
    desc:  "COPARMEX eligió a NutriiApp como el Start Up número uno de México en nuestra categoría. Seguimos construyendo desde Puebla.",
  },
];

/* Etiqueta de sección estilo editorial */
function SectionLabel({ children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ width: 28, height: 2, bgcolor: C.primary }} />
      <Typography sx={{ color: C.primary, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function AboutUs() {
  const navigate = useNavigate();
  const [news,            setNews]            = useState([]);
  const [awards,          setAwards]          = useState([]);
  const [founders,        setFounders]        = useState([]);
  const [fotoEquipo,      setFotoEquipo]      = useState(null);
  const [loadingNews,     setLoadingNews]     = useState(true);
  const [loadingAwards,   setLoadingAwards]   = useState(true);
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

      {/* ── Hero editorial — claro, asimétrico ── */}
      <Box sx={{ bgcolor: C.bgMain, pt: { xs: 15, md: 19 }, pb: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display:             "grid",
              gridTemplateColumns: { xs: "1fr", md: "7fr 4fr" },
              gap:                 { xs: 6, md: 10 },
              alignItems:          "start",
            }}
          >
            {/* Titular a la izquierda */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <SectionLabel>Nosotros</SectionLabel>
              <Typography
                component="h1"
                sx={{
                  color:         C.textPrimary,
                  fontFamily:    "Plus Jakarta Sans, sans-serif",
                  fontWeight:    900,
                  fontSize:      { xs: "2.4rem", md: "3.4rem" },
                  lineHeight:    1.08,
                  letterSpacing: "-0.02em",
                  mb:            3,
                }}
              >
                Convertir la salud preventiva en el activo más rentable de cada empresa mexicana.
              </Typography>
              <Typography sx={{ color: C.textMuted, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.8, maxWidth: 560 }}>
                Somos un equipo de Puebla, México. Construimos hardware propio,
                inteligencia artificial clínica y un dashboard de ROI para que
                cualquier empresa mida y mejore la salud de sus colaboradores desde el día uno.
              </Typography>
            </motion.div>

            {/* Ficha técnica a la derecha */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <Box sx={{ borderTop: `3px solid ${C.primary}`, mt: { xs: 0, md: 1.5 } }}>
                {COMPANY_FACTS.map((f) => (
                  <Box
                    key={f.label}
                    sx={{
                      display:        "flex",
                      alignItems:     "baseline",
                      justifyContent: "space-between",
                      gap:            2,
                      py:             2.5,
                      borderBottom:   `1px solid ${C.border}`,
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: C.textPrimary, fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.3 }}>
                        {f.label}
                      </Typography>
                      <Typography sx={{ color: C.textLight, fontSize: "0.78rem", mt: 0.3 }}>
                        {f.sub}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color:      C.primary,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 900,
                        fontSize:   { xs: "1.9rem", md: "2.2rem" },
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {f.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* ── Trayectoria — línea de tiempo ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display:             "grid",
              gridTemplateColumns: { xs: "1fr", md: "4fr 7fr" },
              gap:                 { xs: 5, md: 10 },
              alignItems:          "flex-start",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
                <SectionLabel>Trayectoria</SectionLabel>
                <Typography
                  component="h2"
                  sx={{
                    color:      C.textPrimary,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 900,
                    fontSize:   { xs: "1.8rem", md: "2.2rem" },
                    lineHeight: 1.15,
                    mb:         2.5,
                  }}
                >
                  Empezamos con una pregunta incómoda
                </Typography>
                <Typography sx={{ color: C.textMuted, fontSize: "0.98rem", lineHeight: 1.8 }}>
                  Vimos que las opciones existentes eran caras, genéricas o simplemente
                  inútiles para el tomador de decisiones. Esta es la historia de cómo
                  lo estamos resolviendo.
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <Box>
                {MILESTONES.map((m, i) => (
                  <motion.div key={`${m.year}-${m.title}`} variants={fadeInUp}>
                    <Box
                      sx={{
                        display:             "grid",
                        gridTemplateColumns: { xs: "56px 1fr", md: "90px 1fr" },
                        gap:                 { xs: 2.5, md: 4 },
                        position:            "relative",
                        pb:                  i < MILESTONES.length - 1 ? { xs: 4.5, md: 5.5 } : 0,
                      }}
                    >
                      {/* Línea vertical */}
                      {i < MILESTONES.length - 1 && (
                        <Box
                          sx={{
                            position: "absolute",
                            left:     { xs: 27, md: 44 },
                            top:      34,
                            bottom:   6,
                            width:    "1px",
                            bgcolor:  C.border,
                          }}
                        />
                      )}

                      {/* Año */}
                      <Box sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            display:      "inline-block",
                            bgcolor:      C.bgMain,
                            border:       `1px solid ${C.borderGreen}`,
                            borderRadius: "8px",
                            px:           { xs: 1, md: 1.5 },
                            py:           0.6,
                            position:     "relative",
                            zIndex:       1,
                          }}
                        >
                          <Typography sx={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: { xs: "0.85rem", md: "1rem" }, lineHeight: 1 }}>
                            {m.year}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Contenido */}
                      <Box>
                        <Typography
                          sx={{
                            color:      C.textPrimary,
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                            fontWeight: 800,
                            fontSize:   { xs: "1.05rem", md: "1.15rem" },
                            lineHeight: 1.3,
                            mb:         1,
                            mt:         0.5,
                          }}
                        >
                          {m.title}
                        </Typography>
                        <Typography sx={{ color: C.textMuted, fontSize: "0.92rem", lineHeight: 1.8 }}>
                          {m.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* ── Misión — pull-quote editorial ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
          >
            <Box sx={{ borderLeft: `3px solid ${C.primary}`, pl: { xs: 3, md: 5 }, py: 1 }}>
              <Typography
                component="blockquote"
                sx={{
                  color:         C.textPrimary,
                  fontFamily:    "Plus Jakarta Sans, sans-serif",
                  fontWeight:    700,
                  fontSize:      { xs: "1.35rem", md: "1.9rem" },
                  lineHeight:    1.45,
                  letterSpacing: "-0.01em",
                  m:             0,
                  mb:            3,
                }}
              >
                Ampliar el acceso a los servicios de nutrición y salud preventiva
                con el servicio más accesible, personalizado y completo del mercado,
                para que nadie quede fuera por restricciones de precio o tiempo.
              </Typography>
              <Typography sx={{ color: C.textLight, fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Nuestra misión
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── El equipo — filas editoriales ── */}
      <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 5, md: 6 }, maxWidth: 620 }}>
            <SectionLabel>El equipo</SectionLabel>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.15, mb: 1.5 }}
            >
              Las personas detrás de NutriiApp
            </Typography>
            <Typography sx={{ color: C.textMuted, fontSize: "1rem", lineHeight: 1.7 }}>
              Un equipo multidisciplinario construyendo desde Puebla, México.
            </Typography>
          </Box>

          <Box
            sx={{
              display:             "grid",
              gridTemplateColumns: { xs: "1fr", md: fotoEquipo ? "5fr 6fr" : "1fr" },
              gap:                 { xs: 5, md: 8 },
              alignItems:          "flex-start",
            }}
          >
            {/* Foto grupal — columna izquierda */}
            {fotoEquipo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
                  <Box
                    sx={{
                      borderRadius: "14px",
                      overflow:     "hidden",
                      border:       `1px solid ${C.border}`,
                      boxShadow:    C.shadowMd,
                      cursor:       "pointer",
                      "&:hover img": { transform: "scale(1.02)" },
                    }}
                    onClick={() => window.open(fotoEquipo, "_blank")}
                  >
                    <Box
                      component="img"
                      src={fotoEquipo}
                      alt="El equipo NutriiApp"
                      sx={{ width: "100%", height: "auto", display: "block", transition: "transform 0.4s ease" }}
                    />
                  </Box>
                  <Typography sx={{ color: C.textLight, fontSize: "0.78rem", mt: 1.5 }}>
                    El equipo NutriiApp · Puebla, México
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Fundadores — filas */}
            {loadingFounders ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ display: "flex", gap: 3, py: 3, borderTop: i > 1 ? `1px solid ${C.border}` : "none" }}>
                    <Skeleton variant="rounded" width={96} height={96} sx={{ borderRadius: "12px", flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="45%" sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="90%" />
                      <Skeleton variant="text" width="70%" />
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
              >
                <Box>
                  {founders.map((f, i) => (
                    <motion.div key={f.id} variants={fadeInUp}>
                      <Box
                        sx={{
                          display:    "flex",
                          gap:        { xs: 2.5, md: 3 },
                          py:         { xs: 3, md: 3.5 },
                          borderTop:  i > 0 ? `1px solid ${C.border}` : "none",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Foto rectangular */}
                        <Box
                          sx={{
                            width:          { xs: 84, md: 104 },
                            height:         { xs: 84, md: 104 },
                            borderRadius:   "12px",
                            overflow:       "hidden",
                            flexShrink:     0,
                            background:     C.heroGrad,
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            cursor:         f.imagen_url ? "pointer" : "default",
                          }}
                          onClick={() => f.imagen_url && window.open(f.imagen_url, "_blank")}
                        >
                          {f.imagen_url ? (
                            <Box
                              component="img"
                              src={f.imagen_url}
                              alt={f.nombre}
                              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
                              {f.initials}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.3 }}>
                            {f.nombre}
                          </Typography>
                          <Typography sx={{ color: C.primary, fontSize: "0.82rem", fontWeight: 700, mb: f.descripcion ? 1 : 0, mt: 0.3 }}>
                            {f.rol}
                          </Typography>
                          {f.descripcion && (
                            <Typography sx={{ color: C.textMuted, fontSize: "0.875rem", lineHeight: 1.7 }}>
                              {f.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Prensa y noticias — índice editorial ── */}
      <Box sx={{ bgcolor: C.bgMain, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: 620 }}>
            <SectionLabel>Prensa y noticias</SectionLabel>
            <Typography
              component="h2"
              sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.15 }}
            >
              Lo último de NutriiApp
            </Typography>
          </Box>

          {loadingNews ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ py: 3, borderTop: `1px solid ${C.border}` }}>
                  <Skeleton variant="text" width="25%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="70%" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" />
                </Box>
              ))}
            </Box>
          ) : news.length === 0 ? (
            <Box sx={{ py: 4, borderTop: `1px solid ${C.border}` }}>
              <Typography sx={{ color: C.textLight, fontSize: "0.95rem" }}>
                Próximamente publicaremos noticias y recursos.
              </Typography>
            </Box>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              <Box>
                {news.map((article, idx) => {
                  const cat = CATEGORY_COLORS[article.categoria] || { bg: "#F3F4F6", color: C.textMuted };
                  const clickable = Boolean(article.fuente_url);
                  return (
                    <motion.div key={article.id ?? idx} variants={fadeInUp}>
                      <Box
                        component={clickable ? "a" : "div"}
                        href={clickable ? article.fuente_url : undefined}
                        target={clickable ? "_blank" : undefined}
                        rel={clickable ? "noopener noreferrer" : undefined}
                        sx={{
                          display:             "grid",
                          gridTemplateColumns: { xs: article.imagen_url ? "1fr 88px" : "1fr", md: article.imagen_url ? "150px 1fr auto 110px" : "150px 1fr auto" },
                          gap:                 { xs: 2, md: 4 },
                          alignItems:          "center",
                          py:                  { xs: 2.5, md: 3 },
                          borderTop:           `1px solid ${C.border}`,
                          textDecoration:      "none",
                          transition:          "background-color 0.2s",
                          px:                  1,
                          mx:                  -1,
                          borderRadius:        "10px",
                          "&:hover":           clickable ? { bgcolor: "rgba(27,94,32,0.03)" } : {},
                          "&:hover .news-arrow": { transform: "translate(2px, -2px)", color: C.primary },
                        }}
                      >
                        {/* Meta: categoría + fecha */}
                        <Box sx={{ display: { xs: "none", md: "block" } }}>
                          <Box sx={{ display: "inline-block", px: 1.25, py: 0.35, borderRadius: "6px", bgcolor: cat.bg, mb: 0.75 }}>
                            <Typography sx={{ color: cat.color, fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {article.categoria}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: C.textLight, fontSize: "0.78rem" }}>
                            {article.fecha_display}
                          </Typography>
                        </Box>

                        {/* Título + extracto */}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: C.textLight, fontSize: "0.72rem", display: { xs: "block", md: "none" }, mb: 0.5 }}>
                            {article.categoria} · {article.fecha_display}
                          </Typography>
                          <Typography
                            sx={{
                              color:      C.textPrimary,
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                              fontWeight: 800,
                              fontSize:   { xs: "0.98rem", md: "1.1rem" },
                              lineHeight: 1.4,
                              mb:         0.5,
                            }}
                          >
                            {article.titulo}
                          </Typography>
                          <Typography sx={{ color: C.textMuted, fontSize: "0.85rem", lineHeight: 1.65 }}>
                            {article.extracto}
                          </Typography>
                          {article.autor && (
                            <Typography sx={{ color: C.textLight, fontSize: "0.75rem", mt: 0.75 }}>
                              {article.autor}
                            </Typography>
                          )}
                        </Box>

                        {/* Flecha */}
                        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
                          {clickable && (
                            <ArrowUpRight
                              className="news-arrow"
                              size={20}
                              color={C.textLight}
                              style={{ transition: "transform 0.2s, color 0.2s" }}
                            />
                          )}
                        </Box>

                        {/* Miniatura */}
                        {article.imagen_url && (
                          <Box
                            component="img"
                            src={article.imagen_url}
                            alt={article.titulo}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            sx={{
                              width:        { xs: 88, md: 110 },
                              height:       { xs: 66, md: 76 },
                              objectFit:    "cover",
                              borderRadius: "10px",
                              border:       `1px solid ${C.border}`,
                              display:      "block",
                            }}
                          />
                        )}
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* ── Reconocimientos ── */}
      {(loadingAwards || awards.length > 0) && (
        <Box sx={{ bgcolor: C.bgAlt, py: { xs: 8, md: 11 }, borderTop: `1px solid ${C.border}` }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: 620 }}>
              <SectionLabel>Reconocimientos</SectionLabel>
              <Typography
                component="h2"
                sx={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 900, fontSize: { xs: "1.9rem", md: "2.4rem" }, lineHeight: 1.15 }}
              >
                Premios y distinciones
              </Typography>
            </Box>

            {loadingAwards ? (
              <Box sx={{ display: "flex", gap: 3, py: 3, borderTop: `1px solid ${C.border}` }}>
                <Skeleton variant="rounded" width={140} height={100} sx={{ borderRadius: "12px", flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="65%" sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="80%" />
                </Box>
              </Box>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <Box>
                  {awards.map((award, i) => (
                    <motion.div key={award.id} variants={fadeInUp}>
                      <Box
                        sx={{
                          display:    "flex",
                          gap:        { xs: 2.5, md: 4 },
                          py:         { xs: 3, md: 3.5 },
                          borderTop:  `1px solid ${i > 0 ? C.border : "rgba(191,144,0,0.35)"}`,
                          alignItems: "flex-start",
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        {/* Imagen o medalla */}
                        {award.imagen_url ? (
                          <Box
                            onClick={() => window.open(award.imagen_url, "_blank")}
                            sx={{
                              width:        { xs: "100%", sm: 200 },
                              borderRadius: "12px",
                              overflow:     "hidden",
                              border:       `1px solid ${C.border}`,
                              flexShrink:   0,
                              cursor:       "pointer",
                              "&:hover img": { transform: "scale(1.03)" },
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
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width:          56,
                              height:         56,
                              borderRadius:   "12px",
                              bgcolor:        C.goldBg,
                              border:         "1px solid rgba(191,144,0,0.3)",
                              display:        "flex",
                              alignItems:     "center",
                              justifyContent: "center",
                              flexShrink:     0,
                            }}
                          >
                            <Award size={24} color={C.gold} />
                          </Box>
                        )}

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
                            <Typography sx={{ color: C.gold, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {award.organizacion}
                            </Typography>
                            {award.fecha_display && (
                              <Typography sx={{ color: C.textLight, fontSize: "0.78rem" }}>
                                · {award.fecha_display}
                              </Typography>
                            )}
                          </Box>
                          <Typography
                            sx={{
                              color:      C.textPrimary,
                              fontFamily: "Plus Jakarta Sans, sans-serif",
                              fontWeight: 800,
                              fontSize:   { xs: "1.1rem", md: "1.3rem" },
                              lineHeight: 1.35,
                              mb:         1.25,
                            }}
                          >
                            {award.nombre}
                          </Typography>
                          {award.descripcion && (
                            <Typography sx={{ color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.75, maxWidth: 640 }}>
                              {award.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </Container>
        </Box>
      )}

      {/* ── CTA — único bloque oscuro de la página ── */}
      <Box
        sx={{
          py:         { xs: 8, md: 10 },
          textAlign:  "center",
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
        </Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
