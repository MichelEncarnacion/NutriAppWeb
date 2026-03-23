# Panel & Mi Plan Rewrite Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `Panel.jsx` and `MiPlan.jsx` so they work correctly using only existing data from `planes.contenido_json`, with no dependency on the missing `registro_comidas` table.

**Architecture:** Both pages fetch the user's active plan (`es_activo = true`, `estado = 'listo'`) from Supabase and derive all display data from the stored JSON. No new tables or edge functions are needed.

**Tech Stack:** React 19, React Router v7, Supabase JS v2, TanStack React Query v5, Tailwind CSS v4

---

## Context

### What's broken today

`Panel.jsx` and `MiPlan.jsx` query a `registro_comidas` table that does not exist in the database. This causes runtime errors that make both pages non-functional.

### What stays untouched

Auth flow, routing (`App.jsx`, `privateRoute.jsx`), `AuthContext.jsx`, `Layout.jsx`, `Diagnostico.jsx`, `GenerandoPlan.jsx`, `Lecciones.jsx`, `Progreso.jsx`, `Seguimiento.jsx`, and all admin pages remain unchanged.

### Data available

The `planes` table has:
- `contenido_json` — full 15-day plan JSONB with this structure:
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
- `fecha_inicio` — date string (YYYY-MM-DD), used to calculate the current plan day
- `fecha_fin` — date string (YYYY-MM-DD)
- `es_activo` — boolean
- `estado` — `'listo'` | `'generando'` | `'error'`

---

## Shared Hook: `useActivePlan`

A new custom hook `src/hooks/useActivePlan.js` isolates all plan-fetching logic so both pages share it without duplication.

```js
// Returns: { plan, diaActual, loading, error }
// plan = full contenido_json object or null
// diaActual = integer 1–15 based on today vs fecha_inicio
```

Uses TanStack React Query (`useQuery`) to cache and deduplicate the Supabase fetch.

**Query:** `SELECT contenido_json, fecha_inicio, fecha_fin FROM planes WHERE perfil_id = $userId AND es_activo = true AND estado = 'listo' LIMIT 1`

**Day calculation:**
```js
const today = new Date();
const start = new Date(fecha_inicio);
const diff = Math.floor((today - start) / 86_400_000);
const diaActual = Math.min(Math.max(diff + 1, 1), 15);
```

---

## Panel.jsx — Rewrite

### Layout (chosen by user: Option C)

Three sections stacked vertically:

1. **Header row** — "Día X de 15" badge (green) + plan dates
2. **Primera comida del día** — card showing the first meal: name, suggested time, kcal, brief description
3. **Metas diarias** — three metric pills: kcal goal, protein goal (g), water goal (L)
4. **CTA button** — "Ver plan completo →" navigates to `/mi-plan`

### No-plan state

If the user has no active `listo` plan:
- Show a card with "Aún no tienes un plan activo" and a button "Generar mi plan" → navigates to `/diagnostico`

### Loading state

Spinner centered (matching app design: `border-[#3DDC84]` on dark background)

### Error state

Simple error message with a retry button that re-fetches.

---

## MiPlan.jsx — Rewrite

### Layout (chosen by user: Option A)

Single-day view with navigation arrows.

**Header:**
- ‹ arrow (disabled on day 1) — `diaSeleccionado` state decrements
- "Día X de 15" + weekday date label
- › arrow (disabled on day 15) — `diaSeleccionado` state increments

**Comidas list:**

Each meal rendered as a card with left-border color coded by `tipo`:
- `desayuno` → `#F0A500` (orange)
- `colacion_am` / `colacion_pm` → `#A855F7` (purple)
- `comida` → `#3DDC84` (green)
- `cena` → `#58A6FF` (blue)

Each card shows:
- Meal type label + suggested time
- Meal name (bold)
- Description (muted)
- Macro row: `kcal · Xg prot · Xg carbs · Xg grasas`

**State:** `diaSeleccionado` initializes to `diaActual` from `useActivePlan`. Navigation arrows update it locally (no re-fetch needed — all 15 days are in memory).

**Day total:** Below the meals list, a summary row: `Total del día: X kcal`

### No-plan state

Same as Panel: "Aún no tienes un plan" + "Generar mi plan" button.

---

## Color Reference (existing palette)

| Token | Value | Use |
|-------|-------|-----|
| Background | `#0D1117` | Page bg |
| Surface | `#161B22` | Cards |
| Border | `#2D3748` | Dividers |
| Text primary | `#E6EDF3` | Headings |
| Text muted | `#7D8590` | Labels |
| Green | `#3DDC84` | Brand, desayuno |
| Blue | `#58A6FF` | Cena |
| Orange | `#F0A500` | Desayuno |
| Purple | `#A855F7` | Colaciones |

---

## File Changes Summary

| File | Action | Notes |
|------|--------|-------|
| `src/hooks/useActivePlan.js` | **Create** | Shared plan-fetching hook |
| `src/pages/Panel.jsx` | **Rewrite** | Remove registro_comidas, use useActivePlan |
| `src/pages/MiPlan.jsx` | **Rewrite** | Day-by-day navigation, use useActivePlan |

No database migrations, no edge function changes, no schema changes needed.

---

## Out of Scope

- Meal check-off / registro_comidas (Phase 3, future)
- Manual calorie/water tracking input
- Progreso, Seguimiento, Lecciones pages (already separate)
- Admin pages
