// src/pages/MiPlan.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

const TIPO_COLOR = {
    desayuno: { bg: "rgba(240,165,0,.12)", color: "#F0A500", label: "Desayuno" },
    colacion_am: { bg: "rgba(88,166,255,.12)", color: "#58A6FF", label: "Colación" },
    comida: { bg: "rgba(61,220,132,.12)", color: "#3DDC84", label: "Comida" },
    colacion_pm: { bg: "rgba(88,166,255,.12)", color: "#58A6FF", label: "Colación" },
    cena: { bg: "rgba(147,51,234,.12)", color: "#A855F7", label: "Cena" },
};

export default function MiPlan() {
    const { session } = useAuth();
    const [plan, setPlan] = useState(null);
    const [comidas, setComidas] = useState([]);
    const [diaActivo, setDia] = useState(1);
    const [registro, setRegistro] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const uid = session.user.id;

            // Plan activo
            const { data: planes } = await supabase
                .rpc("get_plan_activo", { p_usuario_id: uid });
            const planActivo = planes?.[0];
            if (!planActivo) { setLoading(false); return; }
            setPlan(planActivo);

            // Comidas del plan
            const { data: com } = await supabase
                .from("comidas")
                .select("*")
                .eq("plan_id", planActivo.id)
                .order("dia_numero")
                .order("hora_sugerida");
            setComidas(com ?? []);

            // Registros de hoy
            const hoy = new Date().toISOString().split("T")[0];
            const { data: reg } = await supabase
                .from("registro_comidas")
                .select("comida_id, completada")
                .eq("usuario_id", uid)
                .eq("fecha", hoy);
            const map = {};
            (reg ?? []).forEach((r) => { map[r.comida_id] = r.completada; });
            setRegistro(map);
            setLoading(false);
        };
        cargar();
    }, []);

    const toggleComida = async (comidaId) => {
        const nueva = !registro[comidaId];
        setRegistro((r) => ({ ...r, [comidaId]: nueva }));
        await supabase.rpc("toggle_comida", {
            p_usuario_id: session.user.id,
            p_comida_id: comidaId,
            p_fecha: new Date().toISOString().split("T")[0],
        });
    };

    const comidasDelDia = comidas.filter((c) => c.dia_numero === diaActivo);
    const diasDisponibles = [...new Set(comidas.map((c) => c.dia_numero))];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
                    <p className="text-[#7D8590] text-xs">
                        {plan
                            ? `Semana ${plan.semana_actual ?? 1} · Vigente hasta ${new Date(plan.vigente_hasta).toLocaleDateString("es-MX")}`
                            : "Cargando plan..."}
                    </p>
                </div>

                {/* Selector de día */}
                <div className="flex gap-2 flex-wrap">
                    {["Lunes", "Martes", "Miércoles", "Jueves"].map((d, i) => (
                        <button
                            key={i}
                            onClick={() => setDia(i + 1)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold font-display border transition-all
                ${diaActivo === i + 1
                                    ? "border-[#3DDC84] bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                                    : "border-[#2D3748] text-[#7D8590] hover:border-[#3DDC84] hover:text-white"
                                }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Comidas */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-20 animate-pulse" />
                        ))}
                    </div>
                ) : !plan ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">🥗</span>
                        <p className="text-white font-bold mb-2">No tienes un plan activo</p>
                        <p className="text-[#7D8590] text-sm">Completa tu diagnóstico para generar tu plan nutricional.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {comidasDelDia.map((c) => {
                            const completada = registro[c.id] ?? false;
                            const tc = TIPO_COLOR[c.tipo] ?? TIPO_COLOR.comida;
                            return (
                                <div
                                    key={c.id}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 cursor-pointer
                    ${completada ? "border-[rgba(61,220,132,.3)] opacity-70" : "border-[#2D3748]"}`}
                                    onClick={() => toggleComida(c.id)}
                                >
                                    {/* Check */}
                                    <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                      ${completada ? "bg-[#3DDC84] text-black" : "border-2 border-[#2D3748] text-transparent"}`}
                                    >
                                        ✓
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>
                                                {tc.label.toUpperCase()}
                                            </span>
                                            {c.hora_sugerida && (
                                                <span className="text-[10px] text-[#7D8590]">{c.hora_sugerida.slice(0, 5)} hrs</span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-semibold truncate ${completada ? "line-through text-[#7D8590]" : "text-white"}`}>
                                            {c.nombre}
                                        </p>
                                        {c.descripcion && (
                                            <p className="text-xs text-[#7D8590] mt-0.5 truncate">{c.descripcion}</p>
                                        )}
                                    </div>

                                    {/* Kcal */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-bold font-display text-[#3DDC84]">{c.kcal}</div>
                                        <div className="text-[10px] text-[#7D8590]">kcal</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total del día */}
                {comidasDelDia.length > 0 && (
                    <div className="bg-[rgba(61,220,132,.06)] border border-[rgba(61,220,132,.18)] rounded-xl p-4 flex justify-between items-center">
                        <span className="text-sm text-[#7D8590]">Total del día</span>
                        <span className="font-display font-black text-[#3DDC84] text-lg">
                            {comidasDelDia.reduce((a, c) => a + (c.kcal ?? 0), 0)} kcal
                        </span>
                    </div>
                )}
            </div>
        </Layout>
    );
}

