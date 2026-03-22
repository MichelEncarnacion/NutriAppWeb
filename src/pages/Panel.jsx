// src/pages/Panel.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Panel() {
    const { session, perfil } = useAuth();
    const [resumen, setResumen] = useState(null);
    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);

    const nombre = perfil?.nombre?.split(" ")[0] ?? "Usuario";

    useEffect(() => {
        const cargar = async () => {
            const uid = session.user.id;
            const hoy = new Date().toISOString().split("T")[0];

            const [{ data: res }, { data: met }] = await Promise.all([
                supabase.from("resumen_diario").select("*").eq("usuario_id", uid).eq("fecha", hoy).single(),
                supabase.from("metricas").select("*").eq("usuario_id", uid).order("fecha", { ascending: false }).limit(1),
            ]);

            setResumen(res);
            setMetricas(met ?? []);
            setLoading(false);
        };
        cargar();
    }, []);

    const ultima = metricas[0] ?? null;

    const KPIS = [
        { label: "Calorías", value: resumen ? `${resumen.kcal_consumidas ?? 0}` : "—", sub: "/ 1,830 kcal", color: "#3DDC84", icon: "🔥" },
        { label: "Comidas", value: resumen ? `${resumen.comidas_completadas}/${resumen.comidas_totales}` : "—", sub: "completadas", color: "#58A6FF", icon: "✅" },
        { label: "Agua", value: resumen ? `${resumen.agua_litros}L` : "—", sub: `/ ${resumen?.agua_objetivo_l ?? 2.5}L`, color: "#F0A500", icon: "💧" },
        { label: "Racha", value: "14", sub: "días seguidos 🔥", color: "#FF6B6B", icon: "📅" },
    ];

    const ADHERENCIA = [90, 100, 75, 100, 60, 0, 0];
    const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
    const HOY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-4xl animate-fadeUp">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-[#7D8590] text-xs mb-1">
                            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <h1 className="text-white text-2xl font-black font-display">
                            Hola, <span className="text-[#3DDC84]">{nombre} 👋</span>
                        </h1>
                    </div>
                    <button className="px-4 py-2 bg-[#3DDC84] text-black text-xs font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all">
                        + Registrar peso
                    </button>
                </div>

                {/* KPIs */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-24 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {KPIS.map((k, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                                <div className="text-lg mb-2">{k.icon}</div>
                                <div className="font-display font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                                <div className="text-[11px] text-[#7D8590] mt-0.5">{k.sub}</div>
                                <div className="text-[9px] text-[#7D8590] mt-1.5 font-bold tracking-widest">{k.label.toUpperCase()}</div>
                                <div className="absolute top-0 right-0 w-14 h-14 rounded-full opacity-10" style={{ background: k.color, filter: "blur(16px)" }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Macros + Adherencia */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Macros */}
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Macronutrientes</h3>
                            <span className="text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-1 rounded-full">HOY</span>
                        </div>
                        {[
                            { label: "Proteína", g: 89, max: 150, color: "#3DDC84" },
                            { label: "Carbohidratos", g: 142, max: 220, color: "#58A6FF" },
                            { label: "Grasas", g: 44, max: 70, color: "#F0A500" },
                        ].map((m) => (
                            <div key={m.label} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-[#7D8590]">{m.label}</span>
                                    <span className="text-white">{m.g}g <span className="text-[#7D8590]">/ {m.max}g</span></span>
                                </div>
                                <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min((m.g / m.max) * 100, 100)}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Adherencia semanal */}
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Adherencia semanal</h3>
                            <span className="text-[10px] bg-[rgba(88,166,255,.12)] text-[#58A6FF] font-bold px-2 py-1 rounded-full">7 DÍAS</span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            {DIAS.map((d, i) => {
                                const pct = ADHERENCIA[i];
                                const isHoy = i === HOY_IDX;
                                return (
                                    <div key={d} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className="h-20 w-full bg-[#1C2330] rounded-lg relative overflow-hidden" style={{ border: isHoy ? "1px solid #3DDC84" : "1px solid transparent" }}>
                                            <div
                                                className="absolute bottom-0 w-full rounded-t-md transition-all duration-700"
                                                style={{ height: `${pct}%`, background: pct === 100 ? "#3DDC84" : pct > 0 ? "rgba(61,220,132,.45)" : "transparent" }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold font-display" style={{ color: isHoy ? "#3DDC84" : "#7D8590" }}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex justify-between items-center bg-[rgba(61,220,132,.06)] rounded-lg px-3 py-2">
                            <span className="text-xs text-[#7D8590]">Promedio semanal</span>
                            <span className="text-xs text-[#3DDC84] font-bold font-display">85%</span>
                        </div>
                    </div>
                </div>

                {/* Últimas métricas */}
                {ultima && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Últimas métricas</h3>
                            <span className="text-[10px] text-[#7D8590]">{new Date(ultima.fecha).toLocaleDateString("es-MX")}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: "Peso", value: ultima.peso_kg, unit: "kg" },
                                { label: "% Grasa", value: ultima.pct_grasa, unit: "%" },
                                { label: "% Músculo", value: ultima.pct_musculo, unit: "%" },
                                { label: "Agua", value: ultima.pct_agua, unit: "%" },
                            ].map((m) => m.value && (
                                <div key={m.label} className="bg-[#1C2330] rounded-xl p-3 text-center">
                                    <div className="text-[10px] text-[#7D8590] font-bold mb-1">{m.label}</div>
                                    <div className="text-white font-display font-black text-xl">{m.value}<span className="text-xs text-[#7D8590] font-normal"> {m.unit}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}