// src/pages/Seguimiento.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Seguimiento() {
    const { session } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        peso_kg: "", pct_grasa: "", pct_musculo: "",
        nivel_satisfaccion: null,
        platillos_favoritos: [], platillos_no_gustados: [],
        nivel_actividad_actual: "", cambios_medicos: "",
    });
    const [paso, setPaso] = useState(0);
    const [guardando, setGuardando] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const guardar = async () => {
        setGuardando(true);
        const { data: plan } = await supabase
            .rpc("get_plan_activo", { p_usuario_id: session.user.id });

        const { error } = await supabase.from("seguimientos").insert({
            perfil_id: session.user.id,
            plan_id: plan?.[0]?.id,
            peso_kg: form.peso_kg ? Number(form.peso_kg) : null,
            pct_grasa: form.pct_grasa ? Number(form.pct_grasa) : null,
            pct_musculo: form.pct_musculo ? Number(form.pct_musculo) : null,
            nivel_satisfaccion: form.nivel_satisfaccion,
            fuente_datos: "manual",
            respuestas_raw: form,
        });

        if (!error) {
            // También guarda en métricas para el dashboard
            await supabase.from("metricas").upsert({
                perfil_id: session.user.id,
                fecha: new Date().toISOString().split("T")[0],
                peso: form.peso_kg ? Number(form.peso_kg) : null,
                porcentaje_grasa: form.pct_grasa ? Number(form.pct_grasa) : null,
                porcentaje_musculo: form.pct_musculo ? Number(form.pct_musculo) : null,
                fuente: "manual",
            }, { onConflict: "perfil_id,fecha" });

            navigate("/panel");
        }
        setGuardando(false);
    };

    const PASOS_SEG = [
        {
            titulo: "Tus medidas actuales",
            desc: "Si tienes báscula o wearable, úsalos para mayor precisión.",
            contenido: (
                <div className="flex flex-col gap-4">
                    {[
                        { key: "peso_kg", label: "Peso actual", unit: "kg", placeholder: "74.2" },
                        { key: "pct_grasa", label: "% de grasa", unit: "%", placeholder: "18.4" },
                        { key: "pct_musculo", label: "% de músculo", unit: "%", placeholder: "42.1" },
                    ].map((f) => (
                        <div key={f.key} className="flex flex-col gap-2">
                            <label className="text-xs text-[#7D8590] font-semibold">{f.label}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={(e) => set(f.key, e.target.value)}
                                    className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm w-36 outline-none focus:border-[#3DDC84] transition-colors"
                                />
                                <span className="text-[#7D8590] text-sm">{f.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            titulo: "¿Qué tal estuvo tu plan?",
            desc: "Tu opinión nos ayuda a mejorar el siguiente plan.",
            contenido: (
                <div className="flex flex-col gap-4">
                    <p className="text-[#7D8590] text-sm">Nivel de satisfacción con tu plan actual:</p>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                onClick={() => set("nivel_satisfaccion", n)}
                                className={`w-12 h-12 rounded-xl font-display font-black text-lg border transition-all
                  ${form.nivel_satisfaccion === n
                                        ? "border-[#3DDC84] bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                                        : "border-[#2D3748] text-[#7D8590] hover:border-[#3DDC84]"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <p className="text-[#7D8590] text-xs">1 = muy insatisfecho · 5 = muy satisfecho</p>
                </div>
            ),
        },
        {
            titulo: "¿Algo más que debamos saber?",
            desc: "Cambios en tu salud, medicamentos o actividad física.",
            contenido: (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-[#7D8590] font-semibold">¿Algún cambio en tu salud o medicamentos?</label>
                        <textarea
                            placeholder="Ej: Empecé a tomar magnesio, me diagnosticaron hipotiroidismo... (escribe 'ninguno' si todo sigue igual)"
                            value={form.cambios_medicos}
                            onChange={(e) => set("cambios_medicos", e.target.value)}
                            rows={3}
                            className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm w-full outline-none focus:border-[#3DDC84] transition-colors resize-none"
                        />
                    </div>
                </div>
            ),
        },
    ];

    const pasoActual = PASOS_SEG[paso];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-xl">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Formulario de seguimiento</h1>
                    <p className="text-[#7D8590] text-xs">Cada 15 días · Nos ayuda a mejorar tu próximo plan</p>
                </div>

                {/* Progreso */}
                <div className="flex gap-2">
                    {PASOS_SEG.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= paso ? "bg-[#3DDC84]" : "bg-[#1C2330]"}`} />
                    ))}
                </div>

                {/* Tarjeta del paso */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                        <h2 className="text-white font-bold font-display text-lg mb-1">{pasoActual.titulo}</h2>
                        <p className="text-[#7D8590] text-xs">{pasoActual.desc}</p>
                    </div>
                    {pasoActual.contenido}
                </div>

                {/* Navegación */}
                <div className="flex gap-3">
                    {paso > 0 && (
                        <button
                            onClick={() => setPaso((p) => p - 1)}
                            className="px-5 py-3 rounded-xl border border-[#2D3748] text-[#7D8590] text-sm hover:border-[#3DDC84] hover:text-white transition-all"
                        >
                            ← Atrás
                        </button>
                    )}
                    <button
                        onClick={() => paso < PASOS_SEG.length - 1 ? setPaso((p) => p + 1) : guardar()}
                        disabled={guardando}
                        className="flex-1 py-3 rounded-xl bg-[#3DDC84] text-black font-bold font-display text-sm hover:bg-[#5EF0A0] transition-all disabled:opacity-60"
                    >
                        {guardando ? "Guardando..." : paso < PASOS_SEG.length - 1 ? "Continuar →" : "Enviar y generar nuevo plan 🚀"}
                    </button>
                </div>
            </div>
        </Layout>
    );
}