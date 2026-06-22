// src/pages/Seguimiento.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input, { Field } from "../components/ui/Input";

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
    const [errorMsg, setErrorMsg] = useState(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const guardar = async () => {
        setGuardando(true);
        setErrorMsg(null);
        try {
            const { data: plan, error: rpcError } = await supabase
                .rpc("get_plan_activo", { p_usuario_id: session.user.id });

            if (rpcError) {
                console.error("Error al obtener plan activo:", rpcError);
                setErrorMsg("No pudimos obtener tu plan activo. Por favor intenta de nuevo.");
                return;
            }

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

            if (error) {
                console.error("Error al guardar seguimiento:", error);
                setErrorMsg("No pudimos guardar tu seguimiento. Por favor intenta de nuevo.");
                return;
            }

            const hoy = new Date().toISOString().split("T")[0];
            const { error: upsertError } = await supabase.from("metricas").upsert(
                {
                    perfil_id: session.user.id,
                    fecha: hoy,
                    peso: form.peso_kg ? Number(form.peso_kg) : null,
                    porcentaje_grasa: form.pct_grasa ? Number(form.pct_grasa) : null,
                    porcentaje_musculo: form.pct_musculo ? Number(form.pct_musculo) : null,
                },
                { onConflict: "perfil_id,fecha" }
            );

            if (upsertError) {
                console.error("Error al actualizar métricas:", upsertError);
            }

            navigate("/panel");
        } catch (err) {
            console.error("Error inesperado en seguimiento:", err);
            setErrorMsg("Ocurrió un error inesperado. Por favor intenta de nuevo.");
        } finally {
            setGuardando(false);
        }
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
                        <Field key={f.key} label={f.label}>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={(e) => set(f.key, e.target.value)}
                                    className="w-36"
                                />
                                <span className="text-text-muted text-sm">{f.unit}</span>
                            </div>
                        </Field>
                    ))}
                </div>
            ),
        },
        {
            titulo: "¿Qué tal estuvo tu plan?",
            desc: "Tu opinión nos ayuda a mejorar el siguiente plan.",
            contenido: (
                <div className="flex flex-col gap-4">
                    <p className="text-text-muted text-sm">Nivel de satisfacción con tu plan actual:</p>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                onClick={() => set("nivel_satisfaccion", n)}
                                className={`w-12 h-12 rounded-lg font-display font-black text-lg border transition-colors
                  ${form.nivel_satisfaccion === n
                                        ? "border-brand-green bg-brand-green/12 text-brand-green"
                                        : "border-dark-600 text-text-muted hover:border-brand-green"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <p className="text-text-muted text-xs">1 = muy insatisfecho · 5 = muy satisfecho</p>
                </div>
            ),
        },
        {
            titulo: "¿Algo más que debamos saber?",
            desc: "Cambios en tu salud, medicamentos o actividad física.",
            contenido: (
                <div className="flex flex-col gap-4">
                    <Field label="¿Algún cambio en tu salud o medicamentos?">
                        <Input
                            as="textarea"
                            placeholder="Ej: Empecé a tomar magnesio, me diagnosticaron hipotiroidismo... (escribe 'ninguno' si todo sigue igual)"
                            value={form.cambios_medicos}
                            onChange={(e) => set("cambios_medicos", e.target.value)}
                            rows={3}
                            className="w-full resize-none"
                        />
                    </Field>
                </div>
            ),
        },
    ];

    const pasoActual = PASOS_SEG[paso];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-xl">
                <div>
                    <h1 className="text-text-primary text-2xl font-black font-display mb-1">Formulario de seguimiento</h1>
                    <p className="text-text-muted text-xs">Cada 15 días · Nos ayuda a mejorar tu próximo plan</p>
                </div>

                {/* Progreso */}
                <div className="flex gap-2">
                    {PASOS_SEG.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= paso ? "bg-brand-green" : "bg-dark-700"}`} />
                    ))}
                </div>

                {/* Tarjeta del paso */}
                <Card className="flex flex-col gap-5 p-6">
                    <div>
                        <h2 className="text-text-primary font-bold font-display text-lg mb-1">{pasoActual.titulo}</h2>
                        <p className="text-text-muted text-xs">{pasoActual.desc}</p>
                    </div>
                    {pasoActual.contenido}
                </Card>

                {/* Error */}
                {errorMsg && (
                    <p className="text-brand-red text-sm text-center">{errorMsg}</p>
                )}

                {/* Navegación */}
                <div className="flex gap-3">
                    {paso > 0 && (
                        <Button variant="secondary" size="lg" onClick={() => setPaso((p) => p - 1)}>
                            ← Atrás
                        </Button>
                    )}
                    <Button
                        size="lg"
                        className="flex-1"
                        onClick={() => paso < PASOS_SEG.length - 1 ? setPaso((p) => p + 1) : guardar()}
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : paso < PASOS_SEG.length - 1 ? "Continuar →" : "Enviar y generar nuevo plan 🚀"}
                    </Button>
                </div>
            </div>
        </Layout>
    );
}