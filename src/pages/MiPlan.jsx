// src/pages/MiPlan.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useActivePlan } from "../hooks/useActivePlan"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../lib/supabase"
import Layout from "../components/Layout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import Input from "../components/ui/Input"

const TIPO_COLOR = {
  desayuno:    { border: "#BF9000", label: "Desayuno" },
  colacion_am: { border: "#7C3AED", label: "Colación AM" },
  comida:      { border: "#1B5E20", label: "Comida" },
  colacion_pm: { border: "#7C3AED", label: "Colación PM" },
  cena:        { border: "#2563EB", label: "Cena" },
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
      .catch(() => setFeedback(false))
  }, [planId, session?.user?.id])

  const enviarFeedback = async () => {
    if (feedbackForm.estrellas === 0 || !planId) return
    setEnviandoFeedback(true)
    try {
      const { error } = await supabase.from('plan_feedback').insert({
        plan_id: planId,
        perfil_id: session.user.id,
        estrellas: feedbackForm.estrellas,
        comentario: feedbackForm.comentario.trim() || null,
      })
      if (!error) setFeedback({ estrellas: feedbackForm.estrellas })
    } catch {
      // Prevent unhandled promise rejection
    } finally {
      setEnviandoFeedback(false)
    }
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
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-[#D64545] text-sm">Error al cargar tu plan</p>
        <Button variant="secondary" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-2xl">

        {/* Page header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-text-primary text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
            <p className="text-[#4A5568] text-xs">
              {plan && fechaFin
                ? planVencido
                  ? `Venció el ${new Date(fechaFin).toLocaleDateString("es-MX")}`
                  : `Vigente hasta ${new Date(fechaFin).toLocaleDateString("es-MX")} · ${plan.dias?.length ?? 15} días`
                : isLoading ? "Cargando plan..." : "Sin plan activo"}
            </p>
          </div>
          {plan && !planVencido && (
            esPremium ? (
              <Button variant="secondary" size="sm" className="flex-shrink-0" onClick={irARegenerar}>
                Actualizar plan
              </Button>
            ) : (
              <Badge tone="orange" className="flex-shrink-0">🔒 Solo Premium</Badge>
            )
          )}
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <Card className={`p-8 text-center flex flex-col items-center gap-4 ${stuckGenerating ? "border-brand-orange/30" : ""}`}>
            <span className="text-4xl">{stuckGenerating ? "⏳" : "🥗"}</span>
            <div>
              <p className="text-text-primary font-bold font-display mb-1">
                {stuckGenerating ? "Tu plan tardó demasiado en generarse" : "Aún no tienes un plan activo"}
              </p>
              <p className="text-[#4A5568] text-sm">
                {stuckGenerating
                  ? "Hubo un problema durante la generación. Puedes intentarlo de nuevo sin perder tu diagnóstico."
                  : "Completa tu diagnóstico para generar tu plan nutricional"}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(stuckGenerating ? "/generando-plan" : "/diagnostico", {
                state: stuckGenerating ? { regenerar: true } : undefined,
              })}
            >
              {stuckGenerating ? "Reintentar generación →" : "Generar mi plan"}
            </Button>
          </Card>
        ) : planVencido ? (
          /* ── Plan vencido ── */
          <Card className="p-8 text-center flex flex-col items-center gap-4 border-brand-orange/25">
            <span className="text-4xl">📅</span>
            <div>
              <p className="text-text-primary font-bold font-display mb-1">Tu plan nutricional ha concluido</p>
              <p className="text-[#4A5568] text-sm leading-relaxed">
                Tu plan de 15 días venció el{" "}
                <strong className="text-[#BF9000]">{new Date(fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</strong>.
                {esPremium
                  ? " Genera uno nuevo para continuar con tu alimentación."
                  : " Actualiza a Premium para generar planes ilimitados."}
              </p>
            </div>
            {esPremium ? (
              <Button size="lg" onClick={irARegenerar}>
                Generar nuevo plan →
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#4A5568]">🔒 Función exclusiva Premium</span>
                <Button
                  size="lg"
                  className="!bg-brand-orange/15 !text-brand-orange border border-brand-orange/25 hover:!bg-brand-orange/25"
                  onClick={() => navigate("/panel?upgrade=true")}
                >
                  Ver planes Premium →
                </Button>
              </div>
            )}
          </Card>
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
                    background: d === dia ? "#1B5E20" : d < dia ? "rgba(27,94,32,.35)" : "#E2E8F0",
                    transform: d === dia ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* ── Banner Día 15 ── */}
            {diaActual === 15 && (
              <Card className="flex flex-col items-center text-center gap-3 border-brand-green/30">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="text-text-primary font-black font-display text-base leading-tight">
                    ¡Plan de 15 días completado!
                  </p>
                  <p className="text-[#4A5568] text-xs mt-1">
                    {esPremium
                      ? "Genera un nuevo plan cuando estés listo."
                      : "Completa tu seguimiento para continuar."}
                  </p>
                </div>
                <Button onClick={() => navigate(esPremium ? "/diagnostico" : "/seguimiento")}>
                  {esPremium ? "Nuevo plan →" : "Completar seguimiento →"}
                </Button>
              </Card>
            )}

            {/* ── Day navigator ── */}
            <Card className="p-4 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={irAnterior}
                disabled={dia === 1}
                className="!w-10 !h-10 !p-0 flex items-center justify-center text-xl"
                aria-label="Día anterior"
              >
                ‹
              </Button>

              <div className="text-center">
                <p className="text-[#1B5E20] font-black font-display text-lg">Día {dia} de 15</p>
                <p className="text-[#4A5568] text-xs capitalize">{fechaDia}</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={irSiguiente}
                disabled={dia === 15}
                className="!w-10 !h-10 !p-0 flex items-center justify-center text-xl"
                aria-label="Día siguiente"
              >
                ›
              </Button>
            </Card>

            {/* ── Meals list ── */}
            <div className="flex flex-col gap-3">
              {comidasDelDia.map((c, idx) => {
                const tc = TIPO_COLOR[c.tipo] ?? TIPO_COLOR.comida
                return (
                  <Card
                    key={idx}
                    className="p-4"
                    style={{ borderLeftColor: tc.border, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold tracking-widest" style={{ color: tc.border }}>
                            {tc.label.toUpperCase()}
                          </span>
                          {c.hora_sugerida && (
                            <span className="text-[10px] text-[#4A5568]">{c.hora_sugerida} hrs</span>
                          )}
                        </div>
                        <p className="text-text-primary font-semibold text-sm leading-tight">{c.nombre}</p>
                        {c.descripcion && (
                          <p className="text-[#4A5568] text-xs mt-1 leading-relaxed">{c.descripcion}</p>
                        )}
                        {c.ingredientes?.length > 0 && (
                          <ul className="mt-2 flex flex-col gap-0.5">
                            {c.ingredientes.map((ing, i) => (
                              <li key={i} className="text-xs flex items-baseline gap-1.5">
                                <span className="text-[#1B5E20] flex-shrink-0">·</span>
                                <span>
                                  <span className="text-text-primary font-medium">{ing.cantidad}</span>
                                  {" "}<span className="text-[#4A5568]">{ing.nombre}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-[#4A5568] text-xs mt-2">
                          {c.proteina_g}g prot · {c.carbos_g}g carbs · {c.grasas_g}g grasas
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#1B5E20] font-black font-display text-base">{c.kcal}</p>
                        <p className="text-[#4A5568] text-xs">kcal</p>
                      </div>
                    </div>
                  </Card>
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
                  <Card className="bg-brand-green/[0.06] border-brand-green/20 flex justify-between items-center">
                    <span className="text-sm text-[#4A5568]">Total del día {dia}</span>
                    <span className="font-display font-black text-[#1B5E20] text-lg">{kcalTotal} kcal</span>
                  </Card>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Proteína", value: macros.prot, color: "#2563EB" },
                      { label: "Carbos", value: macros.carbs, color: "#BF9000" },
                      { label: "Grasas", value: macros.grasas, color: "#7C3AED" },
                    ].map(({ label, value, color }) => (
                      <Card key={label} className="p-3 text-center">
                        <p className="font-display font-black text-lg" style={{ color }}>{value}g</p>
                        <p className="text-[10px] text-[#4A5568] mt-0.5">{label}</p>
                      </Card>
                    ))}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* ── Card de Feedback ── */}
        {plan && feedback !== null && (
          <Card className="flex flex-col gap-4">
            {feedback === false ? (
              <>
                <div>
                  <p className="text-text-primary font-bold font-display text-sm">¿Qué tal tu plan nutricional?</p>
                  <p className="text-[#4A5568] text-xs mt-0.5">Tu opinión nos ayuda a mejorar la IA.</p>
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
                  <Input
                    as="textarea"
                    placeholder="¿Qué mejorarías? (opcional)"
                    value={feedbackForm.comentario}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, comentario: e.target.value }))}
                    rows={2}
                    className="w-full resize-none"
                  />
                )}

                <Button
                  onClick={enviarFeedback}
                  disabled={feedbackForm.estrellas === 0 || enviandoFeedback}
                  fullWidth
                >
                  {enviandoFeedback ? "Enviando..." : "Enviar feedback"}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-text-primary font-bold text-sm font-display">¡Gracias por tu feedback!</p>
                  <p className="text-[#4A5568] text-xs mt-0.5">
                    {"⭐".repeat(feedback?.estrellas ?? 0)} Nos ayuda a mejorar tu próximo plan.
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
