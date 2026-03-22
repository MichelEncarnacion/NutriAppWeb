// src/pages/Lecciones.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

const CAT_COLOR = {
    nutricion: { bg: "rgba(61,220,132,.12)", color: "#3DDC84", label: "Nutrición" },
    habitos: { bg: "rgba(88,166,255,.12)", color: "#58A6FF", label: "Hábitos" },
    recetas: { bg: "rgba(240,165,0,.12)", color: "#F0A500", label: "Recetas" },
    ejercicio: { bg: "rgba(168,85,247,.12)", color: "#A855F7", label: "Ejercicio" },
};

export default function Lecciones() {
    const { session, esPremium } = useAuth();
    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({});
    const [activa, setActiva] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const { data: lecs } = await supabase
                .from("lecciones")
                .select("*")
                .eq("publicada", true)
                .order("numero");

            const { data: prog } = await supabase
                .from("lecciones_progreso")
                .select("leccion_id, completada")
                .eq("usuario_id", session.user.id);

            const map = {};
            (prog ?? []).forEach((p) => { map[p.leccion_id] = p.completada; });

            setLecciones(lecs ?? []);
            setProgreso(map);
            setLoading(false);
        };
        cargar();
    }, []);

    const marcarCompletada = async (leccionId) => {
        setProgreso((p) => ({ ...p, [leccionId]: true }));
        await supabase.from("lecciones_progreso").upsert(
            { usuario_id: session.user.id, leccion_id: leccionId, completada: true },
            { onConflict: "usuario_id,leccion_id" }
        );
    };

    const completadas = Object.values(progreso).filter(Boolean).length;
    const total = lecciones.length;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Lecciones</h1>
                    <p className="text-[#7D8590] text-xs">
                        Aprende los fundamentos de la nutrición a tu ritmo
                    </p>
                </div>

                {/* Progreso general */}
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
                            const completada = progreso[lec.id] ?? false;
                            const desbloqueada = esPremium || idx === 0 || progreso[lecciones[idx - 1]?.id];
                            const cat = CAT_COLOR[lec.categoria] ?? CAT_COLOR.nutricion;

                            return (
                                <div
                                    key={lec.id}
                                    onClick={() => desbloqueada && setActiva(lec)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all
                    ${desbloqueada ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#3DDC84]" : "opacity-50 cursor-not-allowed"}
                    ${completada ? "border-[rgba(61,220,132,.3)]" : "border-[#2D3748]"}`}
                                >
                                    {/* Número / check */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm flex-shrink-0 transition-all
                      ${completada ? "bg-[#3DDC84] text-black" : "bg-[#1C2330] text-[#7D8590] border border-[#2D3748]"}`}
                                    >
                                        {completada ? "✓" : lec.numero}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: cat.bg, color: cat.color }}
                                            >
                                                {cat.label.toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-[#7D8590]">
                                                {lec.duracion_mins} min
                                            </span>
                                            {!desbloqueada && (
                                                <span className="text-[10px] text-[#F0A500] font-bold">🔒 Bloqueada</span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-semibold ${completada ? "text-[#7D8590]" : "text-white"}`}>
                                            {lec.titulo}
                                        </p>
                                        {lec.descripcion && (
                                            <p className="text-xs text-[#7D8590] mt-0.5 truncate">{lec.descripcion}</p>
                                        )}
                                    </div>

                                    {/* Flecha */}
                                    {desbloqueada && (
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
                                <p className="text-xs text-[#3DDC84] font-bold mb-1">LECCIÓN {activa.numero}</p>
                                <h2 className="text-white font-bold font-display text-lg">{activa.titulo}</h2>
                            </div>
                            <button onClick={() => setActiva(null)} className="text-[#7D8590] hover:text-white text-xl">✕</button>
                        </div>

                        <div
                            className="prose-sm text-[#7D8590] text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: activa.contenido_html ?? `<p>${activa.descripcion ?? "Contenido próximamente."}</p>` }}
                        />

                        {!progreso[activa.id] && (
                            <button
                                onClick={() => { marcarCompletada(activa.id); setActiva(null); }}
                                className="w-full py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
                            >
                                Marcar como completada ✓
                            </button>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
