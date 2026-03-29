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
    const { session } = useAuth();
    const uid = session?.user?.id;

    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;

        const cargar = async () => {
            try {
                const { data, error } = await supabase
                    .from("metricas")
                    .select("fecha, peso, porcentaje_grasa, porcentaje_musculo")
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
    }, [uid]);

    const ultima  = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || ultima[campo] == null || segunda[campo] == null) return null;
        const d = parseFloat((ultima[campo] - segunda[campo]).toFixed(1));
        if (d === 0) return null;
        return { valor: d, positivo: d > 0 };
    };

    // Normalize to % change from baseline so all 3 series share one Y axis
    const chartData = (() => {
        if (metricas.length < 2) return [];
        const cronologico = [...metricas].reverse(); // oldest first
        const base = cronologico[0];
        return cronologico.map((m) => ({
            fecha: new Date(m.fecha + "T00:00:00").toLocaleDateString("es-MX", {
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
                                    {STAT_PILLS.map((s) => (
                                        <div key={s.key} className="flex items-center gap-1.5">
                                            <div className="w-4 h-0.5 rounded-full" style={{ background: s.color }} />
                                            <span className="text-[10px] text-[#7D8590]">{s.label}</span>
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
                                        <Tooltip content={ChartTooltip} />
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
                                <div key={m.fecha} className="flex items-center gap-4 py-3 text-sm flex-wrap">
                                    <span className="text-[#7D8590] text-xs w-20 flex-shrink-0">
                                        {new Date(m.fecha + "T00:00:00").toLocaleDateString("es-MX", {
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
