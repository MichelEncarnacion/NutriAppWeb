// src/pages/RequestDemo.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users, Shield } from "lucide-react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { C } from "../components/landing/landingTokens";
import { useMotionSafe } from "../hooks/useMotionSafe";
import { supabase } from "../lib/supabase";

const COLLABORATOR_RANGES = [
  { value: "20-50",   label: "20 – 50 colaboradores"  },
  { value: "51-150",  label: "51 – 150 colaboradores" },
  { value: "151-500", label: "151 – 500 colaboradores"},
  { value: "+500",    label: "Más de 500 colaboradores"},
];

const TRUST_ITEMS = [
  { Icon: Shield,       text: "Sin compromiso de contrato" },
  { Icon: Clock,        text: "Respuesta en menos de 24 horas" },
  { Icon: Users,        text: "Demo personalizada a tu empresa" },
  { Icon: CheckCircle2, text: "Asesor dedicado sin costo" },
];

const fieldClass = "w-full rounded-[10px] border px-4 py-3 text-[0.95rem] outline-none transition-colors";

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium" style={{ color: C.textMuted }}>{label}</span>
      <input
        {...props}
        className={fieldClass}
        style={{ background: C.bgAlt, borderColor: C.border, color: C.textPrimary }}
        onFocus={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.borderWidth = "2px"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.borderWidth = "1px"; }}
      />
    </label>
  );
}

