// src/pages/Lecciones.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import { track, Events } from "../lib/analytics";

// ─── Parsea el markdown en slides individuales ───────────────────────────────
function parsearSlides(contenido) {
    if (!contenido?.trim()) return [];

    const bloques = contenido.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

    const slides = [];
    let buffer = null;

    for (const bloque of bloques) {
        const esHeading = /^#{1,3}\s/.test(bloque);

        if (esHeading) {
            if (buffer) slides.push(buffer);
            buffer = { tipo: detectarTipo(bloque), texto: bloque };
        } else {
            if (!buffer) {
                buffer = { tipo: detectarTipo(bloque), texto: bloque };
            } else {
                // Si el bloque actual encaja con el buffer, lo adjunto
                const tipoActual = detectarTipo(bloque);
                if (buffer.tipo === tipoActual && buffer.texto.length < 300) {
                    buffer.texto += "\n\n" + bloque;
                } else {
                    slides.push(buffer);
                    buffer = { tipo: tipoActual, texto: bloque };
                }
            }
        }

        // Flush si el buffer ya es largo
        if (buffer && buffer.texto.length > 500) {
            slides.push(buffer);
            buffer = null;
        }
    }

    if (buffer) slides.push(buffer);
    return slides;
}

function detectarTipo(texto) {
    if (/^#{1,3}\s/.test(texto)) return "heading";
    if (/^>/.test(texto)) return "callout";
    if (/^[-*]\s/.test(texto) || /^\d+\.\s/.test(texto)) return "lista";
    return "texto";
}

// ─── Renders un slide individual ─────────────────────────────────────────────
function RenderSlide({ slide }) {
    const lineas = slide.texto.split("\n");

    if (slide.tipo === "heading") {
        const heading = lineas[0].replace(/^#{1,3}\s/, "");
        const cuerpo = lineas.slice(1).join("\n").trim();
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="w-8 h-[3px] rounded-full" style={{ background: "linear-gradient(90deg, #3DDC84, #58A6FF)" }} />
                    <h2 className="font-black font-display text-white leading-[1.15]" style={{ fontSize: "1.85rem", letterSpacing: "-0.02em" }}>
                        {heading}
                    </h2>
                </div>
                {cuerpo && (
                    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <RenderTexto texto={cuerpo} />
                    </div>
                )}
            </div>
        );
    }

    if (slide.tipo === "callout") {
        const texto = slide.texto.replace(/^>\s?/gm, "").trim();
        return (
            <div className="rounded-2xl p-5 flex flex-col gap-3"
                style={{
                    background: "linear-gradient(135deg, rgba(61,220,132,0.07), rgba(88,166,255,0.04))",
                    border: "1px solid rgba(61,220,132,0.22)",
                    boxShadow: "0 0 30px rgba(61,220,132,0.06) inset",
                }}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span className="text-[10px] font-black font-display tracking-[0.18em]" style={{ color: "#3DDC84" }}>DATO CLAVE</span>
                </div>
                <p className="text-white text-[1rem] leading-[1.75] font-medium">{texto}</p>
            </div>
        );
    }

    if (slide.tipo === "lista") {
        const items = lineas
            .map(l => l.replace(/^[-*]\s|\d+\.\s/, "").trim())
            .filter(Boolean);
        return (
            <div className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start rounded-xl p-3.5 transition-colors"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-display text-[11px]"
                            style={{ background: "rgba(61,220,132,0.15)", color: "#3DDC84", marginTop: "1px" }}>
                            {i + 1}
                        </div>
                        <p className="text-[#C9D1D9] text-[0.9rem] leading-[1.7] flex-1">{item}</p>
                    </div>
                ))}
            </div>
        );
    }

    // texto
    return (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <RenderTexto texto={slide.texto} />
        </div>
    );
}

