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
