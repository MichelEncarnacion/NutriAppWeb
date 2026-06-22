// src/pages/Panel.jsx
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useActivePlan } from "../hooks/useActivePlan"
import { supabase } from "../lib/supabase"
import Layout from "../components/Layout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"

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
        <Button variant="secondary" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-2xl animate-fadeUp">

        {/* Header */}
        <div>
          <p className="text-text-muted text-xs mb-1 capitalize">{fechaLabel}</p>
          <h1 className="text-text-primary text-2xl font-black font-display">
            Hola, <span className="text-brand-green">{nombre} 👋</span>
          </h1>
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <Card className="border-brand-green/20 p-8 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🥗</span>
            <div>
              <p className="text-text-primary font-bold font-display mb-1">Aún no tienes un plan activo</p>
              <p className="text-text-muted text-sm">Completa tu diagnóstico para generar tu plan nutricional personalizado</p>
            </div>
            <Button onClick={() => navigate("/diagnostico")}>
              Generar mi plan
            </Button>
          </Card>
        ) : (
          <>
            {/* ── Banner Día 15 ── */}
            {diaActual === 15 && (
              <Card className="border-brand-green/30 p-6 flex flex-col items-center text-center gap-3">
                <span className="text-4xl">🎉</span>
                <div>
                  <p className="text-text-primary font-black font-display text-lg leading-tight">
                    ¡Completaste tu plan de 15 días!
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    {esPremium
                      ? "Estás listo para comenzar un nuevo plan."
                      : "Completa tu seguimiento para generar el próximo plan."}
                  </p>
                </div>
                <Button onClick={() => navigate(esPremium ? "/diagnostico" : "/seguimiento")}>
                  {esPremium ? "Generar nuevo plan →" : "Completar seguimiento →"}
                </Button>
              </Card>
            )}

            {/* ── Día actual ── */}
            <div className="flex items-center gap-3">
              <Badge tone="green">DÍA {diaActual} DE 15</Badge>
              {rangoFechas && (
                <span className="text-text-muted text-xs">{rangoFechas}</span>
              )}
            </div>

            {/* ── CTA Seguimiento ── */}
            {diaActual >= 13 && !seguimientoHecho && (
              <Card className="border-brand-orange/25 bg-brand-orange/[0.08] flex items-start gap-3 p-4">
                <span className="text-xl flex-shrink-0">📋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-bold text-sm font-display">
                    {15 - diaActual === 0
                      ? "Último día"
                      : `Quedan ${15 - diaActual} día${15 - diaActual === 1 ? "" : "s"}`}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5 leading-relaxed">
                    Completa tu seguimiento para que generemos tu próximo plan personalizado.
                  </p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigate("/seguimiento")}>
                    Completar seguimiento →
                  </Button>
                </div>
              </Card>
            )}

            {/* ── Primera comida del día ── */}
            {primeraComida && (
              <Card>
                <p className="text-text-muted text-xs font-bold tracking-widest mb-3">PRIMERA COMIDA DEL DÍA</p>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-bold font-display text-lg leading-tight">{primeraComida.nombre}</p>
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
              </Card>
            )}

            {/* ── Metas diarias ── */}
            {meta && (
              <Card>
                <p className="text-text-muted text-xs font-bold tracking-widest mb-3">METAS DEL DÍA</p>
                <div className="flex gap-3">
                  <div className="flex-1 text-center bg-dark-900 rounded-lg p-3">
                    <p className="text-brand-green font-black font-display text-lg">{meta.kcal}</p>
                    <p className="text-text-muted text-xs">kcal</p>
                  </div>
                  <div className="flex-1 text-center bg-dark-900 rounded-lg p-3">
                    <p className="text-brand-blue font-black font-display text-lg">{meta.proteina_g}g</p>
                    <p className="text-text-muted text-xs">proteína</p>
                  </div>
                  <div className="flex-1 text-center bg-dark-900 rounded-lg p-3">
                    <p className="text-brand-orange font-black font-display text-lg">{meta.agua_l}L</p>
                    <p className="text-text-muted text-xs">agua</p>
                  </div>
                </div>
              </Card>
            )}

            {/* ── CTA ── */}
            <Button variant="secondary" fullWidth size="lg" onClick={() => navigate("/mi-plan")}>
              Ver plan completo →
            </Button>
          </>
        )}
      </div>
    </Layout>
  )
}
