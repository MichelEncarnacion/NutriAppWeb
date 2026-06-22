// src/pages/AboutUs.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C } from "../components/landing/landingTokens";
import { useMotionSafe } from "../hooks/useMotionSafe";
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
    <div className="mb-4 flex items-center gap-3">
      <span className="block h-0.5 w-7" style={{ background: C.primary }} />
      <span className="text-[0.75rem] font-bold uppercase" style={{ color: C.primary, letterSpacing: "0.14em" }}>
        {children}
      </span>
    </div>
  );
}

function Skeleton({ width = "100%", height = 16, rounded = "4px", className = "" }) {
  return (
    <div
      className={`animate-pulse bg-[rgba(0,0,0,0.08)] ${className}`}
      style={{ width, height, borderRadius: rounded }}
    />
  );
}

export default function AboutUs() {
  const navigate = useNavigate();
  const { fadeInUp, stagger } = useMotionSafe();
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
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* ── Hero editorial — claro, asimétrico ── */}
      <div className="pt-[120px] pb-14 md:pt-[152px] md:pb-20" style={{ background: C.bgMain }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[7fr_4fr] md:gap-20">
            {/* Titular a la izquierda */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <SectionLabel>Nosotros</SectionLabel>
              <h1
                className="mb-6 text-[2.4rem] font-black leading-[1.08] tracking-[-0.02em] md:text-[3.4rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Convertir la salud preventiva en el activo más rentable de cada empresa mexicana.
              </h1>
              <p className="max-w-[560px] text-base leading-[1.8] md:text-[1.1rem]" style={{ color: C.textMuted }}>
                Somos un equipo de Puebla, México. Construimos hardware propio,
                inteligencia artificial clínica y un dashboard de ROI para que
                cualquier empresa mida y mejore la salud de sus colaboradores desde el día uno.
              </p>
            </motion.div>

            {/* Ficha técnica a la derecha */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <div className="mt-0 md:mt-3" style={{ borderTop: `3px solid ${C.primary}` }}>
                {COMPANY_FACTS.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline justify-between gap-4 py-5"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div>
                      <p className="text-[0.9rem] font-bold leading-[1.3]" style={{ color: C.textPrimary }}>
                        {f.label}
                      </p>
                      <p className="mt-1 text-[0.78rem]" style={{ color: C.textLight }}>
                        {f.sub}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[1.9rem] font-black leading-none md:text-[2.2rem]"
                      style={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Trayectoria — línea de tiempo ── */}
      <div className="py-16 md:py-[88px]" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[4fr_7fr] md:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="md:sticky md:top-[100px]">
                <SectionLabel>Trayectoria</SectionLabel>
                <h2
                  className="mb-5 text-[1.8rem] font-black leading-[1.15] md:text-[2.2rem]"
                  style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Empezamos con una pregunta incómoda
                </h2>
                <p className="text-[0.98rem] leading-[1.8]" style={{ color: C.textMuted }}>
                  Vimos que las opciones existentes eran caras, genéricas o simplemente
                  inútiles para el tomador de decisiones. Esta es la historia de cómo
                  lo estamos resolviendo.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div>
                {MILESTONES.map((m, i) => (
                  <motion.div key={`${m.year}-${m.title}`} variants={fadeInUp}>
                    <div
                      className="relative grid grid-cols-[56px_1fr] gap-[10px] md:grid-cols-[90px_1fr] md:gap-8"
                      style={{ paddingBottom: i < MILESTONES.length - 1 ? 36 : 0 }}
                    >
                      {/* Línea vertical */}
                      {i < MILESTONES.length - 1 && (
                        <div
                          className="absolute left-[27px] top-[34px] bottom-1.5 w-px md:left-11"
                          style={{ background: C.border }}
                        />
                      )}

                      {/* Año */}
                      <div className="text-center">
                        <div
                          className="relative z-[1] inline-block rounded-lg px-2.5 py-[5px] md:px-3"
                          style={{ background: C.bgMain, border: `1px solid ${C.borderGreen}` }}
                        >
                          <span
                            className="text-[0.85rem] font-extrabold leading-none md:text-base"
                            style={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                          >
                            {m.year}
                          </span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div>
                        <p
                          className="mt-1 mb-2 text-[1.05rem] font-extrabold leading-[1.3] md:text-[1.15rem]"
                          style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                        >
                          {m.title}
                        </p>
                        <p className="text-[0.92rem] leading-[1.8]" style={{ color: C.textMuted }}>
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Misión — pull-quote editorial ── */}
      <div className="py-16 md:py-24" style={{ background: C.bgMain }}>
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55 }}
          >
            <div className="py-1 pl-6 md:pl-10" style={{ borderLeft: `3px solid ${C.primary}` }}>
              <blockquote
                className="m-0 mb-4 text-[1.35rem] font-bold leading-[1.45] tracking-[-0.01em] md:text-[1.9rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Ampliar el acceso a los servicios de nutrición y salud preventiva
                con el servicio más accesible, personalizado y completo del mercado,
                para que nadie quede fuera por restricciones de precio o tiempo.
              </blockquote>
              <p className="text-[0.82rem] font-bold uppercase" style={{ color: C.textLight, letterSpacing: "0.12em" }}>
                Nuestra misión
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── El equipo — filas editoriales ── */}
      <div className="py-16 md:py-[88px]" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-10 max-w-[620px] md:mb-12">
            <SectionLabel>El equipo</SectionLabel>
            <h2
              className="mb-3 text-[1.9rem] font-black leading-[1.15] md:text-[2.4rem]"
              style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Las personas detrás de NutriiApp
            </h2>
            <p className="text-base leading-[1.7]" style={{ color: C.textMuted }}>
              Un equipo multidisciplinario construyendo desde Puebla, México.
            </p>
          </div>

          <div>
            <div className={`grid grid-cols-1 items-start gap-10 md:gap-16 ${fotoEquipo ? "md:grid-cols-[5fr_6fr]" : "md:grid-cols-1"}`}>
              {/* Foto grupal — columna izquierda */}
              {fotoEquipo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="md:sticky md:top-[100px]">
                    <div
                      className="group cursor-pointer overflow-hidden rounded-[14px]"
                      style={{ border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}
                      onClick={() => window.open(fotoEquipo, "_blank")}
                    >
                      <img
                        src={fotoEquipo}
                        alt="El equipo NutriiApp"
                        className="block w-full transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
                      />
                    </div>
                    <p className="mt-3 text-[0.78rem]" style={{ color: C.textLight }}>
                      El equipo NutriiApp · Puebla, México
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Fundadores — filas */}
              {loadingFounders ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-6 py-6" style={{ borderTop: i > 1 ? `1px solid ${C.border}` : "none" }}>
                      <Skeleton width={96} height={96} rounded="12px" className="flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton width="45%" className="mb-2" />
                        <Skeleton width="30%" className="mb-2" />
                        <Skeleton width="90%" className="mb-1" />
                        <Skeleton width="70%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <div>
                    {founders.map((f, i) => (
                      <motion.div key={f.id} variants={fadeInUp}>
                        <div
                          className="flex items-start gap-6 py-6 md:py-7"
                          style={{ borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}
                        >
                          {/* Foto rectangular */}
                          <div
                            className="flex h-[84px] w-[84px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl md:h-[104px] md:w-[104px]"
                            style={{ background: C.heroGrad, cursor: f.imagen_url ? "pointer" : "default" }}
                            onClick={() => f.imagen_url && window.open(f.imagen_url, "_blank")}
                          >
                            {f.imagen_url ? (
                              <img
                                src={f.imagen_url}
                                alt={f.nombre}
                                className="block h-full w-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <span
                                className="text-[1.8rem] font-black leading-none"
                                style={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                              >
                                {f.initials}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="text-[1.05rem] font-extrabold leading-[1.3]"
                              style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                            >
                              {f.nombre}
                            </p>
                            <p
                              className="mt-1 text-[0.82rem] font-bold"
                              style={{ color: C.primary, marginBottom: f.descripcion ? 8 : 0 }}
                            >
                              {f.rol}
                            </p>
                            {f.descripcion && (
                              <p className="text-[0.875rem] leading-[1.7]" style={{ color: C.textMuted }}>
                                {f.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Prensa y noticias — índice editorial ── */}
      <div className="py-16 md:py-[88px]" style={{ background: C.bgMain, borderTop: `1px solid ${C.border}` }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 max-w-[620px] md:mb-10">
            <SectionLabel>Prensa y noticias</SectionLabel>
            <h2
              className="text-[1.9rem] font-black leading-[1.15] md:text-[2.4rem]"
              style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Lo último de NutriiApp
            </h2>
          </div>

          {loadingNews ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-6" style={{ borderTop: `1px solid ${C.border}` }}>
                  <Skeleton width="25%" className="mb-2" />
                  <Skeleton width="70%" className="mb-2" />
                  <Skeleton width="50%" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="py-8" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-[0.95rem]" style={{ color: C.textLight }}>
                Próximamente publicaremos noticias y recursos.
              </p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              <div>
                {news.map((article, idx) => {
                  const cat = CATEGORY_COLORS[article.categoria] || { bg: "#F3F4F6", color: C.textMuted };
                  const clickable = Boolean(article.fuente_url);
                  const Tag = clickable ? "a" : "div";
                  return (
                    <motion.div key={article.id ?? idx} variants={fadeInUp}>
                      <Tag
                        href={clickable ? article.fuente_url : undefined}
                        target={clickable ? "_blank" : undefined}
                        rel={clickable ? "noopener noreferrer" : undefined}
                        className="group -mx-1 grid items-center gap-4 rounded-[10px] px-1 py-5 no-underline transition-colors duration-200 md:gap-8 md:py-6"
                        style={{
                          gridTemplateColumns: article.imagen_url ? "1fr 88px" : "1fr",
                          borderTop:           `1px solid ${C.border}`,
                        }}
                        onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = "rgba(27,94,32,0.03)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div
                          className="contents md:grid md:items-center md:gap-8"
                          style={{ gridTemplateColumns: article.imagen_url ? "150px 1fr auto 110px" : "150px 1fr auto" }}
                        >
                          {/* Meta: categoría + fecha */}
                          <div className="hidden md:block">
                            <div className="mb-2 inline-block rounded-md px-[10px] py-[3px]" style={{ background: cat.bg }}>
                              <span className="text-[0.66rem] font-bold uppercase" style={{ color: cat.color, letterSpacing: "0.06em" }}>
                                {article.categoria}
                              </span>
                            </div>
                            <p className="text-[0.78rem]" style={{ color: C.textLight }}>
                              {article.fecha_display}
                            </p>
                          </div>

                          {/* Título + extracto */}
                          <div className="min-w-0">
                            <p className="mb-1 text-[0.72rem] md:hidden" style={{ color: C.textLight }}>
                              {article.categoria} · {article.fecha_display}
                            </p>
                            <p
                              className="mb-1 text-[0.98rem] font-extrabold leading-[1.4] md:text-[1.1rem]"
                              style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                            >
                              {article.titulo}
                            </p>
                            <p className="text-[0.85rem] leading-[1.65]" style={{ color: C.textMuted }}>
                              {article.extracto}
                            </p>
                            {article.autor && (
                              <p className="mt-2 text-[0.75rem]" style={{ color: C.textLight }}>
                                {article.autor}
                              </p>
                            )}
                          </div>

                          {/* Flecha */}
                          <div className="hidden justify-end md:flex">
                            {clickable && (
                              <ArrowUpRight
                                size={20}
                                color={C.textLight}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />
                            )}
                          </div>

                          {/* Miniatura */}
                          {article.imagen_url && (
                            <img
                              src={article.imagen_url}
                              alt={article.titulo}
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                              className="block h-[66px] w-[88px] rounded-[10px] object-cover md:h-[76px] md:w-[110px]"
                              style={{ border: `1px solid ${C.border}` }}
                            />
                          )}
                        </div>
                      </Tag>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Reconocimientos ── */}
      {(loadingAwards || awards.length > 0) && (
        <div className="py-16 md:py-[88px]" style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}` }}>
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="mb-8 max-w-[620px] md:mb-10">
              <SectionLabel>Reconocimientos</SectionLabel>
              <h2
                className="text-[1.9rem] font-black leading-[1.15] md:text-[2.4rem]"
                style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Premios y distinciones
              </h2>
            </div>

            {loadingAwards ? (
              <div className="flex gap-6 py-6" style={{ borderTop: `1px solid ${C.border}` }}>
                <Skeleton width={140} height={100} rounded="12px" className="flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton width="30%" className="mb-2" />
                  <Skeleton width="65%" className="mb-2" />
                  <Skeleton width="80%" />
                </div>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <div>
                  {awards.map((award, i) => (
                    <motion.div key={award.id} variants={fadeInUp}>
                      <div
                        className="flex flex-col items-start gap-6 py-6 sm:flex-row md:gap-8 md:py-7"
                        style={{ borderTop: `1px solid ${i > 0 ? C.border : "rgba(191,144,0,0.35)"}` }}
                      >
                        {/* Imagen o medalla */}
                        {award.imagen_url ? (
                          <div
                            onClick={() => window.open(award.imagen_url, "_blank")}
                            className="group w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-xl sm:w-[200px]"
                            style={{ border: `1px solid ${C.border}` }}
                          >
                            <img
                              src={award.imagen_url}
                              alt={award.nombre}
                              loading="lazy"
                              onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                              className="block w-full transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
                            />
                          </div>
                        ) : (
                          <div
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ background: C.goldBg, border: "1px solid rgba(191,144,0,0.3)" }}
                          >
                            <Award size={24} color={C.gold} />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <span className="text-[0.75rem] font-bold uppercase" style={{ color: C.gold, letterSpacing: "0.1em" }}>
                              {award.organizacion}
                            </span>
                            {award.fecha_display && (
                              <span className="text-[0.78rem]" style={{ color: C.textLight }}>
                                · {award.fecha_display}
                              </span>
                            )}
                          </div>
                          <p
                            className="mb-3 text-[1.1rem] font-extrabold leading-[1.35] md:text-[1.3rem]"
                            style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                          >
                            {award.nombre}
                          </p>
                          {award.descripcion && (
                            <p className="max-w-[640px] text-[0.9rem] leading-[1.75]" style={{ color: C.textMuted }}>
                              {award.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── CTA — único bloque oscuro de la página ── */}
      <div className="relative overflow-hidden py-16 text-center md:py-20" style={{ background: C.heroGrad }}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 70%, rgba(255,255,255,0.05), transparent 50%)" }} />
        <div className="relative z-[1] mx-auto max-w-[600px] px-4 sm:px-6">
          <p
            className="mb-4 text-[1.7rem] font-black leading-[1.25] md:text-[2.1rem]"
            style={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            ¿Quieres conocernos mejor?
          </p>
          <p className="mb-8 text-base leading-[1.7]" style={{ color: "rgba(255,255,255,0.78)" }}>
            Agenda una demo y te mostramos cómo NutriiApp puede transformar la salud de tu empresa.
          </p>
          <button
            onClick={() => navigate("/demo")}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-[14px] text-base font-extrabold transition-shadow"
            style={{ background: C.white, color: C.primary, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F0FFF4"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,0,0,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.white; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)"; }}
          >
            Solicitar demo
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
