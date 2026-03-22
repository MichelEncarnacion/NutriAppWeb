// src/pages/MiPlan.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

const TODAY = new Date().toISOString().split("T")[0];

const TIPO_COLOR = {
    desayuno:    { bg: "rgba(240,165,0,.12)",   color: "#F0A500", label: "Desayuno" },
    colacion_am: { bg: "rgba(88,166,255,.12)",  color: "#58A6FF", label: "Colación AM" },
    comida:      { bg: "rgba(61,220,132,.12)",  color: "#3DDC84", label: "Comida" },
    colacion_pm: { bg: "rgba(88,166,255,.12)",  color: "#58A6FF", label: "Colación PM" },
    cena:        { bg: "rgba(147,51,234,.12)",  color: "#A855F7", label: "Cena" },
};

export default function MiPlan() {
    const { session } = useAuth();
    const uid = session.user.id;

    const [plan, setPlan] = useState(null);
    const [diaActivo, setDia] = useState(1);
    const [registro, setRegistro] = useState({}); // { "diaNum-comidaIdx": true }
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);

    const cargarRegistro = useCallback(async (planId, dia) => {
        const { data } = await supabase
            .from("registro_comidas")
            .select("comida_index, id")
            .eq("perfil_id", uid)
            .eq("plan_id", planId)
            .eq("dia_numero", dia)
            .eq("fecha", TODAY);

        const map = {};
        (data ?? []).forEach((r) => { map[`${dia}-${r.comida_index}`] = r.id; });
        setRegistro(map);
    }, [uid]);

    useEffect(() => {
        const cargar = async () => {
            const { data: planData } = await supabase
                .from("planes")
                .select("id, contenido_json, fecha_inicio, fecha_fin, estado")
                .eq("perfil_id", uid)
                .eq("es_activo", true)
                .eq("estado", "listo")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (planData) {
                setPlan(planData);
                // Calcular día actual del plan
                const diaCalculado = Math.max(1, Math.min(
                    Math.floor((new Date(TODAY) - new Date(planData.fecha_inicio)) / 86400000) + 1,
                    15
                ));
                setDia(diaCalculado);
                await cargarRegistro(planData.id, diaCalculado);
            }
            setLoading(false);
        };
        cargar();
    }, [uid, cargarRegistro]);

    // Al cambiar de día, recargar registro
    const cambiarDia = async (dia) => {
        setDia(dia);
        if (plan) await cargarRegistro(plan.id, dia);
    };

    const toggleComida = async (comidaIndex) => {
        if (!plan || toggling !== null) return;
        const key = `${diaActivo}-${comidaIndex}`;
        const registroId = registro[key];
        setToggling(comidaIndex);

        if (registroId) {
            // Des-marcar: eliminar registro (optimistic)
            const nuevo = { ...registro };
            delete nuevo[key];
            setRegistro(nuevo);
            const { error } = await supabase.from("registro_comidas").delete().eq("id", registroId);
            if (error) {
                console.error("Error al desmarcar comida:", error);
                setRegistro((r) => ({ ...r, [key]: registroId })); // rollback
            }
        } else {
            // Marcar: insertar registro
            const { data, error } = await supabase
                .from("registro_comidas")
                .insert({
                    perfil_id: uid,
                    plan_id: plan.id,
                    dia_numero: diaActivo,
                    comida_index: comidaIndex,
                    fecha: TODAY,
                })
                .select("id")
                .single();
            if (error) {
                console.error("Error al marcar comida:", error);
            } else if (data) {
                setRegistro((r) => ({ ...r, [key]: data.id }));
            }
        }
        setToggling(null);
    };

    const comidasDelDia = plan?.contenido_json?.dias?.[diaActivo - 1]?.comidas ?? [];
    const kcalTotal = plan?.contenido_json?.dias?.[diaActivo - 1]?.kcal_total ?? 0;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
                    <p className="text-[#7D8590] text-xs">
                        {plan
                            ? `Vigente hasta ${new Date(plan.fecha_fin).toLocaleDateString("es-MX")} · Día ${diaActivo} de 15`
                            : loading ? "Cargando plan..." : "Sin plan activo"}
                    </p>
                </div>

                {/* Selector de día */}
                {plan && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => (
                            <button
                                key={d}
                                onClick={() => cambiarDia(d)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold font-display border transition-all flex-shrink-0
                                    ${diaActivo === d
                                        ? "border-[#3DDC84] bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                                        : "border-[#2D3748] text-[#7D8590] hover:border-[#3DDC84] hover:text-white"
                                    }`}
                            >
                                Día {d}
                            </button>
                        ))}
                    </div>
                )}

                {/* Lista de comidas */}
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
                        {comidasDelDia.map((c, idx) => {
                            const key = `${diaActivo}-${idx}`;
                            const completada = Boolean(registro[key]);
                            const tc = TIPO_COLOR[c.tipo] ?? TIPO_COLOR.comida;
                            return (
                                <div
                                    key={`${diaActivo}-${idx}`}
                                    onClick={() => toggleComida(idx)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer
                                        ${toggling === idx ? "opacity-60" : "hover:-translate-y-0.5"}
                                        ${completada ? "border-[rgba(61,220,132,.3)] opacity-75" : "border-[#2D3748]"}`}
                                >
                                    {/* Check */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                                        ${completada ? "bg-[#3DDC84] text-black" : "border-2 border-[#2D3748] text-transparent"}`}>
                                        ✓
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>
                                                {tc.label.toUpperCase()}
                                            </span>
                                            {c.hora_sugerida && (
                                                <span className="text-[10px] text-[#7D8590]">{c.hora_sugerida} hrs</span>
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
                        <span className="text-sm text-[#7D8590]">Total del día {diaActivo}</span>
                        <span className="font-display font-black text-[#3DDC84] text-lg">{kcalTotal} kcal</span>
                    </div>
                )}
            </div>
        </Layout>
    );
}
