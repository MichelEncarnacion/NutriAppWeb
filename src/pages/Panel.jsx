// src/pages/Panel.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Panel() {
    const { session, perfil } = useAuth();
    const [plan, setPlan] = useState(null);
    const [metricasHoy, setMetricasHoy] = useState(null);
    const [comidasCompletadas, setComidasCompletadas] = useState(0);
    const [adherencia, setAdherencia] = useState([]);
    const [loading, setLoading] = useState(true);

    const nombre = perfil?.nombre?.split(" ")[0] ?? "Usuario";
    const uid = session.user.id;
    const hoy = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const cargar = async () => {
            const [
                { data: planData },
                { data: metricasData },
                { count: completadas },
                { data: semanaData },
            ] = await Promise.all([
                supabase
                    .from("planes")
                    .select("id, contenido_json, fecha_inicio, fecha_fin")
                    .eq("perfil_id", uid)
                    .eq("es_activo", true)
                    .eq("estado", "listo")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),

                supabase
                    .from("metricas")
                    .select("calorias_consumidas, agua_ml")
                    .eq("perfil_id", uid)
                    .eq("fecha", hoy)
                    .maybeSingle(),

                supabase
                    .from("registro_comidas")
                    .select("id", { count: "exact", head: true })
                    .eq("perfil_id", uid)
                    .eq("fecha", hoy),

                supabase
                    .from("registro_comidas")
                    .select("fecha, plan_id")
                    .eq("perfil_id", uid)
                    .gte("fecha", new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0])
                    .order("fecha"),
            ]);

            setPlan(planData);
            setMetricasHoy(metricasData);
            setComidasCompletadas(completadas ?? 0);

            // Calcular adherencia semanal (últimos 7 días)
            const LABEL_MAP = ["D","L","M","X","J","V","S"]; // Sunday=0 like getDay()
            const diasSemana = [];
            for (let i = 6; i >= 0; i--) {
                const dateObj = new Date(Date.now() - i * 86400000);
                const d = dateObj.toISOString().split("T")[0];
                const label = LABEL_MAP[dateObj.getDay()];
                const registros = semanaData?.filter((r) => r.fecha === d) ?? [];
                diasSemana.push({ fecha: d, count: registros.length, label });
            }
            setAdherencia(diasSemana);
            setLoading(false);
        };
        cargar();
    }, []);

    // Calcular día actual del plan
    const diaActual = plan?.fecha_inicio
        ? Math.min(Math.floor((Date.now() - new Date(plan.fecha_inicio)) / 86400000) + 1, 15)
        : 1;

    const meta = plan?.contenido_json?.meta_diaria ?? null;
    const comidasDelDia = plan?.contenido_json?.dias?.[diaActual - 1]?.comidas ?? [];
    const totalComidas = comidasDelDia.length;

    const kcalConsumidas = metricasHoy?.calorias_consumidas ?? 0;
    const kcalObj = meta?.kcal ?? 0;
    const aguaL = metricasHoy?.agua_ml ? (metricasHoy.agua_ml / 1000).toFixed(1) : "0";
    const aguaObj = meta?.agua_l ?? 2.5;

    const KPIS = [
        {
            label: "Calorías", icon: "🔥", color: "#3DDC84",
            value: `${kcalConsumidas}`,
            sub: kcalObj > 0 ? `/ ${kcalObj} kcal` : "sin plan activo",
        },
        {
            label: "Comidas", icon: "✅", color: "#58A6FF",
            value: totalComidas > 0 ? `${comidasCompletadas}/${totalComidas}` : "—",
            sub: "completadas hoy",
        },
        {
            label: "Agua", icon: "💧", color: "#F0A500",
            value: `${aguaL}L`,
            sub: `/ ${aguaObj}L objetivo`,
        },
        {
            label: "Día del plan", icon: "📅", color: "#FF6B6B",
            value: plan ? `${diaActual}` : "—",
            sub: plan ? "de 15 días" : "sin plan activo",
        },
    ];

    const MACROS = meta ? [
        { label: "Proteína", g: 0, max: meta.proteina_g, color: "#3DDC84" },
        { label: "Carbohidratos", g: 0, max: meta.carbos_g, color: "#58A6FF" },
        { label: "Grasas", g: 0, max: meta.grasas_g, color: "#F0A500" },
    ] : [];

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
                            <h3 className="text-white font-bold font-display text-sm">Macronutrientes objetivo</h3>
                            <span className="text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-1 rounded-full">HOY</span>
                        </div>
                        {!meta ? (
                            <p className="text-[#7D8590] text-sm text-center py-4">Genera tu plan para ver tus macros objetivo</p>
                        ) : (
                            MACROS.map((m) => (
                                <div key={m.label} className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[#7D8590]">{m.label}</span>
                                        <span className="text-white">{m.g}g <span className="text-[#7D8590]">/ {m.max}g</span></span>
                                    </div>
                                    <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: m.max > 0 ? `${Math.min((m.g / m.max) * 100, 100)}%` : "0%",
                                                background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Adherencia semanal */}
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Adherencia semanal</h3>
                            <span className="text-[10px] bg-[rgba(88,166,255,.12)] text-[#58A6FF] font-bold px-2 py-1 rounded-full">7 DÍAS</span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            {adherencia.map((info, i) => {
                                const tiene = (info?.count ?? 0) > 0;
                                const isHoy = i === adherencia.length - 1; // last item = today
                                return (
                                    <div key={info.fecha} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div
                                            className="h-20 w-full bg-[#1C2330] rounded-lg relative overflow-hidden"
                                            style={{ border: isHoy ? "1px solid #3DDC84" : "1px solid transparent" }}
                                        >
                                            {tiene && (
                                                <div className="absolute bottom-0 w-full h-full rounded-t-md bg-[rgba(61,220,132,.45)]" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold font-display" style={{ color: isHoy ? "#3DDC84" : "#7D8590" }}>{info.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sin plan activo */}
                {!loading && !plan && (
                    <div className="bg-[#161B22] border border-[rgba(61,220,132,.2)] rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-3">🥗</span>
                        <p className="text-white font-bold mb-1">Tu plan nutricional se está preparando</p>
                        <p className="text-[#7D8590] text-sm">Cuando esté listo aparecerá aquí tu progreso del día.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
