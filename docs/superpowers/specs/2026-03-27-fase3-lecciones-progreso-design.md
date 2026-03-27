# Fase 3 Close — Lecciones & Progreso Design Spec

**Date:** 2026-03-27
**Scope:** Complete Phase 3 by fixing the two remaining gaps in `Lecciones.jsx` and `Progreso.jsx`.

---

## Context

Panel and MiPlan were rewritten and merged (commit `c047935`). The two remaining pages in Phase 3 already have substantial logic in place but are missing key UI features:

| Page | Already works | Missing |
|------|--------------|---------|
| `Lecciones.jsx` | List with lock/unlock states, 7-day timer, seed logic, completion write | Markdown rendering; modal replaced with bottom sheet |
| `Progreso.jsx` | Freemium overlay, delta indicators, history list | Real charts (only mini sparklines exist) |

**New dependencies to install:**
- `recharts` — line charts for Progreso (specified in Phase 3 requirements)
- `react-markdown` — render lesson content as markdown

---

## Task 1 — Install dependencies

```bash
npm install recharts react-markdown
```

Verify build passes after install.

---

## Task 2 — Progreso: replace grid with stats + combined chart

### Layout (top → bottom)

1. **Header** — unchanged (`h1` + subtitle)
2. **Freemium overlay** — unchanged (existing `esFreemium` block)
3. **3 stat pills** (horizontal row, flex) — replace current 2×2 grid:
   - Peso (green `#3DDC84`)
   - % Grasa (red `#FF6B6B`)
   - % Músculo (blue `#58A6FF`)
   - Each pill shows: label, current value + unit, delta vs previous (▲/▼ colored)
4. **Combined LineChart** (Recharts) — card with title "Evolución":
   - Data: `metricas` array reversed to chronological order, X axis = formatted date label (`"d MMM"` via `toLocaleDateString`)
   - **Y axis normalization:** each series is converted to % change relative to the first data point so that kg, % grasa, and % músculo can share a single Y axis. Formula: `((value - baseline) / baseline) * 100`
   - 3 `<Line>` components: peso (`#3DDC84`), porcentaje_grasa (`#FF6B6B`), porcentaje_musculo (`#58A6FF`)
   - Recharts config: `ResponsiveContainer width="100%" height={160}`, no grid lines, custom `dot={false}`, thin `strokeWidth={2}`, tooltip shows actual values (not normalized) formatted as `"X kg"`, `"X%"`, `"X%"`
   - Hide chart entirely if `metricas.length < 2` (need at least 2 points to show a line)
5. **History list** — unchanged (existing implementation)

### Empty state

Unchanged: "Sin métricas registradas" card with follow-up message.

### Loading state

Replace with: a row of 3 skeleton pills + one tall skeleton card for the chart area (same `animate-pulse` style).

---

## Task 3 — Lecciones: replace modal with bottom sheet + react-markdown

### Bottom sheet component (inline in `Lecciones.jsx`, no separate file)

**Structure:**
```
fixed bottom-0 inset-x-0 z-50
  └── backdrop: fixed inset-0 bg-black/60 (click to close)
  └── sheet panel: bg-[#161B22] border-t border-[#2D3748] rounded-t-2xl
        max-h-[85vh] flex flex-col
        translate-y animation: closed = translate-y-full, open = translate-y-0
        transition-transform duration-300 ease-out
        ├── handle bar (w-10 h-1 bg-[#2D3748] mx-auto mt-3 mb-4 rounded-full)
        ├── header: chip "LECCIÓN X" + title + ✕ close button
        ├── scrollable body (overflow-y-auto flex-1 px-5 pb-2)
        │     └── <ReactMarkdown> with custom components (see below)
        └── sticky footer: "Marcar como completada ✓" button (existing logic)
```

**Markdown component overrides** (passed as `components` prop to `ReactMarkdown`):

| Element | Style |
|---------|-------|
| `h1`, `h2` | `text-white font-bold font-display text-base mt-4 mb-2` |
| `h3` | `text-white font-semibold text-sm mt-3 mb-1` |
| `p` | `text-[#7D8590] text-sm leading-relaxed mb-3` |
| `strong` | `text-white font-semibold` |
| `ul` | `list-disc list-inside text-[#7D8590] text-sm mb-3 space-y-1` |
| `ol` | `list-decimal list-inside text-[#7D8590] text-sm mb-3 space-y-1` |
| `blockquote` | `border-l-2 border-[#3DDC84] pl-3 my-3 text-[#A8D8C0] text-sm italic` |
| `code` | `bg-[#1C2330] text-[#3DDC84] px-1.5 py-0.5 rounded text-xs font-mono` |

**Open/close behavior:**
- `activa !== null` → sheet is open (existing state already controls this)
- Backdrop click → `setActiva(null)`
- ✕ button → `setActiva(null)`
- Body scroll lock: add `overflow-hidden` to `document.body` when sheet opens, remove on close (via `useEffect` watching `activa`)

**Replace** the existing `{activa && (...)}` modal block with the bottom sheet block. All other logic (`marcarCompletada`, `estaDesbloqueada`, seed, etc.) stays unchanged.

---

## Files changed

| File | Action |
|------|--------|
| `package.json` / `package-lock.json` | Add `recharts`, `react-markdown` |
| `src/pages/Progreso.jsx` | Replace grid + add LineChart |
| `src/pages/Lecciones.jsx` | Replace modal with bottom sheet + ReactMarkdown |

No new files. No DB changes. No routing changes.

---

## Verification

1. `npm run build` — zero errors after install
2. `/progreso` (demo/premium user): stat pills show current values + deltas; chart renders with 3 colored lines; history list unchanged
3. `/progreso` (freemium user): overlay blocks content as before
4. `/lecciones`: click an unlocked lesson → bottom sheet slides up; lesson content renders with markdown formatting; "Marcar como completada" works; backdrop click closes sheet
5. Body scroll is locked while sheet is open