function RenderTexto({ texto }) {
    const partes = texto.split(/(\*\*[^*]+\*\*)/g);
    const renderPartes = partes.map((p, i) => {
        if (/^\*\*[^*]+\*\*$/.test(p)) {
            return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
        }
        return <span key={i}>{p}</span>;
    });
    return (
        <p className="text-[#9CA3AF] leading-[1.9] text-[0.95rem]">{renderPartes}</p>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Lecciones() {
    const { session, perfil, esPremium } = useAuth();
    const uid = session?.user?.id;
    const esSoloPremium = esPremium;

    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({});
    const [activa, setActiva] = useState(null);
    const [sheetMounted, setSheetMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [slides, setSlides] = useState([]);
    const [slideIdx, setSlideIdx] = useState(0);
    const [animDir, setAnimDir] = useState(0); // -1 atrás, 1 adelante
    const [animKey, setAnimKey] = useState(0);
    const touchStartX = useRef(null);

    useEffect(() => {
        if (activa) {
            document.body.style.overflow = "hidden";
            const parsed = parsearSlides(activa.contenido);
            setSlides(parsed.length > 0 ? parsed : [{ tipo: "texto", texto: activa.contenido }]);
            setSlideIdx(0);
            setAnimDir(0);
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
        track(Events.LECCION_COMPLETADA, { leccion_id: leccion.id, titulo: leccion.titulo });
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
        if (p.estado === "disponible") return !p.fecha_disponible || new Date(p.fecha_disponible) <= new Date();
        return false;
    };

    const irSlide = (dir) => {
        const siguiente = slideIdx + dir;
        if (siguiente < 0 || siguiente >= slides.length) return;
        setAnimDir(dir);
        setAnimKey(k => k + 1);
        setSlideIdx(siguiente);
    };

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) irSlide(diff > 0 ? 1 : -1);
        touchStartX.current = null;
    };

    const completadas = Object.values(progreso).filter((p) => p?.estado === "completada").length;
    const total = lecciones.length;
    const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
    const esUltimoSlide = slideIdx === slides.length - 1;

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
                        <div className="flex justify-between mt-1.5 px-0.5">
                            {lecciones.map((lec) => {
                                const p = progreso[lec.id];
                                const done = p?.estado === "completada";
                                return <div key={lec.id} className="w-1 h-1 rounded-full" style={{ background: done ? "#3DDC84" : "#2D3748" }} />;
                            })}
                        </div>
                    </div>
                )}

                {/* Lessons list */}
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
                        {lecciones.map((lec) => {
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
                                    onClick={() => { if (disponible) { setActiva(lec); track(Events.LECCION_ABIERTA, { leccion_id: lec.id, titulo: lec.titulo }); } }}
                                    className="relative overflow-hidden rounded-2xl border transition-all duration-200"
                                    style={{
                                        background: completada ? "rgba(22,27,34,0.6)" : disponible ? "#161B22" : "rgba(22,27,34,0.4)",
                                        borderColor: completada ? "rgba(61,220,132,0.15)" : disponible ? "#2D3748" : "rgba(45,55,72,0.4)",
                                        cursor: disponible ? "pointer" : "default",
                                        opacity: bloqueada ? 0.5 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        if (disponible) { e.currentTarget.style.borderColor = "#3DDC84"; e.currentTarget.style.transform = "translateY(-1px)"; }
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = completada ? "rgba(61,220,132,0.15)" : "#2D3748";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display font-black select-none pointer-events-none"
                                        style={{ fontSize: "4.5rem", lineHeight: 1, color: completada ? "rgba(61,220,132,0.06)" : "rgba(255,255,255,0.03)", letterSpacing: "-0.05em" }}>
                                        {num}
                                    </span>
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                                        style={{ background: completada ? "rgba(61,220,132,0.4)" : disponible ? "#3DDC84" : "rgba(45,55,72,0.6)" }} />
                                    <div className="flex items-center gap-4 px-5 py-4 pl-6">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-xs"
                                            style={{
                                                background: completada ? "rgba(61,220,132,0.15)" : disponible ? "rgba(61,220,132,0.1)" : "rgba(45,55,72,0.4)",
                                                border: completada ? "1px solid rgba(61,220,132,0.3)" : disponible ? "1px solid rgba(61,220,132,0.2)" : "1px solid rgba(45,55,72,0.5)",
                                                color: completada ? "#3DDC84" : disponible ? "#3DDC84" : "#4A5568",
                                            }}>
                                            {completada ? "✓" : bloqueada ? "🔒" : lec.orden}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold leading-tight"
                                                style={{ color: completada ? "#7D8590" : bloqueada ? "#4A5568" : "#E6EDF3" }}>
                                                {lec.titulo}
                                            </p>
                                            <p className="text-[10px] mt-0.5 font-medium" style={{
                                                color: completada ? "rgba(61,220,132,0.7)" : bloqueada && diasRestantes ? "#F0A500" : "#4A5568"
                                            }}>
                                                {completada ? "Completada"
                                                    : bloqueada && diasRestantes && diasRestantes > 0 ? `Disponible en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`
                                                        : disponible ? "Disponible ahora" : ""}
                                            </p>
                                        </div>
                                        {disponible && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                                                style={{ background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>→</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Lección modal estilo Duolingo ──────────────────────────── */}
            {activa && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
                        onClick={() => setActiva(null)}
                    />

                    {/* Sheet */}
                    <div
                        className="fixed bottom-0 inset-x-0 z-50 flex flex-col rounded-t-3xl transition-transform duration-300 ease-out"
                        style={{
                            background: "#0D1117",
                            borderTop: "1px solid rgba(61,220,132,0.15)",
                            height: "88vh",
                            transform: sheetMounted ? "translateY(0)" : "translateY(100%)",
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-8 h-1 rounded-full" style={{ background: "rgba(61,220,132,0.3)" }} />
                        </div>

                        {/* Top bar: título + cerrar + dots */}
                        <div className="px-5 pt-2 pb-3 flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black font-display tracking-[0.18em] px-2 py-0.5 rounded-full"
                                        style={{ background: "rgba(61,220,132,0.1)", color: "#3DDC84", border: "1px solid rgba(61,220,132,0.2)" }}>
                                        LECCIÓN {activa.orden}
                                    </span>
                                    <span className="text-[10px] text-[#4A5568] font-medium">
                                        {slideIdx + 1} / {slides.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setActiva(null)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs"
                                    style={{ background: "rgba(255,255,255,0.05)", color: "#7D8590" }}
                                >✕</button>
                            </div>

                            {/* Progress dots */}
                            <div className="flex gap-1.5">
                                {slides.map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            height: "3px",
                                            flex: i === slideIdx ? "2" : "1",
                                            background: i < slideIdx ? "#3DDC84" : i === slideIdx ? "#3DDC84" : "rgba(45,55,72,0.8)",
                                            opacity: i < slideIdx ? 0.5 : 1,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Slide content */}
                        <div className="flex-1 overflow-y-auto px-5 pb-2 flex flex-col justify-center">
                            {/* Título de la lección en primer slide */}
                            {slideIdx === 0 && (
                                <div className="mb-5 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3DDC84" }} />
                                    <p className="text-[#3DDC84] font-black font-display text-xs tracking-[0.15em] uppercase">
                                        {activa.titulo}
                                    </p>
                                </div>
                            )}

                            {slides.length > 0 && (
                                <div
                                    key={animKey}
                                    style={{
                                        animation: `slideIn${animDir >= 0 ? "Right" : "Left"} 0.25s ease-out both`,
                                    }}
                                >
                                    <RenderSlide slide={slides[slideIdx]} />
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="px-5 pb-6 pt-3 flex-shrink-0 flex flex-col gap-3"
                            style={{ borderTop: "1px solid rgba(45,55,72,0.4)" }}>

                            {esUltimoSlide ? (
                                <button
                                    onClick={() => marcarCompletada(activa)}
                                    className="w-full py-3.5 font-bold font-display rounded-2xl text-sm transition-all duration-200"
                                    style={{
                                        background: "linear-gradient(135deg, #3DDC84, #2bc96e)",
                                        color: "#0D1117",
                                        boxShadow: "0 4px 20px rgba(61,220,132,0.3)",
                                    }}
                                >
                                    ¡Completar lección! 🎉
                                </button>
                            ) : (
                                <button
                                    onClick={() => irSlide(1)}
                                    className="w-full py-3.5 font-bold font-display rounded-2xl text-sm transition-all duration-200"
                                    style={{
                                        background: "rgba(61,220,132,0.1)",
                                        color: "#3DDC84",
                                        border: "1px solid rgba(61,220,132,0.2)",
                                    }}
                                >
                                    Siguiente →
                                </button>
                            )}

                            {slideIdx > 0 && (
                                <button
                                    onClick={() => irSlide(-1)}
                                    className="text-[#4A5568] text-xs text-center font-medium py-1 transition-colors hover:text-[#7D8590]"
                                >
                                    ← Anterior
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CSS animations */}
                    <style>{`
                        @keyframes slideInRight {
                            from { opacity: 0; transform: translateX(28px); }
                            to   { opacity: 1; transform: translateX(0); }
                        }
                        @keyframes slideInLeft {
                            from { opacity: 0; transform: translateX(-28px); }
                            to   { opacity: 1; transform: translateX(0); }
                        }
                    `}</style>
                </>
            )}
        </Layout>
    );
}

async function seedLecciones(lecciones, esSoloPremium, uid) {
    if (esSoloPremium) {
        const rows = lecciones.map((l) => ({
            perfil_id: uid, leccion_id: l.id,
            estado: "disponible", fecha_disponible: new Date().toISOString(),
        }));
        await supabase.from("lecciones_usuario").upsert(rows, { onConflict: "perfil_id,leccion_id" });
    } else {
        await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid, leccion_id: lecciones[0].id,
            estado: "disponible", fecha_disponible: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });
    }
}
