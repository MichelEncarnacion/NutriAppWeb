// src/pages/Panel.jsx
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useActivePlan } from "../hooks/useActivePlan"
import { supabase } from "../lib/supabase"
import Layout from "../components/Layout"

export default function Panel() {
  const { perfil, session, esPremium } = useAuth()
  const { plan, planId, fechaInicio, fechaFin, diaActual, isLoading, error, refetch } = useActivePlan()
  const navigate = useNavigate()

  const nombre = perfil?.nombre?.split(" ")[0] ?? "Usuario"
  const meta = plan?.meta_diaria ?? null
  const comidasHoy = plan?.dias?.[diaActual - 1]?.comidas ?? []
  const primeraComida = comidasHoy[0] ?? null

  const [seguimientoHecho, setSeguimientoHecho] = useState(false)

  useEffect(() => {
    if (!fechaInicio || !session?.user?.id) return
    supabase
      .from('seguimientos')
      .select('id')
      .eq('perfil_id', session.user.id)
      .gte('created_at', fechaInicio + 'T00:00:00')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSeguimientoHecho(Boolean(data)))
  }, [fechaInicio, session?.user?.id])

  const fechaLabel = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  })

  const rangoFechas = (fechaInicio && fechaFin)
    ? `${new Date(fechaInicio).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${new Date(fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
    : ""

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
        <p className="text-brand-red text-sm">Error al cargar tu plan</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-dark-800 border border-dark-600 text-white text-sm rounded-xl hover:border-brand-green transition-all"
        >
          Reintentar
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-2xl animate-fadeUp">

        {/* Header */}
        <div>
          <p className="text-text-muted text-xs mb-1 capitalize">{fechaLabel}</p>
          <h1 className="text-white text-2xl font-black font-display">
            Hola, <span className="text-brand-green">{nombre} 👋</span>
          </h1>
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <div className="bg-dark-800 border border-brand-green/20 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🥗</span>
            <div>
              <p className="text-white font-bold font-display mb-1">Aún no tienes un plan activo</p>
              <p className="text-text-muted text-sm">Completa tu diagnóstico para generar tu plan nutricional personalizado</p>
            </div>
            <button
              onClick={() => navigate("/diagnostico")}
              className="px-6 py-2.5 bg-brand-green text-black font-bold font-display rounded-xl hover:bg-brand-greenL transition-all text-sm"
            >
              Generar mi plan
            </button>
          </div>
        ) : (
          <>
            {/* ── Banner Día 15 ── */}
            {diaActual === 15 && (
              <div
                className="rounded-2xl p-6 flex flex-col items-center text-center gap-3 border border-brand-green/30"
                style={{
                  background: "linear-gradient(135deg, rgba(61,220,132,0.1), rgba(88,166,255,0.07))",
                }}
              >
                <span className="text-4xl">🎉</span>
                <div>
                  <p className="text-white font-black font-display text-lg leading-tight">
                    ¡Completaste tu plan de 15 días!
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    {esPremium
                      ? "Estás listo para comenzar un nuevo plan."
                      : "Completa tu seguimiento para generar el próximo plan."}
                  </p>
                </div>
                <button
                  onClick={() => navigate(esPremium ? "/diagnostico" : "/seguimiento")}
                  className="px-6 py-2.5 rounded-xl font-bold font-display text-sm transition-all bg-brand-green text-dark-900"
                >
                  {esPremium ? "Generar nuevo plan →" : "Completar seguimiento →"}
                </button>
              </div>
            )}

            {/* ── Día actual ── */}
            <div className="flex items-center gap-3">
              <span className="bg-brand-green/12 text-brand-green text-xs font-bold font-display px-3 py-1.5 rounded-full border border-brand-green/20">
                DÍA {diaActual} DE 15
              </span>
              {rangoFechas && (
                <span className="text-text-muted text-xs">{rangoFechas}</span>
              )}
            </div>

            {/* ── CTA Seguimiento ── */}
            {diaActual >= 13 && !seguimientoHecho && (
              <div className="rounded-2xl p-4 flex items-start gap-3 bg-brand-orange/[0.08] border border-brand-orange/25">
                <span className="text-xl flex-shrink-0">📋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm font-display">
                    {15 - diaActual === 0
                      ? "Último día"
                      : `Quedan ${15 - diaActual} día${15 - diaActual === 1 ? "" : "s"}`}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5 leading-relaxed">
                    Completa tu seguimiento para que generemos tu próximo plan personalizado.
                  </p>
                  <button
                    onClick={() => navigate("/seguimiento")}
                    className="mt-3 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all bg-brand-orange/[0.15] text-brand-orange border border-brand-orange/30"
                  >
                    Completar seguimiento →
                  </button>
                </div>
              </div>
            )}

            {/* ── Primera comida del día ── */}
            {primeraComida && (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
                <p className="text-text-muted text-xs font-bold tracking-widest mb-3">PRIMERA COMIDA DEL DÍA</p>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold font-display text-lg leading-tight">{primeraComida.nombre}</p>
                    {primeraComida.descripcion && (
                      <p className="text-text-muted text-sm mt-1 leading-relaxed">{primeraComida.descripcion}</p>
                    )}
                    <p className="text-text-muted text-xs mt-2">🕐 {primeraComida.hora_sugerida} hrs</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-brand-green font-black font-display text-xl">{primeraComida.kcal}</p>
                    <p className="text-text-muted text-xs">kcal</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Metas diarias ── */}
            {meta && (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
                <p className="text-text-muted text-xs font-bold tracking-widest mb-3">METAS DEL DÍA</p>
                <div className="flex gap-3">
                  <div className="flex-1 text-center bg-dark-900 rounded-xl p-3">
                    <p className="text-brand-green font-black font-display text-lg">{meta.kcal}</p>
                    <p className="text-text-muted text-xs">kcal</p>
                  </div>
                  <div className="flex-1 text-center bg-dark-900 rounded-xl p-3">
                    <p className="text-brand-blue font-black font-display text-lg">{meta.proteina_g}g</p>
                    <p className="text-text-muted text-xs">proteína</p>
                  </div>
                  <div className="flex-1 text-center bg-dark-900 rounded-xl p-3">
                    <p className="text-brand-orange font-black font-display text-lg">{meta.agua_l}L</p>
                    <p className="text-text-muted text-xs">agua</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── CTA ── */}
            <button
              onClick={() => navigate("/mi-plan")}
              className="w-full py-3.5 bg-brand-green/10 border border-brand-green/30 text-brand-green font-bold font-display rounded-xl hover:bg-brand-green/20 transition-all text-sm"
            >
              Ver plan completo →
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
