# Fase 3 Close — Lecciones & Progreso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 3 by adding Recharts line chart to Progreso and replacing the lesson modal with a bottom sheet + react-markdown in Lecciones.

**Architecture:** Two independent page rewrites. Progreso gets 3 stat pills + a normalized combined LineChart (Recharts). Lecciones keeps all existing state/logic; only the modal UI block is swapped for a bottom sheet with ReactMarkdown content rendering. No new files, no DB changes, no routing changes.

**Tech Stack:** React 19, Tailwind CSS v4, Recharts, react-markdown, Supabase JS v2

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `recharts` + `react-markdown` |
| `src/pages/Progreso.jsx` | Modify | Replace 2×2 grid → 3 stat pills + Recharts LineChart |
| `src/pages/Lecciones.jsx` | Modify | Replace modal → bottom sheet + ReactMarkdown |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install both packages**

```bash
npm install recharts react-markdown
```

Expected output: `added N packages` — no errors.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts and react-markdown"
```

---

## Task 2: Rewrite Progreso.jsx

**Files:**
- Modify: `src/pages/Progreso.jsx`

Replace the 2×2 metric grid with 3 stat pills and add a Recharts combined LineChart. The query, freemium overlay, and history list stay unchanged.

- [ ] **Step 1: Replace `src/pages/Progreso.jsx` with the following**

```jsx
// src/pages/Progreso.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    Tooltip,
} from "recharts";

const STAT_PILLS = [
    { key: "peso",              label: "Peso",      unit: "kg", color: "#3DDC84", bueno: false },
    { key: "porcentaje_grasa",  label: "% Grasa",   unit: "%",  color: "#FF6B6B", bueno: false },
    { key: "porcentaje_musculo",label: "% Músculo", unit: "%",  color: "#58A6FF", bueno: true  },
];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-xs">
            <p className="text-[#7D8590] mb-1">{label}</p>
            {d?.peso != null && (
                <p className="text-[#3DDC84]">Peso: {d.peso} kg</p>
            )}
            {d?.porcentaje_grasa != null && (
                <p className="text-[#FF6B6B]">Grasa: {d.porcentaje_grasa}%</p>
            )}
            {d?.porcentaje_musculo != null && (
                <p className="text-[#58A6FF]">Músculo: {d.porcentaje_musculo}%</p>
            )}
        </div>
    );
}

