# Panel & Mi Plan Rewrite Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `Panel.jsx` and `MiPlan.jsx` to display the user's generated nutrition plan using only existing data from `planes.contenido_json`, removing all dependencies on the unimplemented `registro_comidas` table.

**Architecture:** Both pages fetch the user's active plan (`es_activo = true`, `estado = 'listo'`) from Supabase and derive all display data from the stored JSON. No new tables or edge functions are needed.

**Tech Stack:** React 19, React Router v7, Supabase JS v2, TanStack React Query v5, Tailwind CSS v4

---

## Context

### Current state of the pages

**Panel.jsx** — Partially broken. The `registro_comidas` query fails silently and falls back to zero values for "comidas completadas hoy" and "adherencia semanal". These sections show incorrect placeholder data. The page does render but displays misleading zeros.

**MiPlan.jsx** — Broken. It queries `registro_comidas` for per-meal completion toggles. This causes runtime errors. The meal-toggle UI is non-functional.

### What stays untouched

Auth flow, routing (`App.jsx`, `privateRoute.jsx`), `AuthContext.jsx`, `Layout.jsx`, `Diagnostico.jsx`, `GenerandoPlan.jsx`, `Lecciones.jsx`, `Progreso.jsx`, `Seguimiento.jsx`, and all admin pages remain unchanged.

### Deliberate removals (confirmed by user)

The following features from the current pages are **intentionally removed** in this rewrite, as they depend on `registro_comidas` which is out of scope:

- ❌ "Comidas completadas hoy" KPI counter (Panel)
- ❌ "Adherencia semanal" 7-day bar chart (Panel)
- ❌ Per-meal completion toggle/checkbox (MiPlan)
- ❌ Consumed calories/water tracking (Panel shows plan *goals* only, not consumed amounts)

These are documented as future Phase 3 work in `Out of Scope`.

### Data available

The `planes` table has:
- `contenido_json` — full 15-day plan JSONB:
  ```json
  {
    "meta_diaria": { "kcal": 1850, "proteina_g": 125, "carbos_g": 220, "grasas_g": 60, "agua_l": 2.5 },
    "dias": [
      {
        "dia": 1,
        "kcal_total": 1850,
        "comidas": [
          {
            "tipo": "desayuno",
            "nombre": "Avena con plátano",
            "descripcion": "...",
            "hora_sugerida": "08:00",
            "kcal": 380,
            "proteina_g": 18,
            "carbos_g": 52,
            "grasas_g": 8
          }
        ]
      }
    ]
  }
  ```
- `fecha_inicio` — YYYY-MM-DD, used to calculate the current plan day
- `fecha_fin` — YYYY-MM-DD
- `es_activo` — boolean
- `estado` — `'listo'` | `'generando'` | `'error'`

No `metricas` table data is needed. Panel shows plan goals only.

---

## Shared Hook: `useActivePlan`

New file `src/hooks/useActivePlan.js` isolates plan-fetching logic so both pages share it without duplication.

**Returns:** `{ plan, diaActual, isLoading, error }`
- `plan` — the full `contenido_json` object, or `null` if no active plan exists
- `diaActual` — integer 1–15 based on today vs `fecha_inicio`
- `isLoading` — boolean
- `error` — error object or null

**Uses TanStack React Query** (`useQuery`) — `QueryClientProvider` must be added to `main.jsx` wrapping `<App />` as part of this implementation (currently missing).

**Supabase query:**
```js
supabase
  .from('planes')
  .select('contenido_json, fecha_inicio, fecha_fin')
  .eq('perfil_id', userId)
  .eq('es_activo', true)
  .eq('estado', 'listo')
  .limit(1)
  .single()
```

**Day calculation:**
```js
const today = new Date();
const start = new Date(fecha_inicio);
const diff = Math.floor((today - start) / 86_400_000);
const diaActual = Math.min(Math.max(diff + 1, 1), 15);
```

---

## Panel.jsx — Rewrite

### Layout (user-selected: Option C — combined)

Sections stacked vertically within `Layout`:

1. **Header row** — "Día X de 15" green badge + plan date range (`fecha_inicio` to `fecha_fin`)
2. **Primera comida del día** — card with the first meal of `dias[diaActual - 1].comidas[0]`: name, `hora_sugerida`, kcal, description
3. **Metas diarias** — three pills from `meta_diaria`: total kcal goal, proteína goal (g), agua goal (L)
4. **CTA** — "Ver plan completo →" button → navigates to `/mi-plan`

### No-plan state

When `plan === null` and not loading:
- Card: "Aún no tienes un plan activo"
- Button "Generar mi plan" → navigates to `/diagnostico` (not `/generando-plan` — that route requires `location.state.respuestas` and bounces back to `/diagnostico` if missing)

### Loading state

Centered spinner: `w-8 h-8 border-2 border-[#3DDC84] border-t-transparent rounded-full animate-spin`

### Error state

Error message + "Reintentar" button that calls `refetch()` from React Query.

---

## MiPlan.jsx — Rewrite

### Layout (user-selected: Option A — one day at a time)

**Header:**
- `‹` button — disabled when `diaSeleccionado === 1`, decrements state
- Center: "Día X de 15" + computed weekday+date label from `fecha_inicio`
- `›` button — disabled when `diaSeleccionado === 15`, increments state

**Meals list:**

Each meal in `dias[diaSeleccionado - 1].comidas` rendered as a card with left-border color by `tipo`:

| tipo | color |
|------|-------|
| `desayuno` | `#F0A500` orange |
| `colacion_am` / `colacion_pm` | `#A855F7` purple |
| `comida` | `#3DDC84` green |
| `cena` | `#58A6FF` blue |

Each card shows:
- Tipo label (uppercased) + `hora_sugerida`
- `nombre` (bold)
- `descripcion` (muted text)
- Macro row: `kcal kcal · Xg prot · Xg carbs · Xg grasas`

**No meal toggles.** Read-only display only.

**Day total:** Row below meals: `Total del día: X kcal` from `dias[diaSeleccionado - 1].kcal_total`

**State:** `diaSeleccionado` initializes to `diaActual`. All navigation is local — no re-fetch needed since all 15 days are already in memory.

### No-plan state

Same as Panel: card + "Generar mi plan" → `/diagnostico`.

### Loading / Error

Same pattern as Panel (spinner / error + retry).

---

## Color Reference (existing palette)

| Token | Value | Use |
|-------|-------|-----|
| Background | `#0D1117` | Page bg |
| Surface | `#161B22` | Cards |
| Border | `#2D3748` | Dividers |
| Text primary | `#E6EDF3` | Headings |
| Text muted | `#7D8590` | Labels |
| Green | `#3DDC84` | Brand, CTA, comida |
| Blue | `#58A6FF` | Cena |
| Orange | `#F0A500` | Desayuno |
| Purple | `#A855F7` | Colaciones |

---

## File Changes Summary

| File | Action | Notes |
|------|--------|-------|
| `src/main.jsx` | **Modify** | Add `QueryClient` + `QueryClientProvider` wrapping `<App />` |
| `src/hooks/useActivePlan.js` | **Create** | Shared plan-fetching hook with React Query |
| `src/pages/Panel.jsx` | **Rewrite** | Remove registro_comidas + adherencia chart |
| `src/pages/MiPlan.jsx` | **Rewrite** | Remove meal toggles, add day navigation |

No database migrations, no edge function changes, no schema changes needed.

---

## Out of Scope (Phase 3 — future)

- `registro_comidas` table + meal check-off tracking
- Consumed calories / water manual input
- Adherencia semanal chart
- Progreso, Seguimiento, Lecciones, Admin pages
