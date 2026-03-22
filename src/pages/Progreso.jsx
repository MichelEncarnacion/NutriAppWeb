// src/pages/Progreso.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Progreso() {
    const { session } = useAuth();
    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const { data } = await supabase
                .rpc("get_metricas_usuario", { p_usuario_id: session.user.id, p_limite: 10 });
            setMetricas(data ?? []);
            setLoading(false);
        };
        cargar();
    }, []);

    const ultima = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || !ultima[campo] || !segunda[campo]) return null;
        const d = (ultima[campo] - segunda[campo]).toFixed(1);
        return { valor: d, positivo: Number(d) > 0 };
    };

    const CAMPOS = [
        { key: "peso_kg", label: "Peso", unit: "kg", bueno: false },
        { key: "pct_grasa", label: "% Grasa", unit: "%", bueno: false },
        { key: "pct_musculo", label: "% Músculo", unit: "%", bueno: true },
        { key: "pct_agua", label: "Agua corporal", unit: "%", bueno: true },
    ];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Progreso</h1>
                    <p className="text-[#7D8590] text-xs">Seguimiento de tus métricas corporales a lo largo del tiempo</p>
                </div>

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
                            const d = delta(c.key);
                            const mejora = d ? (c.bueno ? d.positivo : !d.positivo) : null;
                            return ultima[c.key] ? (
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
                                        {metricas.slice().reverse().map((m, i) => m[c.key] && (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-sm"
                                                style={{
                                                    height: `${Math.max(10, (m[c.key] / (Math.max(...metricas.map(x => x[c.key] ?? 0)))) * 100)}%`,
                                                    background: i === metricas.length - 1 ? "#3DDC84" : "rgba(61,220,132,.3)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null;
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
                                    {m.peso_kg && <span className="text-white font-semibold">{m.peso_kg} kg</span>}
                                    {m.pct_grasa && <span className="text-[#7D8590]">Grasa: {m.pct_grasa}%</span>}
                                    {m.pct_musculo && <span className="text-[#7D8590]">Músculo: {m.pct_musculo}%</span>}
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
