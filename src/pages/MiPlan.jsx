// src/pages/MiPlan.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useActivePlan } from "../hooks/useActivePlan"
import Layout from "../components/Layout"

const TIPO_COLOR = {
  desayuno:    { border: "#F0A500", label: "Desayuno" },
  colacion_am: { border: "#A855F7", label: "Colación AM" },
  comida:      { border: "#3DDC84", label: "Comida" },
  colacion_pm: { border: "#A855F7", label: "Colación PM" },
  cena:        { border: "#58A6FF", label: "Cena" },
}

export default function MiPlan() {
  const { plan, fechaInicio, fechaFin, diaActual, isLoading, error, refetch } = useActivePlan()
  const [diaOffset, setDiaOffset] = useState(null) // null = use diaActual from hook
  const navigate = useNavigate()

  const dia = diaOffset ?? diaActual
  const comidasDelDia = plan?.dias?.[dia - 1]?.comidas ?? []
  const kcalTotal = plan?.dias?.[dia - 1]?.kcal_total ?? 0

  const fechaDia = fechaInicio
    ? new Date(new Date(fechaInicio).getTime() + (dia - 1) * 86_400_000)
        .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    : ""

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
        <div>
          <h1 className="text-white text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
          <p className="text-[#7D8590] text-xs">
            {plan && fechaFin
              ? `Vigente hasta ${new Date(fechaFin).toLocaleDateString("es-MX")} · ${plan.dias?.length ?? 15} días`
              : isLoading ? "Cargando plan..." : "Sin plan activo"}
          </p>
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <span className="text-4xl">🥗</span>
            <div>
              <p className="text-white font-bold font-display mb-1">Aún no tienes un plan activo</p>
              <p className="text-[#7D8590] text-sm">Completa tu diagnóstico para generar tu plan nutricional</p>
            </div>
            <button
              onClick={() => navigate("/diagnostico")}
              className="px-6 py-2.5 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
            >
              Generar mi plan
            </button>
          </div>
        ) : (
          <>
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

            {/* ── Day total ── */}
            {comidasDelDia.length > 0 && (
              <div className="bg-[rgba(61,220,132,.06)] border border-[rgba(61,220,132,.18)] rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sm text-[#7D8590]">Total del día {dia}</span>
                <span className="font-display font-black text-[#3DDC84] text-lg">{kcalTotal} kcal</span>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