export default function Progreso() {
    const { session, perfil } = useAuth();
    const uid = session?.user?.id;
    const esFreemium = perfil?.tipo_usuario === "freemium";

    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        if (esFreemium) { setLoading(false); return; }

        const cargar = async () => {
            try {
                const { data, error } = await supabase
                    .from("metricas")
                    .select("fecha, peso, porcentaje_grasa, porcentaje_musculo, calorias_consumidas, agua_ml")
                    .eq("perfil_id", uid)
                    .order("fecha", { ascending: false })
                    .limit(10);
                if (error) console.error("Progreso fetch error:", error);
                setMetricas(data ?? []);
            } catch (err) {
                console.error("Progreso load error:", err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [uid, esFreemium]);

    const ultima  = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || ultima[campo] == null || segunda[campo] == null) return null;
        const d = (ultima[campo] - segunda[campo]).toFixed(1);
        return { valor: d, positivo: Number(d) > 0 };
    };

    // Normalize to % change from baseline so all 3 series share one Y axis
    const chartData = (() => {
        if (metricas.length < 2) return [];
        const cronologico = [...metricas].reverse(); // oldest first
        const base = cronologico[0];
        return cronologico.map((m) => ({
            fecha: new Date(m.fecha).toLocaleDateString("es-MX", {
                day: "numeric", month: "short",
            }),
            peso_norm: base.peso != null && m.peso != null
                ? ((m.peso - base.peso) / base.peso) * 100 : null,
            grasa_norm: base.porcentaje_grasa != null && m.porcentaje_grasa != null
                ? ((m.porcentaje_grasa - base.porcentaje_grasa) / base.porcentaje_grasa) * 100 : null,
            musculo_norm: base.porcentaje_musculo != null && m.porcentaje_musculo != null
                ? ((m.porcentaje_musculo - base.porcentaje_musculo) / base.porcentaje_musculo) * 100 : null,
            // actual values for tooltip
            peso: m.peso,
            porcentaje_grasa: m.porcentaje_grasa,
            porcentaje_musculo: m.porcentaje_musculo,
        }));
    })();

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl relative">

                {/* Header */}
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Progreso</h1>
                    <p className="text-[#7D8590] text-xs">
                        Seguimiento de tus métricas corporales a lo largo del tiempo
                    </p>
                </div>

                {/* Freemium overlay — unchanged */}
                {esFreemium && (
                    <div className="absolute inset-0 z-10 bg-[#0D1117]/90 rounded-xl flex flex-col items-center justify-center gap-5 p-8 text-center min-h-[400px]">
                        <span className="text-5xl">📊</span>
                        <h2 className="text-white text-xl font-bold font-display">Tu progreso, protegido</h2>
                        <p className="text-[#7D8590] text-sm leading-relaxed max-w-xs">
                            Con Premium puedes ver tus métricas históricas, gráficas de peso, % grasa y
                            músculo a lo largo del tiempo.
                        </p>
                        <button className="px-6 py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm">
                            Hazte Premium ✨
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading ? (
                    <>
                        <div className="flex gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl h-20 animate-pulse" />
                            ))}
                        </div>
                        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl h-48 animate-pulse" />
                    </>

                /* Empty state */
                ) : !ultima ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📊</span>
                        <p className="text-white font-bold mb-2">Sin métricas registradas</p>
                        <p className="text-[#7D8590] text-sm">
                            Completa tu primer formulario de seguimiento para ver tu progreso.
                        </p>
                    </div>

                ) : (
                    <>
                        {/* Stat pills */}
                        <div className="flex gap-3">
                            {STAT_PILLS.map((s) => {
                                if (ultima[s.key] == null) return null;
                                const d = delta(s.key);
                                const mejora = d
                                    ? (s.bueno ? d.positivo : !d.positivo)
                                    : null;
                                return (
                                    <div key={s.key} className="flex-1 bg-[#161B22] border border-[#2D3748] rounded-xl p-3 text-center">
                                        <p className="text-[9px] text-[#7D8590] font-bold tracking-widest mb-1">
                                            {s.label.toUpperCase()}
                                        </p>
                                        <p className="font-display font-black text-lg" style={{ color: s.color }}>
                                            {ultima[s.key]}
                                            <span className="text-xs font-normal text-[#7D8590]"> {s.unit}</span>
                                        </p>
                                        {d && (
                                            <p className={`text-xs font-bold mt-0.5 ${mejora ? "text-[#3DDC84]" : "text-[#FF6B6B]"}`}>
                                                {Number(d.valor) > 0 ? "▲" : "▼"} {Math.abs(d.valor)}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Combined LineChart — only when ≥2 data points */}
                        {chartData.length >= 2 && (
                            <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                                <p className="text-[#7D8590] text-xs font-bold tracking-widest mb-3">EVOLUCIÓN</p>
                                <div className="flex gap-4 mb-3">
                                    {[
                                        { color: "#3DDC84", label: "Peso" },
                                        { color: "#FF6B6B", label: "Grasa" },
                                        { color: "#58A6FF", label: "Músculo" },
                                    ].map((l) => (
                                        <div key={l.label} className="flex items-center gap-1.5">
                                            <div className="w-4 h-0.5 rounded-full" style={{ background: l.color }} />
                                            <span className="text-[10px] text-[#7D8590]">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                                    >
                                        <XAxis
                                            dataKey="fecha"
                                            tick={{ fontSize: 10, fill: "#7D8590" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="peso_norm"
                                            stroke="#3DDC84"
                                            strokeWidth={2}
                                            dot={false}
                                            connectNulls
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="grasa_norm"
                                            stroke="#FF6B6B"
                                            strokeWidth={2}
                                            dot={false}
                                            connectNulls
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="musculo_norm"
                                            stroke="#58A6FF"
                                            strokeWidth={2}
                                            dot={false}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}

                {/* History list — unchanged */}
                {metricas.length > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <h3 className="text-white font-bold font-display text-sm mb-4">Historial de registros</h3>
                        <div className="flex flex-col divide-y divide-[#2D3748]">
                            {metricas.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 text-sm flex-wrap">
                                    <span className="text-[#7D8590] text-xs w-20 flex-shrink-0">
                                        {new Date(m.fecha).toLocaleDateString("es-MX", {
                                            day: "numeric", month: "short",
                                        })}
                                    </span>
                                    {m.peso != null && (
                                        <span className="text-white font-semibold">{m.peso} kg</span>
                                    )}
                                    {m.porcentaje_grasa != null && (
                                        <span className="text-[#7D8590]">Grasa: {m.porcentaje_grasa}%</span>
                                    )}
                                    {m.porcentaje_musculo != null && (
                                        <span className="text-[#7D8590]">Músculo: {m.porcentaje_musculo}%</span>
                                    )}
                                    {i === 0 && (
                                        <span className="ml-auto text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-0.5 rounded-full">
                                            ACTUAL
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Smoke-test in browser**

Run `npm run dev`, navigate to `/progreso` logged in as a demo/premium user. Verify:
- 3 stat pills show in a row with their respective colors (green/red/blue)
- If 2+ metric records exist: chart renders below the pills with 3 colored lines
- Hovering the chart shows a tooltip with actual values (not normalized %)
- History list is unchanged below the chart
- Freemium user sees the overlay as before

- [ ] **Step 4: Commit**

```bash
git add src/pages/Progreso.jsx
git commit -m "feat: Progreso — stat pills + Recharts combined line chart"
```

---

## Task 3: Rewrite Lecciones.jsx modal → bottom sheet + ReactMarkdown

**Files:**
- Modify: `src/pages/Lecciones.jsx`

All existing state, effects, and logic stay unchanged. Two additions: a `useEffect` for body scroll lock, and the modal block replaced with a bottom sheet.

- [ ] **Step 1: Replace `src/pages/Lecciones.jsx` with the following**

```jsx
// src/pages/Lecciones.jsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Lecciones() {
    const { session, perfil } = useAuth();
    const uid = session?.user?.id;
    const esSoloPremium = perfil?.tipo_usuario === "premium";

    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({});
    const [activa, setActiva] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lock body scroll while sheet is open
    useEffect(() => {
        if (activa) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [activa]);

    useEffect(() => {
        const cargar = async () => {
            if (!uid || !perfil) return;
            try {
                const { data: lecs, error: e1 } = await supabase
                    .from("lecciones")
                    .select("id, titulo, contenido, orden")
                    .eq("activa", true)
                    .order("orden");

                const { data: prog, error: e2 } = await supabase
                    .from("lecciones_usuario")
                    .select("leccion_id, estado, fecha_disponible, fecha_completada")
                    .eq("perfil_id", uid);

                if (e1 || e2) {
                    console.error("Lecciones fetch errors:", { e1, e2 });
                }

                const map = {};
                (prog ?? []).forEach((p) => { map[p.leccion_id] = p; });

                if ((prog ?? []).length === 0 && (lecs ?? []).length > 0) {
                    await seedLecciones(lecs, esSoloPremium, uid);
                    const { data: progAfter } = await supabase
                        .from("lecciones_usuario")
                        .select("leccion_id, estado, fecha_disponible, fecha_completada")
                        .eq("perfil_id", uid);
                    (progAfter ?? []).forEach((p) => { map[p.leccion_id] = p; });
                }

                setLecciones(lecs ?? []);
                setProgreso(map);
            } catch (err) {
                console.error("Lecciones load error:", err);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [uid, esSoloPremium, perfil]);

    const marcarCompletada = async (leccion) => {
        const { error: e1 } = await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: leccion.id,
            estado: "completada",
            fecha_completada: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });

        if (e1) {
            console.error("Error al marcar lección como completada:", e1);
            return;
        }

        const idx = lecciones.findIndex((l) => l.id === leccion.id);
        const siguiente = lecciones[idx + 1];
        if (siguiente) {
            const disponibleEn = esSoloPremium
                ? new Date().toISOString()
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            const { error: e2 } = await supabase.from("lecciones_usuario").upsert({
                perfil_id: uid,
                leccion_id: siguiente.id,
                estado: "disponible",
                fecha_disponible: disponibleEn,
            }, { onConflict: "perfil_id,leccion_id" });

            if (e2) console.error("Error al desbloquear siguiente lección:", e2);

            setProgreso((p) => ({
                ...p,
                [leccion.id]: { ...p[leccion.id], estado: "completada" },
                [siguiente.id]: { estado: "disponible", fecha_disponible: disponibleEn },
            }));
        } else {
            setProgreso((p) => ({
                ...p,
                [leccion.id]: { ...p[leccion.id], estado: "completada" },
            }));
        }

        setActiva(null);
    };

    const estaDesbloqueada = (leccion) => {
        const p = progreso[leccion.id];
        if (!p) return false;
        if (p.estado === "completada") return true;
        if (p.estado === "disponible") {
            return !p.fecha_disponible || new Date(p.fecha_disponible) <= new Date();
        }
        return false;
    };

    const completadas = Object.values(progreso).filter((p) => p?.estado === "completada").length;
    const total = lecciones.length;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">

                {/* Header */}
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Lecciones</h1>
                    <p className="text-[#7D8590] text-xs">Aprende los fundamentos de la nutrición a tu ritmo</p>
                </div>

                {/* Progress bar */}
                {!loading && total > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#7D8590]">Tu progreso general</span>
                                <span className="text-[#3DDC84] font-bold font-display">
                                    {completadas}/{total} completadas
                                </span>
                            </div>
                            <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#3DDC84] to-[#58A6FF] rounded-full transition-all duration-700"
                                    style={{ width: `${total > 0 ? (completadas / total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-2xl font-display font-black text-[#3DDC84] flex-shrink-0">
                            {total > 0 ? Math.round((completadas / total) * 100) : 0}%
                        </div>
                    </div>
                )}

                {/* Lessons list */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-24 animate-pulse" />
                        ))}
                    </div>
                ) : lecciones.length === 0 ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📖</span>
                        <p className="text-white font-bold mb-2">Próximamente</p>
                        <p className="text-[#7D8590] text-sm">Las lecciones estarán disponibles pronto.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {lecciones.map((lec) => {
                            const p = progreso[lec.id];
                            const completada = p?.estado === "completada";
                            const desbloqueada = estaDesbloqueada(lec);
                            const diasRestantes = p?.fecha_disponible
                                ? Math.max(0, Math.ceil(
                                    (new Date(p.fecha_disponible) - new Date()) / 86400000
                                  ))
                                : null;

                            return (
                                <div
                                    key={lec.id}
                                    onClick={() => desbloqueada && !completada && setActiva(lec)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all
                                        ${desbloqueada && !completada
                                            ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#3DDC84]"
                                            : ""}
                                        ${completada
                                            ? "border-[rgba(61,220,132,.3)] opacity-80 cursor-default"
                                            : "border-[#2D3748]"}
                                        ${!desbloqueada && !completada
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm flex-shrink-0
                                        ${completada
                                            ? "bg-[#3DDC84] text-black"
                                            : "bg-[#1C2330] text-[#7D8590] border border-[#2D3748]"}`}>
                                        {completada ? "✓" : desbloqueada ? lec.orden : "🔒"}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${completada ? "text-[#7D8590]" : "text-white"}`}>
                                            {lec.titulo}
                                        </p>
                                        {!desbloqueada && !completada && diasRestantes !== null && diasRestantes > 0 && (
                                            <p className="text-[10px] text-[#F0A500] mt-0.5">
                                                Disponible en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}
                                            </p>
                                        )}
                                        {completada && (
                                            <p className="text-[10px] text-[#3DDC84] mt-0.5">Completada ✓</p>
                                        )}
                                    </div>

                                    {desbloqueada && !completada && (
                                        <span className="text-[#7D8590] flex-shrink-0">→</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom sheet */}
            {activa && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={() => setActiva(null)}
                    />

                    {/* Sheet */}
                    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#161B22] border-t border-[#2D3748] rounded-t-2xl max-h-[85vh] flex flex-col translate-y-0 transition-transform duration-300 ease-out">

                        {/* Handle */}
                        <div className="w-10 h-1 bg-[#2D3748] mx-auto mt-3 mb-2 rounded-full flex-shrink-0" />

                        {/* Header */}
                        <div className="flex justify-between items-start px-5 py-3 flex-shrink-0">
                            <div>
                                <span className="text-[10px] font-bold text-[#3DDC84] tracking-widest">
                                    LECCIÓN {activa.orden}
                                </span>
                                <h2 className="text-white font-bold font-display text-lg leading-tight">
                                    {activa.titulo}
                                </h2>
                            </div>
                            <button
                                onClick={() => setActiva(null)}
                                className="text-[#7D8590] hover:text-white text-xl ml-4 flex-shrink-0"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-5 pb-2">
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => (
                                        <h2 className="text-white font-bold font-display text-base mt-4 mb-2">{children}</h2>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-white font-bold font-display text-base mt-4 mb-2">{children}</h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-white font-semibold text-sm mt-3 mb-1">{children}</h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="text-[#7D8590] text-sm leading-relaxed mb-3">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="text-white font-semibold">{children}</strong>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside text-[#7D8590] text-sm mb-3 space-y-1">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside text-[#7D8590] text-sm mb-3 space-y-1">{children}</ol>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-[#3DDC84] pl-3 my-3 text-[#A8D8C0] text-sm italic">
                                            {children}
                                        </blockquote>
                                    ),
                                    code: ({ children }) => (
                                        <code className="bg-[#1C2330] text-[#3DDC84] px-1.5 py-0.5 rounded text-xs font-mono">
                                            {children}
                                        </code>
                                    ),
                                }}
                            >
                                {activa.contenido}
                            </ReactMarkdown>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 flex-shrink-0 border-t border-[#2D3748]">
                            <button
                                onClick={() => marcarCompletada(activa)}
                                className="w-full py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
                            >
                                Marcar como completada ✓
                            </button>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
}

async function seedLecciones(lecciones, esSoloPremium, uid) {
    if (esSoloPremium) {
        const rows = lecciones.map((l) => ({
            perfil_id: uid,
            leccion_id: l.id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }));
        await supabase.from("lecciones_usuario").upsert(rows, { onConflict: "perfil_id,leccion_id" });
    } else {
        await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: lecciones[0].id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });
    }
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 3: Smoke-test in browser**

Run `npm run dev`, navigate to `/lecciones`. Verify:
- Lesson list renders as before (locked/unlocked/completed states)
- Clicking an unlocked lesson → bottom sheet slides up from the bottom
- Lesson content renders with markdown formatting (headings in white, body text in gray, bold in white, blockquotes with green left border)
- Backdrop click closes the sheet
- ✕ button closes the sheet
- Page behind does NOT scroll while sheet is open
- "Marcar como completada ✓" button works and closes the sheet

- [ ] **Step 4: Commit**

```bash
git add src/pages/Lecciones.jsx
git commit -m "feat: Lecciones — bottom sheet reader + react-markdown rendering"
```

---

## Final verification

- [ ] Run `npm run build` one last time — confirm zero errors
- [ ] `/progreso` (premium/demo): pills + chart visible; tooltip shows actual values; history unchanged
- [ ] `/progreso` (freemium): overlay still blocks content
- [ ] `/lecciones`: bottom sheet opens/closes smoothly; markdown renders correctly; completion flow works
