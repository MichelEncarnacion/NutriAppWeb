// src/pages/Lecciones.jsx
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Lecciones() {
    const { session, perfil, esPremium } = useAuth();
    const uid = session?.user?.id;
    const esSoloPremium = esPremium;

    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({});
    const [activa, setActiva] = useState(null);
    const [sheetMounted, setSheetMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activa) {
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => setSheetMounted(true));
        } else {
            document.body.style.overflow = "";
            setSheetMounted(false);
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

                if (e1 || e2) console.error("Lecciones fetch errors:", { e1, e2 });

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

        if (e1) { console.error("Error al marcar lección:", e1); return; }

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

            if (e2) console.error("Error al desbloquear siguiente:", e2);

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
    const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return (
        <Layout>
            <div className="flex flex-col gap-6 max-w-2xl">

                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#3DDC84] mb-1 font-display">NUTRICIÓN</p>
                        <h1 className="text-white text-3xl font-black font-display leading-none">Lecciones</h1>
                    </div>
                    {!loading && total > 0 && (
                        <div className="text-right">
                            <span className="text-4xl font-black font-display text-[#3DDC84] leading-none">{pct}%</span>
                            <p className="text-[10px] text-[#7D8590] mt-0.5">{completadas} de {total}</p>
                        </div>
                    )}
                </div>

                {/* Progress track */}
                {!loading && total > 0 && (
                    <div className="relative">
                        <div className="h-1 bg-[#1C2330] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${pct}%`,
                                    background: "linear-gradient(90deg, #3DDC84, #58A6FF)",
                                    boxShadow: pct > 0 ? "0 0 12px rgba(61,220,132,0.4)" : "none"
                                }}
                            />
                        </div>
                        {/* Tick marks */}
                        <div className="flex justify-between mt-1.5 px-0.5">
                            {lecciones.map((lec) => {
                                const p = progreso[lec.id];
                                const done = p?.estado === "completada";
                                return (
                                    <div
                                        key={lec.id}
                                        className="w-1 h-1 rounded-full"
                                        style={{ background: done ? "#3DDC84" : "#2D3748" }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Lessons */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-2xl h-20 animate-pulse" />
                        ))}
                    </div>
                ) : lecciones.length === 0 ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-10 text-center">
                        <p className="text-5xl mb-3">📖</p>
                        <p className="text-white font-bold font-display mb-1">Próximamente</p>
                        <p className="text-[#7D8590] text-sm">Las lecciones estarán disponibles pronto.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {lecciones.map((lec, i) => {
                            const p = progreso[lec.id];
                            const completada = p?.estado === "completada";
                            const desbloqueada = estaDesbloqueada(lec);
                            const disponible = desbloqueada && !completada;
                            const bloqueada = !desbloqueada && !completada;
                            const diasRestantes = p?.fecha_disponible
                                ? Math.max(0, Math.ceil((new Date(p.fecha_disponible) - new Date()) / 86400000))
                                : null;

                            const num = String(lec.orden).padStart(2, "0");

                            return (
                                <div
                                    key={lec.id}
                                    onClick={() => disponible && setActiva(lec)}
                                    className="relative overflow-hidden rounded-2xl border transition-all duration-200"
                                    style={{
                                        background: completada
                                            ? "rgba(22,27,34,0.6)"
                                            : disponible
                                                ? "#161B22"
                                                : "rgba(22,27,34,0.4)",
                                        borderColor: completada
                                            ? "rgba(61,220,132,0.15)"
                                            : disponible
                                                ? "#2D3748"
                                                : "rgba(45,55,72,0.4)",
                                        cursor: disponible ? "pointer" : "default",
                                        opacity: bloqueada ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        if (disponible) {
                                            e.currentTarget.style.borderColor = "#3DDC84";
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = completada ? "rgba(61,220,132,0.15)" : "#2D3748";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    {/* Large background number */}
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 font-display font-black select-none pointer-events-none"
                                        style={{
                                            fontSize: "4.5rem",
                                            lineHeight: 1,
                                            color: completada ? "rgba(61,220,132,0.06)" : "rgba(255,255,255,0.03)",
                                            letterSpacing: "-0.05em",
                                        }}
                                    >
                                        {num}
                                    </span>

                                    {/* Left accent bar */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                                        style={{
                                            background: completada
                                                ? "rgba(61,220,132,0.4)"
                                                : disponible
                                                    ? "#3DDC84"
                                                    : "rgba(45,55,72,0.6)",
                                        }}
                                    />

                                    <div className="flex items-center gap-4 px-5 py-4 pl-6">
                                        {/* Status indicator */}
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-xs"
                                            style={{
                                                background: completada
                                                    ? "rgba(61,220,132,0.15)"
                                                    : disponible
                                                        ? "rgba(61,220,132,0.1)"
                                                        : "rgba(45,55,72,0.4)",
                                                border: completada
                                                    ? "1px solid rgba(61,220,132,0.3)"
                                                    : disponible
                                                        ? "1px solid rgba(61,220,132,0.2)"
                                                        : "1px solid rgba(45,55,72,0.5)",
                                                color: completada ? "#3DDC84" : disponible ? "#3DDC84" : "#4A5568",
                                            }}
                                        >
                                            {completada ? "✓" : bloqueada ? "🔒" : lec.orden}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-semibold leading-tight"
                                                style={{ color: completada ? "#7D8590" : bloqueada ? "#4A5568" : "#E6EDF3" }}
                                            >
                                                {lec.titulo}
                                            </p>
                                            <p className="text-[10px] mt-0.5 font-medium" style={{
                                                color: completada ? "rgba(61,220,132,0.7)"
                                                    : bloqueada && diasRestantes ? "#F0A500"
                                                        : "#4A5568"
                                            }}>
                                                {completada
                                                    ? "Completada"
                                                    : bloqueada && diasRestantes && diasRestantes > 0
                                                        ? `Disponible en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`
                                                        : disponible
                                                            ? "Disponible ahora"
                                                            : ""}
                                            </p>
                                        </div>

                                        {disponible && (
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                                                style={{ background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}
                                            >
                                                →
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom sheet */}
            {activa && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
                        onClick={() => setActiva(null)}
                    />

                    <div
                        className="fixed bottom-0 inset-x-0 z-50 flex flex-col rounded-t-3xl transition-transform duration-300 ease-out"
                        style={{
                            background: "#0D1117",
                            borderTop: "1px solid rgba(61,220,132,0.15)",
                            maxHeight: "88vh",
                            transform: sheetMounted ? "translateY(0)" : "translateY(100%)",
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-8 h-1 rounded-full" style={{ background: "rgba(61,220,132,0.3)" }} />
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between px-6 pt-3 pb-4 flex-shrink-0">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="text-[10px] font-black font-display tracking-[0.18em] px-2 py-0.5 rounded-full"
                                        style={{
                                            background: "rgba(61,220,132,0.1)",
                                            color: "#3DDC84",
                                            border: "1px solid rgba(61,220,132,0.2)"
                                        }}
                                    >
                                        LECCIÓN {activa.orden}
                                    </span>
                                </div>
                                <h2 className="text-white font-black font-display text-xl leading-tight">
                                    {activa.titulo}
                                </h2>
                            </div>
                            <button
                                onClick={() => setActiva(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                                style={{ background: "rgba(255,255,255,0.05)", color: "#7D8590" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#7D8590"; }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-px mx-6 flex-shrink-0" style={{ background: "rgba(45,55,72,0.6)" }} />

                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div className="max-w-lg">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                            <h2 className="font-black font-display text-white text-lg mt-6 mb-3 leading-tight first:mt-0">
                                                {children}
                                            </h2>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="font-black font-display text-white text-base mt-6 mb-3 leading-tight first:mt-0">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="font-bold text-[#E6EDF3] text-sm mt-4 mb-2 leading-tight">
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-[#8B949E] text-sm leading-[1.75] mb-4">
                                                {children}
                                            </p>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-bold text-[#E6EDF3]">{children}</strong>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="mb-4 space-y-2">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="mb-4 space-y-2 list-none counter-reset-item">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="flex gap-3 text-[#8B949E] text-sm leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#3DDC84", marginTop: "0.45em" }} />
                                                <span>{children}</span>
                                            </li>
                                        ),
                                        blockquote: ({ children }) => (
                                            <div
                                                className="my-4 px-4 py-3 rounded-xl text-sm"
                                                style={{
                                                    background: "rgba(61,220,132,0.06)",
                                                    borderLeft: "3px solid #3DDC84",
                                                }}
                                            >
                                                <span className="text-[#3DDC84] font-medium">{children}</span>
                                            </div>
                                        ),
                                        code: ({ children }) => (
                                            <code
                                                className="px-1.5 py-0.5 rounded text-xs font-mono"
                                                style={{ background: "rgba(61,220,132,0.08)", color: "#3DDC84" }}
                                            >
                                                {children}
                                            </code>
                                        ),
                                        hr: () => (
                                            <div className="my-5 h-px" style={{ background: "rgba(45,55,72,0.6)" }} />
                                        ),
                                    }}
                                >
                                    {activa.contenido}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(45,55,72,0.6)" }}>
                            <button
                                onClick={() => marcarCompletada(activa)}
                                className="w-full py-3.5 font-bold font-display rounded-2xl text-sm transition-all duration-200"
                                style={{
                                    background: "linear-gradient(135deg, #3DDC84, #2bc96e)",
                                    color: "#0D1117",
                                    boxShadow: "0 4px 20px rgba(61,220,132,0.25)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 28px rgba(61,220,132,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(61,220,132,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                Completar lección ✓
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