export default function RequestDemo() {
  const { fadeInUp, stagger } = useMotionSafe();
  const [form, setForm]         = useState({
    nombre:        "",
    empresa:       "",
    cargo:         "",
    email:         "",
    telefono:      "",
    colaboradores: "",
    reto:          "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState(null);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.from("solicitudes_demo").insert({
      nombre:        form.nombre.trim(),
      empresa:       form.empresa.trim(),
      cargo:         form.cargo.trim(),
      email:         form.email.trim(),
      telefono:      form.telefono.trim() || null,
      colaboradores: form.colaboradores,
      reto:          form.reto.trim() || null,
    });
    setLoading(false);
    if (error) { setErrorMsg("Ocurrió un error al enviar. Intenta de nuevo."); return; }
    setSubmitted(true);
  };

  const isValid =
    form.nombre.trim() &&
    form.empresa.trim() &&
    form.cargo.trim() &&
    form.email.trim() &&
    form.colaboradores;

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-[104px] pb-14 text-center md:pt-28 md:pb-[72px]" style={{ background: C.heroGrad }}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05), transparent 50%)" }} />
        <div className="relative z-[1] mx-auto max-w-[600px] px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span
              className="mb-6 inline-block rounded-full px-[18px] py-[5px] text-[0.72rem] font-bold"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Sin costo · Sin compromiso
            </span>
            <h1
              className="mb-4 text-[2rem] font-black leading-[1.15] md:text-[2.7rem]"
              style={{ color: C.white, fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Agenda tu demo
              <br />
              personalizada
            </h1>
            <p className="text-[0.95rem] leading-[1.75] md:text-[1.05rem]" style={{ color: "rgba(255,255,255,0.78)" }}>
              Te mostramos cómo NutriiApp transforma la salud de tus colaboradores
              en productividad medible, adaptado a tu empresa.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Form section ── */}
      <div className="py-14 md:py-20" style={{ background: C.bgAlt }}>
        <div className="mx-auto max-w-[600px] px-4 sm:px-6">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div
                className="rounded-[20px] p-8 text-center md:p-12"
                style={{ background: C.bgCard, border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}
              >
                <div
                  className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full"
                  style={{ background: "#E8F5E9" }}
                >
                  <CheckCircle2 size={32} color={C.primary} />
                </div>
                <p
                  className="mb-3 text-[1.6rem] font-black"
                  style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  ¡Solicitud recibida!
                </p>
                <p className="mb-4 text-base leading-[1.75]" style={{ color: C.textMuted }}>
                  Nuestro equipo revisará tu información y te contactará en menos de{" "}
                  <span className="font-bold" style={{ color: C.primary }}>24 horas</span>{" "}
                  para agendar tu demo personalizada.
                </p>
                <p className="text-[0.85rem]" style={{ color: C.textLight }}>
                  ¿Dudas? Escríbenos a{" "}
                  <span className="font-semibold" style={{ color: C.primary }}>hola@nutriiapp.mx</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <form
                onSubmit={handleSubmit}
                className="rounded-[20px] p-7 md:p-10"
                style={{ background: C.bgCard, border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}
              >
                <motion.div variants={fadeInUp}>
                  <p
                    className="mb-1 text-[1.3rem] font-black"
                    style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    Cuéntanos sobre tu empresa
                  </p>
                  <p className="mb-7 text-[0.875rem]" style={{ color: C.textMuted }}>
                    Completamos la demo en 30 minutos, enfocada en tu industria y tamaño de empresa.
                  </p>
                </motion.div>

                <div className="flex flex-col gap-5">
                  <motion.div variants={fadeInUp}>
                    <Field
                      label="Nombre completo"
                      value={form.nombre}
                      onChange={handleChange("nombre")}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Empresa"
                        value={form.empresa}
                        onChange={handleChange("empresa")}
                        required
                      />
                      <Field
                        label="Cargo"
                        value={form.cargo}
                        onChange={handleChange("cargo")}
                        required
                        placeholder="Director RR.HH., CEO…"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Correo corporativo"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                      />
                      <Field
                        label="Teléfono (opcional)"
                        type="tel"
                        value={form.telefono}
                        onChange={handleChange("telefono")}
                        placeholder="Ej. 222 123 4567"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium" style={{ color: C.textMuted }}>Número de colaboradores</span>
                      <select
                        value={form.colaboradores}
                        onChange={handleChange("colaboradores")}
                        required
                        className={fieldClass}
                        style={{ background: C.bgAlt, borderColor: C.border, color: C.textPrimary }}
                      >
                        <option value="" disabled>Selecciona un rango</option>
                        {COLLABORATOR_RANGES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </label>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium" style={{ color: C.textMuted }}>
                        ¿Cuál es tu mayor reto de bienestar hoy? (opcional)
                      </span>
                      <textarea
                        value={form.reto}
                        onChange={handleChange("reto")}
                        rows={3}
                        placeholder="Ausentismo elevado, cumplimiento NOM, estrés laboral, productividad…"
                        className={fieldClass}
                        style={{ background: C.bgAlt, borderColor: C.border, color: C.textPrimary, resize: "vertical" }}
                      />
                    </label>
                  </motion.div>

                  {errorMsg && (
                    <div className="rounded-[10px] px-4 py-3" style={{ background: "rgba(214,69,69,.08)", border: "1px solid rgba(214,69,69,.3)" }}>
                      <p className="text-[0.85rem]" style={{ color: "#D64545" }}>{errorMsg}</p>
                    </div>
                  )}

                  <motion.div variants={fadeInUp}>
                    <button
                      type="submit"
                      disabled={!isValid || loading}
                      className="mt-0.5 w-full rounded-xl py-[14px] text-base font-extrabold transition-colors disabled:cursor-not-allowed"
                      style={
                        !isValid || loading
                          ? { background: C.border, color: C.textLight }
                          : { background: C.primary, color: C.white }
                      }
                      onMouseEnter={(e) => { if (isValid && !loading) e.currentTarget.style.background = C.secondary; }}
                      onMouseLeave={(e) => { if (isValid && !loading) e.currentTarget.style.background = C.primary; }}
                    >
                      {loading ? "Enviando…" : "Quiero mi demo personalizada"}
                    </button>
                  </motion.div>
                </div>
              </form>

              {/* Trust band */}
              <motion.div variants={fadeInUp}>
                <div className="mt-6 flex flex-wrap justify-center gap-3 py-4 md:gap-6">
                  {TRUST_ITEMS.map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={14} color={C.primary} />
                      <span className="text-[0.8rem] font-semibold" style={{ color: C.textMuted }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
