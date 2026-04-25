// src/pages/MiPlan.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useActivePlan } from "../hooks/useActivePlan"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../lib/supabase"
import Layout from "../components/Layout"

const TIPO_COLOR = {
  desayuno:    { border: "#F0A500", label: "Desayuno" },
  colacion_am: { border: "#A855F7", label: "Colación AM" },
  comida:      { border: "#3DDC84", label: "Comida" },
  colacion_pm: { border: "#A855F7", label: "Colación PM" },
  cena:        { border: "#58A6FF", label: "Cena" },
}

export default function MiPlan() {
  const { plan, planId, fechaInicio, fechaFin, diaActual, stuckGenerating, isLoading, error, refetch } = useActivePlan()
  const { esPremium, session } = useAuth()
  const [diaOffset, setDiaOffset] = useState(null) // null = use diaActual from hook
  const navigate = useNavigate()

  const dia = diaOffset ?? diaActual
  const comidasDelDia = plan?.dias?.[dia - 1]?.comidas ?? []
  const kcalTotal = plan?.dias?.[dia - 1]?.kcal_total ?? 0

  const [feedback, setFeedback] = useState(null)  // null=cargando, false=no existe, object=ya enviado
  const [feedbackForm, setFeedbackForm] = useState({ estrellas: 0, comentario: "" })
  const [enviandoFeedback, setEnviandoFeedback] = useState(false)

  useEffect(() => {
    if (!planId || !session?.user?.id) return
    supabase
      .from('plan_feedback')
      .select('id, estrellas')
      .eq('plan_id', planId)
      .eq('perfil_id', session.user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setFeedback(data ?? false))
  }, [planId, session?.user?.id])

  const enviarFeedback = async () => {
    if (feedbackForm.estrellas === 0 || !planId) return
    setEnviandoFeedback(true)
    const { error } = await supabase.from('plan_feedback').insert({
      plan_id: planId,
      perfil_id: session.user.id,
      estrellas: feedbackForm.estrellas,
      comentario: feedbackForm.comentario.trim() || null,
    })
    if (!error) setFeedback({ estrellas: feedbackForm.estrellas })
    setEnviandoFeedback(false)
  }

  // Detectar plan vencido: fecha_fin ya pasó
  const planVencido = fechaFin
    ? new Date(fechaFin + "T23:59:59") < new Date()
    : false

  const irARegenerar = () => navigate("/generando-plan", { state: { regenerar: true } })

  const fechaDia = (() => {
    if (!fechaInicio) return "";
    const [y, m, d] = fechaInicio.split("-").map(Number);
    const date = new Date(y, m - 1, d + (dia - 1));
    return date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  })()

  const irAnterior = () => setDiaOffset(Math.max(1, dia - 1))
  const irSiguiente = () => setDiaOffset(Math.min(15, dia + 1))

  if (isLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#3DDC84] border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-[#FF6B6B] text-sm">Error al cargar tu plan</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-[#161B22] border border-[#2D3748] text-white text-sm rounded-xl hover:border-[#3DDC84] transition-all"
        >
          Reintentar
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-white text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
            <p className="text-[#7D8590] text-xs">
              {plan && fechaFin
                ? planVencido
                  ? `Venció el ${new Date(fechaFin).toLocaleDateString("es-MX")}`
                  : `Vigente hasta ${new Date(fechaFin).toLocaleDateString("es-MX")} · ${plan.dias?.length ?? 15} días`
                : isLoading ? "Cargando plan..." : "Sin plan activo"}
            </p>
          </div>
          {plan && !planVencido && (
            esPremium ? (
              <button
                onClick={irARegenerar}
                className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                style={{ background: "rgba(88,166,255,0.1)", color: "#58A6FF", border: "1px solid rgba(88,166,255,0.2)" }}
              >
                Actualizar plan
              </button>
            ) : (
              <span
                className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: "rgba(240,165,0,0.08)", color: "#F0A500", border: "1px solid rgba(240,165,0,0.2)" }}
              >
                🔒 Solo Premium
              </span>
            )
          )}
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <div className={`bg-[#161B22] rounded-2xl p-8 text-center flex flex-col items-center gap-4 border ${stuckGenerating ? "border-[rgba(240,165,0,0.3)]" : "border-[#2D3748]"}`}>
            <span className="text-4xl">{stuckGenerating ? "⏳" : "🥗"}</span>
            <div>
              <p className="text-white font-bold font-display mb-1">
                {stuckGenerating ? "Tu plan tardó demasiado en generarse" : "Aún no tienes un plan activo"}
              </p>
              <p className="text-[#7D8590] text-sm">
                {stuckGenerating
                  ? "Hubo un problema durante la generación. Puedes intentarlo de nuevo sin perder tu diagnóstico."
                  : "Completa tu diagnóstico para generar tu plan nutricional"}
              </p>
            </div>
            <button
              onClick={() => navigate(stuckGenerating ? "/generando-plan" : "/diagnostico", {
                state: stuckGenerating ? { regenerar: true } : undefined,
              })}
              className="px-6 py-2.5 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
            >
              {stuckGenerating ? "Reintentar generación →" : "Generar mi plan"}
            </button>
          </div>
        ) : planVencido ? (
          /* ── Plan vencido ── */
          <div className="bg-[#161B22] border border-[rgba(240,165,0,0.25)] rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <span className="text-4xl">📅</span>
            <div>
              <p className="text-white font-bold font-display mb-1">Tu plan nutricional ha concluido</p>
              <p className="text-[#7D8590] text-sm leading-relaxed">
                Tu plan de 15 días venció el{" "}
                <strong className="text-[#F0A500]">{new Date(fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</strong>.
                {esPremium
                  ? " Genera uno nuevo para continuar con tu alimentación."
                  : " Actualiza a Premium para generar planes ilimitados."}
              </p>
            </div>
            {esPremium ? (
              <button
                onClick={irARegenerar}
                className="px-6 py-2.5 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
              >
                Generar nuevo plan →
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#7D8590]">🔒 Función exclusiva Premium</span>
                <button
                  onClick={() => navigate("/panel?upgrade=true")}
                  className="px-6 py-2.5 font-bold font-display rounded-xl transition-all text-sm"
                  style={{ background: "rgba(240,165,0,0.12)", color: "#F0A500", border: "1px solid rgba(240,165,0,0.25)" }}
                >
                  Ver planes Premium →
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Mini day bar ── */}
            <div className="flex gap-1.5 justify-center flex-wrap px-1">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiaOffset(d)}
                  title={`Día ${d}`}
                  className="transition-all"
                  style={{
                    width: 12, height: 12,
                    borderRadius: "50%",
                    background: d === dia ? "#3DDC84" : d < dia ? "rgba(61,220,132,.35)" : "#2D3748",
                    transform: d === dia ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* ── Banner Día 15 ── */}
            {diaActual === 15 && (
              <div
                className="rounded-2xl p-5 flex flex-col items-center text-center gap-3"
                style={{
                  background: "linear-gradient(135deg, rgba(61,220,132,0.1), rgba(88,166,255,0.07))",
                  border: "1px solid rgba(61,220,132,0.3)",
                }}
              >
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="text-white font-black font-display text-base leading-tight">
                    ¡Plan de 15 días completado!
                  </p>
                  <p className="text-[#7D8590] text-xs mt-1">
                    {esPremium
                      ? "Genera un nuevo plan cuando estés listo."
                      : "Completa tu seguimiento para continuar."}
                  </p>
                </div>
                <button
                  onClick={() => navigate(esPremium ? "/diagnostico" : "/seguimiento")}
                  className="px-5 py-2 rounded-xl font-bold font-display text-sm transition-all"
                  style={{ background: "#3DDC84", color: "#0D1117" }}
                >
                  {esPremium ? "Nuevo plan →" : "Completar seguimiento →"}
                </button>
              </div>
            )}

            {/* ── Day navigator ── */}
            <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-4 flex items-center justify-between">
              <button
                onClick={irAnterior}
                disabled={dia === 1}
                className="w-10 h-10 rounded-xl border border-[#2D3748] flex items-center justify-center text-white text-xl hover:border-[#3DDC84] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Día anterior"
              >
                ‹
              </button>

              <div className="text-center">
                <p className="text-[#3DDC84] font-black font-display text-lg">Día {dia} de 15</p>
                <p className="text-[#7D8590] text-xs capitalize">{fechaDia}</p>
              </div>

              <button
                onClick={irSiguiente}
                disabled={dia === 15}
                className="w-10 h-10 rounded-xl border border-[#2D3748] flex items-center justify-center text-white text-xl hover:border-[#3DDC84] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Día siguiente"
              >
                ›
              </button>
            </div>

            {/* ── Meals list ── */}
            <div className="flex flex-col gap-3">
              {comidasDelDia.map((c, idx) => {
                const tc = TIPO_COLOR[c.tipo] ?? TIPO_COLOR.comida
                return (
                  <div
                    key={idx}
                    className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-4"
                    style={{ borderLeftColor: tc.border, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold tracking-widest" style={{ color: tc.border }}>
                            {tc.label.toUpperCase()}
                          </span>
                          {c.hora_sugerida && (
                            <span className="text-[10px] text-[#7D8590]">{c.hora_sugerida} hrs</span>
                          )}
                        </div>
                        <p className="text-white font-semibold text-sm leading-tight">{c.nombre}</p>
                        {c.descripcion && (
                          <p className="text-[#7D8590] text-xs mt-1 leading-relaxed">{c.descripcion}</p>
                        )}
                        <p className="text-[#7D8590] text-xs mt-2">
                          {c.proteina_g}g prot · {c.carbos_g}g carbs · {c.grasas_g}g grasas
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#3DDC84] font-black font-display text-base">{c.kcal}</p>
                        <p className="text-[#7D8590] text-xs">kcal</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Day total + macros ── */}
            {comidasDelDia.length > 0 && (() => {
              const macros = comidasDelDia.reduce(
                (acc, c) => ({
                  prot: acc.prot + (c.proteina_g ?? 0),
                  carbs: acc.carbs + (c.carbos_g ?? 0),
                  grasas: acc.grasas + (c.grasas_g ?? 0),
                }),
                { prot: 0, carbs: 0, grasas: 0 }
              );
              return (
                <>
                  <div className="bg-[rgba(61,220,132,.06)] border border-[rgba(61,220,132,.18)] rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm text-[#7D8590]">Total del día {dia}</span>
                    <span className="font-display font-black text-[#3DDC84] text-lg">{kcalTotal} kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Proteína", value: macros.prot, color: "#58A6FF" },
                      { label: "Carbos", value: macros.carbs, color: "#F0A500" },
                      { label: "Grasas", value: macros.grasas, color: "#A855F7" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-center">
                        <p className="font-display font-black text-lg" style={{ color }}>{value}g</p>
                        <p className="text-[10px] text-[#7D8590] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* ── Card de Feedback ── */}
        {plan && feedback !== null && (
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: "#161B22", border: "1px solid #2D3748" }}
          >
            {feedback === false ? (
              <>
                <div>
                  <p className="text-white font-bold font-display text-sm">¿Qué tal tu plan nutricional?</p>
                  <p className="text-[#7D8590] text-xs mt-0.5">Tu opinión nos ayuda a mejorar la IA.</p>
                </div>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFeedbackForm(f => ({ ...f, estrellas: n }))}
                      className="text-2xl transition-transform hover:scale-110"
                      style={{ opacity: feedbackForm.estrellas >= n ? 1 : 0.3 }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>

                {feedbackForm.estrellas > 0 && (
                  <textarea
                    placeholder="¿Qué mejorarías? (opcional)"
                    value={feedbackForm.comentario}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, comentario: e.target.value }))}
                    rows={2}
                    className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm w-full outline-none focus:border-[#3DDC84] transition-colors resize-none"
                  />
                )}

                <button
                  onClick={enviarFeedback}
                  disabled={feedbackForm.estrellas === 0 || enviandoFeedback}
                  className="py-2.5 rounded-xl font-bold font-display text-sm transition-all disabled:opacity-40"
                  style={{ background: "#3DDC84", color: "#0D1117" }}
                >
                  {enviandoFeedback ? "Enviando..." : "Enviar feedback"}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-white font-bold text-sm font-display">¡Gracias por tu feedback!</p>
                  <p className="text-[#7D8590] text-xs mt-0.5">
                    {"⭐".repeat(feedback?.estrellas ?? 0)} — Nos ayuda a mejorar tu próximo plan.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
