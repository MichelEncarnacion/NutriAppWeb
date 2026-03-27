# Panel & Mi Plan Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite Panel.jsx and MiPlan.jsx to use `planes.contenido_json` via a shared React Query hook, removing all `registro_comidas` dependencies.

**Architecture:** A new `useActivePlan` hook fetches the active plan with React Query (cached, deduplicated). Panel shows day header + first meal + daily goals + CTA. MiPlan shows one day at a time with ‹ › arrow navigation. No DB changes required.

**Tech Stack:** React 19, React Router v7, Supabase JS v2, TanStack React Query v5, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-22-panel-miplan-rewrite-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/main.jsx` | Modify | Add `QueryClient` + `QueryClientProvider` wrapping `<App />` |
| `src/hooks/useActivePlan.js` | Create | Fetch active plan from Supabase, expose `{ plan, fechaInicio, fechaFin, diaActual, isLoading, error, refetch }` |
| `src/pages/Panel.jsx` | Rewrite | Dashboard: day badge, first meal, meta_diaria goals, CTA to Mi Plan |
| `src/pages/MiPlan.jsx` | Rewrite | Full plan: ‹ › day navigation, read-only meal cards with macros |

---

## Task 1: Add QueryClientProvider to main.jsx

**Files:**
- Modify: `src/main.jsx`

`@tanstack/react-query` is already installed but `QueryClientProvider` is not mounted. Any `useQuery` call will throw without it.

- [ ] **Step 1: Replace `src/main.jsx` with the following**

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add QueryClientProvider to main.jsx"
```

---

## Task 2: Create useActivePlan hook

**Files:**
- Create: `src/hooks/useActivePlan.js`

This hook is the single source of truth for both Panel and MiPlan. It fetches the active `listo` plan and derives the current plan day.

- [ ] **Step 1: Create `src/hooks/useActivePlan.js`**

```js
// src/hooks/useActivePlan.js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

/**
 * Fetches the user's active nutrition plan.
 *
 * Returns:
 *   plan        — contenido_json object: { meta_diaria, dias[] } or null
 *   fechaInicio — 'YYYY-MM-DD' string or null
 *   fechaFin    — 'YYYY-MM-DD' string or null
 *   diaActual   — integer 1–15 based on today vs fechaInicio
 *   isLoading   — boolean
 *   error       — Error or null
 *   refetch     — function to manually re-fetch
 */
export function useActivePlan() {
  const { session } = useAuth()
  const uid = session?.user?.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activePlan', uid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planes')
        .select('contenido_json, fecha_inicio, fecha_fin')
        .eq('perfil_id', uid)
        .eq('es_activo', true)
        .eq('estado', 'listo')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data ?? null
    },
    enabled: Boolean(uid),
    staleTime: 5 * 60 * 1000, // 5 minutes — plan rarely changes mid-session
  })

  const diaActual = data?.fecha_inicio
    ? Math.min(
        Math.max(
          Math.floor((new Date() - new Date(data.fecha_inicio)) / 86_400_000) + 1,
          1
        ),
        15
      )
    : 1

  return {
    plan: data?.contenido_json ?? null,
    fechaInicio: data?.fecha_inicio ?? null,
    fechaFin: data?.fecha_fin ?? null,
    diaActual,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` — no errors. (Nothing imports the hook yet, but it should parse cleanly.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useActivePlan.js
git commit -m "feat: add useActivePlan hook with React Query"
```

---

## Task 3: Rewrite Panel.jsx

**Files:**
- Rewrite: `src/pages/Panel.jsx`

Replace the current Panel (which queries `registro_comidas` and `metricas`) with the new layout: day badge → first meal of the day → daily goals → CTA.

- [ ] **Step 1: Replace `src/pages/Panel.jsx` with the following**

```jsx
// src/pages/Panel.jsx
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useActivePlan } from "../hooks/useActivePlan"
import Layout from "../components/Layout"

