// src/pages/Lecciones.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Lecciones() {
    const { session, perfil } = useAuth();
    const uid = session?.user?.id;
    const esSoloPremium = perfil?.tipo_usuario === "premium";

    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({}); // { leccion_id: { estado, fecha_disponible } }
    const [activa, setActiva] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            if (!uid || !perfil) return; // wait until both are loaded
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
    }, [uid, esSoloPremium, perfil]); // add perfil to deps

    const marcarCompletada = async (leccion) => {
        const { error: e1 } = await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: leccion.id,
            estado: "completada",
            fecha_completada: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });

        if (e1) {
            console.error("Error al marcar lección como completada:", e1);
            return; // Don't update local state if DB write failed
        }

        // Desbloquear siguiente lección
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

            if (e2) {
                console.error("Error al desbloquear siguiente lección:", e2);
            }

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
            // Verificar si la fecha_disponible ya pasó
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

                {/* Progreso general */}
                {!loading && total > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#7D8590]">Tu progreso general</span>
                                <span className="text-[#3DDC84] font-bold font-display">{completadas}/{total} completadas</span>
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

                {/* Lista de lecciones */}
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
                        {lecciones.map((lec, idx) => {
                            const p = progreso[lec.id];
                            const completada = p?.estado === "completada";
                            const desbloqueada = estaDesbloqueada(lec);
                            const diasRestantes = p?.fecha_disponible
                                ? Math.max(0, Math.ceil((new Date(p.fecha_disponible) - new Date()) / 86400000))
                                : null;

                            return (
                                <div
                                    key={lec.id}
                                    onClick={() => desbloqueada && !completada && setActiva(lec)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all
                                        ${desbloqueada && !completada ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#3DDC84]" : ""}
                                        ${completada ? "border-[rgba(61,220,132,.3)] opacity-80 cursor-default" : "border-[#2D3748]"}
                                        ${!desbloqueada && !completada ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {/* Número / estado */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm flex-shrink-0
                                        ${completada ? "bg-[#3DDC84] text-black" : "bg-[#1C2330] text-[#7D8590] border border-[#2D3748]"}`}>
                                        {completada ? "✓" : desbloqueada ? lec.orden : "🔒"}
                                    </div>

                                    {/* Info */}
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

            {/* Modal de lección activa */}
            {activa && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#3DDC84] font-bold mb-1">LECCIÓN {activa.orden}</p>
                                <h2 className="text-white font-bold font-display text-lg">{activa.titulo}</h2>
                            </div>
                            <button onClick={() => setActiva(null)} className="text-[#7D8590] hover:text-white text-xl">✕</button>
                        </div>

                        <div className="text-[#7D8590] text-sm leading-relaxed whitespace-pre-wrap">
                            {activa.contenido}
                        </div>

                        <button
                            onClick={() => marcarCompletada(activa)}
                            className="w-full py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
                        >
                            Marcar como completada ✓
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}

async function seedLecciones(lecciones, esSoloPremium, uid) {
    if (esSoloPremium) {
        // Premium: todas disponibles inmediatamente (upsert para evitar errores en seed parcial)
        const rows = lecciones.map((l) => ({
            perfil_id: uid,
            leccion_id: l.id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }));
        await supabase.from("lecciones_usuario").upsert(rows, { onConflict: "perfil_id,leccion_id" });
    } else {
        // Demo/Freemium: solo primera lección disponible
        await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: lecciones[0].id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });
    }
}
