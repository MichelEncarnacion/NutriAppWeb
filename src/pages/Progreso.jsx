// src/pages/Progreso.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

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

    const ultima = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || ultima[campo] == null || segunda[campo] == null) return null;
        const d = (ultima[campo] - segunda[campo]).toFixed(1);
        return { valor: d, positivo: Number(d) > 0 };
    };

    const CAMPOS = [
        { key: "peso", label: "Peso", unit: "kg", bueno: false },
        { key: "porcentaje_grasa", label: "% Grasa", unit: "%", bueno: false },
        { key: "porcentaje_musculo", label: "% Músculo", unit: "%", bueno: true },
        { key: "calorias_consumidas", label: "Calorías", unit: "kcal", bueno: true },
    ];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl relative">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Progreso</h1>
                    <p className="text-[#7D8590] text-xs">Seguimiento de tus métricas corporales a lo largo del tiempo</p>
                </div>

                {/* Overlay bloqueante para Freemium */}
                {esFreemium && (
                    <div className="absolute inset-0 z-10 bg-[#0D1117]/90 rounded-xl flex flex-col items-center justify-center gap-5 p-8 text-center min-h-[400px]">
                        <span className="text-5xl">📊</span>
                        <h2 className="text-white text-xl font-bold font-display">Tu progreso, protegido</h2>
                        <p className="text-[#7D8590] text-sm leading-relaxed max-w-xs">
                            Con Premium puedes ver tus métricas históricas, gráficas de peso, % grasa y músculo a lo largo del tiempo.
                        </p>
                        <button className="px-6 py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm">
                            Hazte Premium ✨
                        </button>
                    </div>
                )}

                {/* Tarjetas de métricas */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-32 animate-pulse" />)}
                    </div>
                ) : !ultima ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📊</span>
                        <p className="text-white font-bold mb-2">Sin métricas registradas</p>
                        <p className="text-[#7D8590] text-sm">Completa tu primer formulario de seguimiento para ver tu progreso.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {CAMPOS.map((c) => {
                            if (ultima[c.key] == null) return null;
                            const d = delta(c.key);
                            const mejora = d ? (c.bueno ? d.positivo : !d.positivo) : null;
                            return (
                                <div key={c.key} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[9px] text-[#7D8590] font-bold tracking-widest">{c.label.toUpperCase()}</p>
                                        {d && (
                                            <span className={`text-xs font-bold font-display ${mejora ? "text-[#3DDC84]" : "text-[#FF6B6B]"}`}>
                                                {Number(d.valor) > 0 ? "+" : ""}{d.valor}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-display font-black text-2xl text-white mb-3">
                                        {ultima[c.key]}
                                        <span className="text-sm text-[#7D8590] font-normal"> {c.unit}</span>
                                    </div>
                                    {/* Mini sparkline */}
                                    <div className="flex gap-0.5 items-end h-8">
                                        {metricas.slice().reverse().map((m, i) => m[c.key] != null && (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-sm"
                                                style={{
                                                    height: `${Math.max(10, (m[c.key] / Math.max(...metricas.map((x) => x[c.key] ?? 0))) * 100)}%`,
                                                    background: i === metricas.length - 1 ? "#3DDC84" : "rgba(61,220,132,.3)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Historial */}
                {metricas.length > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <h3 className="text-white font-bold font-display text-sm mb-4">Historial de registros</h3>
                        <div className="flex flex-col divide-y divide-[#2D3748]">
                            {metricas.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 text-sm flex-wrap">
                                    <span className="text-[#7D8590] text-xs w-20 flex-shrink-0">
                                        {new Date(m.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                                    </span>
                                    {m.peso != null && <span className="text-white font-semibold">{m.peso} kg</span>}
                                    {m.porcentaje_grasa != null && <span className="text-[#7D8590]">Grasa: {m.porcentaje_grasa}%</span>}
                                    {m.porcentaje_musculo != null && <span className="text-[#7D8590]">Músculo: {m.porcentaje_musculo}%</span>}
                                    {i === 0 && <span className="ml-auto text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-0.5 rounded-full">ACTUAL</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