export default function Panel() {
  const { perfil } = useAuth()
  const { plan, fechaInicio, fechaFin, diaActual, isLoading, error, refetch } = useActivePlan()
  const navigate = useNavigate()

  const nombre = perfil?.nombre?.split(" ")[0] ?? "Usuario"
  const meta = plan?.meta_diaria ?? null
  const comidasHoy = plan?.dias?.[diaActual - 1]?.comidas ?? []
  const primeraComida = comidasHoy[0] ?? null

  const fechaLabel = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  })

  const rangoFechas = (fechaInicio && fechaFin)
    ? `${new Date(fechaInicio).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${new Date(fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
    : ""

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
      <div className="flex flex-col gap-5 max-w-2xl animate-fadeUp">

        {/* Header */}
        <div>
          <p className="text-[#7D8590] text-xs mb-1 capitalize">{fechaLabel}</p>
          <h1 className="text-white text-2xl font-black font-display">
            Hola, <span className="text-[#3DDC84]">{nombre} 👋</span>
          </h1>
        </div>

        {!plan ? (
          /* ── No-plan state ── */
          <div className="bg-[#161B22] border border-[rgba(61,220,132,.2)] rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🥗</span>
            <div>
              <p className="text-white font-bold font-display mb-1">Aún no tienes un plan activo</p>
              <p className="text-[#7D8590] text-sm">Completa tu diagnóstico para generar tu plan nutricional personalizado</p>
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
            {/* ── Día actual ── */}
            <div className="flex items-center gap-3">
              <span className="bg-[rgba(61,220,132,.12)] text-[#3DDC84] text-xs font-bold font-display px-3 py-1.5 rounded-full border border-[rgba(61,220,132,.2)]">
                DÍA {diaActual} DE 15
              </span>
              {rangoFechas && (
                <span className="text-[#7D8590] text-xs">{rangoFechas}</span>
              )}
            </div>

            {/* ── Primera comida del día ── */}
            {primeraComida && (
              <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5">
                <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3">PRIMERA COMIDA DEL DÍA</p>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold font-display text-lg leading-tight">{primeraComida.nombre}</p>
                    {primeraComida.descripcion && (
                      <p className="text-[#7D8590] text-sm mt-1 leading-relaxed">{primeraComida.descripcion}</p>
                    )}
                    <p className="text-[#7D8590] text-xs mt-2">🕐 {primeraComida.hora_sugerida} hrs</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#3DDC84] font-black font-display text-xl">{primeraComida.kcal}</p>
                    <p className="text-[#7D8590] text-xs">kcal</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Metas diarias ── */}
            {meta && (
              <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5">
                <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3">METAS DEL DÍA</p>
                <div className="flex gap-3">
                  <div className="flex-1 text-center bg-[#0D1117] rounded-xl p-3">
                    <p className="text-[#3DDC84] font-black font-display text-lg">{meta.kcal}</p>
                    <p className="text-[#7D8590] text-xs">kcal</p>
                  </div>
                  <div className="flex-1 text-center bg-[#0D1117] rounded-xl p-3">
                    <p className="text-[#58A6FF] font-black font-display text-lg">{meta.proteina_g}g</p>
                    <p className="text-[#7D8590] text-xs">proteína</p>
                  </div>
                  <div className="flex-1 text-center bg-[#0D1117] rounded-xl p-3">
                    <p className="text-[#F0A500] font-black font-display text-lg">{meta.agua_l}L</p>
                    <p className="text-[#7D8590] text-xs">agua</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── CTA ── */}
            <button
              onClick={() => navigate("/mi-plan")}
              className="w-full py-3.5 bg-[rgba(61,220,132,.1)] border border-[rgba(61,220,132,.3)] text-[#3DDC84] font-bold font-display rounded-xl hover:bg-[rgba(61,220,132,.2)] transition-all text-sm"
            >
              Ver plan completo →
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Smoke-test in browser**

Run `npm run dev`, navigate to `/panel`. Verify:
- If plan exists: day badge shows correct day, first meal card renders, 3 goal pills show, "Ver plan completo →" button visible
- If no plan: "Aún no tienes un plan activo" card with "Generar mi plan" button

- [ ] **Step 4: Commit**

```bash
git add src/pages/Panel.jsx
git commit -m "feat: rewrite Panel with useActivePlan — remove registro_comidas"
```

---

## Task 4: Rewrite MiPlan.jsx

**Files:**
- Rewrite: `src/pages/MiPlan.jsx`

Replace the current MiPlan (pill strip + meal toggles + registro_comidas writes) with ‹ › arrow navigation and read-only meal cards.

- [ ] **Step 1: Replace `src/pages/MiPlan.jsx` with the following**

```jsx
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
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Smoke-test in browser**

Run `npm run dev`, navigate to `/mi-plan`. Verify:
- Day navigator shows "Día X de 15" with date label
- ‹ arrow disabled on day 1, › disabled on day 15
- Arrows navigate between days correctly
- Each meal card shows colored left border, name, time, description, macros, kcal
- Day total renders at the bottom
- No-plan state shows when user has no active plan

- [ ] **Step 4: Commit**

```bash
git add src/pages/MiPlan.jsx
git commit -m "feat: rewrite MiPlan with arrow navigation — remove registro_comidas"
```

---

## Final verification

- [ ] Run `npm run build` one last time — confirm zero errors
- [ ] Navigate `/panel` → confirm day badge, first meal, goal pills, CTA button
- [ ] Click "Ver plan completo →" → confirm navigates to `/mi-plan`
- [ ] In `/mi-plan` → use ‹ › to navigate all 15 days — confirm meals load for each day
- [ ] Confirm Panel and MiPlan both show the no-plan card when no active plan exists

---

## Notes for implementer

- `useActivePlan` returns `plan` as the `contenido_json` object (not the DB row). Access meals as `plan.dias[dia-1].comidas`.
- `diaOffset` starts as `null` in MiPlan to defer to `diaActual` from the hook. First navigation sets it to an explicit value.
- The `staleTime: 5 * 60 * 1000` on the query means both pages share the same cached response without re-fetching when switching between Panel and MiPlan.
- No `registro_comidas` table exists — do NOT add any queries to it.
- The app has no test framework — skip TDD, verify visually with `npm run dev`.
