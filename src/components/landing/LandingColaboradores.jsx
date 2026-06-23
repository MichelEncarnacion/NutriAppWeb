// src/components/landing/LandingColaboradores.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, BadgeCheck, X, IdCard } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { C, fadeInUp, stagger } from "./landingTokens";

export default function LandingColaboradores() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [seleccion,  setSeleccion]  = useState(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("colaboradores")
      .select("*")
      .eq("publicado", true)
      .order("orden", { ascending: true })
      .then(({ data }) => {
        if (active) {
          setItems(data ?? []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <div className="py-16 md:py-24" style={{ background: C.bgAlt }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2
            className="mb-4 text-[1.9rem] font-black leading-[1.2] md:text-[2.4rem]"
            style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Colaboradores en bienestar emocional
          </h2>
          <p className="mx-auto max-w-[640px] text-base leading-[1.75]" style={{ color: C.textMuted }}>
            Psicólogos y centros terapéuticos aliados que ofrecen descuentos exclusivos a la comunidad NutriiApp.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-sm" style={{ color: C.textMuted }}>Cargando…</div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {items.map((c) => (
              <motion.div
                key={c.id}
                variants={fadeInUp}
                onClick={() => setSeleccion(c)}
                className="flex flex-col rounded-2xl overflow-hidden bg-white cursor-pointer transition-shadow hover:shadow-lg"
                style={{ border: `1px solid ${C.border}`, boxShadow: C.shadow }}
              >
                {c.foto_url ? (
                  <img
                    src={c.foto_url}
                    alt={c.nombre}
                    className="h-40 w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div
                    className="h-40 w-full flex items-center justify-center"
                    style={{ background: "#E8F5E9" }}
                  >
                    <span className="text-4xl font-black" style={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {c.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-1 text-[1.05rem] font-extrabold" style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {c.nombre}
                  </p>
                  {c.enfoque && (
                    <p className="mb-3 text-[0.8rem] font-semibold" style={{ color: C.primary }}>
                      {c.enfoque}
                    </p>
                  )}

                  {c.ubicacion && (
                    <div className="mb-2 flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 flex-shrink-0" style={{ color: C.textLight }} />
                      <p className="text-[0.8rem] leading-[1.6]" style={{ color: C.textMuted }}>{c.ubicacion}</p>
                    </div>
                  )}

                  {c.tipo_terapias && (
                    <p className="mb-3 text-[0.8rem] leading-[1.6]" style={{ color: C.textMuted }}>
                      {c.tipo_terapias}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <BadgeCheck size={16} style={{ color: C.gold }} />
                    <span className="text-[0.85rem] font-bold" style={{ color: C.gold }}>
                      {Math.round((c.descuento ?? 0) * 100)}% de descuento para tu comunidad
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Modal de detalle ───────────────────────────────────── */}
      <AnimatePresence>
        {seleccion && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSeleccion(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
              onClick={() => setSeleccion(null)}
            >
              <div
                className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white"
                style={{ boxShadow: C.shadowLg }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  {seleccion.foto_url ? (
                    <img
                      src={seleccion.foto_url}
                      alt={seleccion.nombre}
                      className="h-48 w-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center" style={{ background: "#E8F5E9" }}>
                      <span className="text-5xl font-black" style={{ color: C.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {seleccion.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setSeleccion(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 hover:bg-white transition-colors"
                    style={{ boxShadow: C.shadow }}
                  >
                    <X size={16} style={{ color: C.textPrimary }} />
                  </button>
                </div>

                <div className="p-6">
                  <p className="mb-1 text-[1.2rem] font-extrabold" style={{ color: C.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {seleccion.nombre}
                  </p>
                  {seleccion.enfoque && (
                    <p className="mb-4 text-[0.85rem] font-semibold" style={{ color: C.primary }}>
                      {seleccion.enfoque}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 mb-4">
                    {seleccion.ubicacion && (
                      <div className="flex items-start gap-2.5">
                        <MapPin size={17} className="mt-0.5 flex-shrink-0" style={{ color: C.textLight }} />
                        <p className="text-[0.85rem] leading-[1.6]" style={{ color: C.textMuted }}>{seleccion.ubicacion}</p>
                      </div>
                    )}
                    {seleccion.cedula && (
                      <div className="flex items-start gap-2.5">
                        <IdCard size={17} className="mt-0.5 flex-shrink-0" style={{ color: C.textLight }} />
                        <p className="text-[0.85rem] leading-[1.6]" style={{ color: C.textMuted }}>Cédula profesional: {seleccion.cedula}</p>
                      </div>
                    )}
                    {seleccion.tipo_terapias && (
                      <div className="flex items-start gap-2.5">
                        <BadgeCheck size={17} className="mt-0.5 flex-shrink-0" style={{ color: C.textLight }} />
                        <p className="text-[0.85rem] leading-[1.6]" style={{ color: C.textMuted }}>{seleccion.tipo_terapias}</p>
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: C.goldBg, border: `1px solid rgba(191,144,0,0.25)` }}
                  >
                    <p className="text-[0.95rem] font-bold" style={{ color: C.gold }}>
                      {Math.round((seleccion.descuento ?? 0) * 100)}% de descuento para la comunidad NutriiApp
                    </p>
                    <p className="mt-1 text-[0.75rem]" style={{ color: C.textMuted }}>
                      Menciona que vienes de NutriiApp al agendar tu cita para aplicar el descuento.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
