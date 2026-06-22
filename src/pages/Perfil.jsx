// src/pages/Perfil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input, { Field } from "../components/ui/Input";

const ROL_TONE = {
    premium: "orange",
    demo: "purple",
    freemium: "blue",
};

const ROL_LABEL = {
    premium: { label: "✦ Premium", color: "#BF9000", bg: "rgba(191,144,0,0.1)", border: "rgba(191,144,0,0.2)" },
    demo:    { label: "🔬 Demo",   color: "#7C3AED", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.2)" },
    freemium:{ label: "Freemium", color: "#2563EB", bg: "rgba(37,99,235,0.1)",  border: "rgba(37,99,235,0.2)" },
};

export default function Perfil() {
    const { perfil, session, actualizarPerfil, rol, esPremium } = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState(perfil?.nombre ?? "");
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null); // { tipo: 'ok' | 'error', msg }

    const [passForm, setPassForm] = useState({ nueva: "", confirmar: "" });
    const [guardandoPass, setGuardandoPass] = useState(false);
    const [feedbackPass, setFeedbackPass] = useState(null);

    const [metrForm, setMetrForm] = useState({ peso: "", porcentaje_grasa: "", porcentaje_musculo: "" });
    const [guardandoMetr, setGuardandoMetr] = useState(false);
    const [feedbackMetr, setFeedbackMetr] = useState(null);

    const iniciales = (perfil?.nombre ?? perfil?.email ?? "U").slice(0, 1).toUpperCase();
    const email = session?.user?.email ?? "";
    const rolMeta = ROL_LABEL[rol] ?? ROL_LABEL.freemium;

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setGuardando(true);
        setFeedback(null);
        const { error } = await actualizarPerfil({ nombre: nombre.trim() });
        setGuardando(false);
        if (error) {
            setFeedback({ tipo: "error", msg: "No se pudo guardar. Intenta de nuevo." });
        } else {
            setFeedback({ tipo: "ok", msg: "Nombre actualizado correctamente." });
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const handleCambiarPass = async (e) => {
        e.preventDefault();
        setFeedbackPass(null);
        if (passForm.nueva.length < 6) {
            setFeedbackPass({ tipo: "error", msg: "La contraseña debe tener al menos 6 caracteres." });
            return;
        }
        if (passForm.nueva !== passForm.confirmar) {
            setFeedbackPass({ tipo: "error", msg: "Las contraseñas no coinciden." });
            return;
        }
        setGuardandoPass(true);
        const { error } = await supabase.auth.updateUser({ password: passForm.nueva });
        setGuardandoPass(false);
        if (error) {
            setFeedbackPass({ tipo: "error", msg: "No se pudo actualizar. Intenta de nuevo." });
        } else {
            setPassForm({ nueva: "", confirmar: "" });
            setFeedbackPass({ tipo: "ok", msg: "Contraseña actualizada correctamente." });
            setTimeout(() => setFeedbackPass(null), 3000);
        }
    };

    const handleGuardarMetricas = async (e) => {
        e.preventDefault();
        if (!metrForm.peso && !metrForm.porcentaje_grasa && !metrForm.porcentaje_musculo) return;
        setGuardandoMetr(true);
        setFeedbackMetr(null);

        const hoy = new Date().toISOString().split("T")[0];

        const { data: existente } = await supabase
            .from("metricas")
            .select("fecha")
            .eq("perfil_id", session.user.id)
            .eq("fecha", hoy)
            .maybeSingle();

        if (existente) {
            setGuardandoMetr(false);
            setFeedbackMetr({ tipo: "error", msg: "Ya registraste tus métricas hoy. Solo puedes hacerlo una vez al día." });
            return;
        }

        const { error } = await supabase.from("metricas").insert({
            perfil_id: session.user.id,
            fecha: hoy,
            peso: metrForm.peso ? Number(metrForm.peso) : null,
            porcentaje_grasa: metrForm.porcentaje_grasa ? Number(metrForm.porcentaje_grasa) : null,
            porcentaje_musculo: metrForm.porcentaje_musculo ? Number(metrForm.porcentaje_musculo) : null,
        });

        setGuardandoMetr(false);
        if (error) {
            setFeedbackMetr({ tipo: "error", msg: "No se pudo guardar. Intenta de nuevo." });
        } else {
            setFeedbackMetr({ tipo: "ok", msg: "Métricas guardadas correctamente." });
            setMetrForm({ peso: "", porcentaje_grasa: "", porcentaje_musculo: "" });
            setTimeout(() => setFeedbackMetr(null), 3000);
        }
    };

    const fechaRegistro = perfil?.fecha_registro
        ? new Date(perfil.fecha_registro).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <Layout>
            <div className="flex flex-col gap-6 max-w-lg">

                {/* Header */}
                <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#1B5E20] mb-1 font-display">CUENTA</p>
                    <h1 className="text-text-primary text-3xl font-black font-display leading-none">Mi Perfil</h1>
                </div>

                {/* Avatar + info */}
                <Card className="p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-brand-green font-black text-2xl font-display flex-shrink-0">
                        {iniciales}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-text-primary font-bold text-lg leading-tight truncate">{perfil?.nombre ?? "Sin nombre"}</p>
                        <p className="text-[#4A5568] text-xs mt-0.5 truncate">{email}</p>
                        <Badge tone={ROL_TONE[rol] ?? "blue"} className="mt-2">{rolMeta.label}</Badge>
                    </div>
                </Card>

                {/* Editar nombre */}
                <Card className="flex flex-col gap-4">
                    <p className="text-text-primary font-bold text-sm font-display">Editar nombre</p>

                    {feedback && (
                        <div className={`text-xs px-3 py-2.5 rounded-lg font-medium border ${feedback.tipo === "ok" ? "bg-brand-green/10 text-brand-green border-brand-green/20" : "bg-brand-red/10 text-brand-red border-brand-red/20"}`}>
                            {feedback.tipo === "ok" ? "✓ " : "⚠️ "}{feedback.msg}
                        </div>
                    )}

                    <form onSubmit={handleGuardar} className="flex flex-col gap-3">
                        <Field label="Nombre completo">
                            <Input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                required
                            />
                        </Field>
                        <Button
                            type="submit"
                            disabled={guardando || nombre.trim() === (perfil?.nombre ?? "")}
                            fullWidth
                        >
                            {guardando ? "Guardando…" : "Guardar cambios"}
                        </Button>
                    </form>
                </Card>

                {/* Info de cuenta */}
                <Card className="flex flex-col gap-3">
                    <p className="text-text-primary font-bold text-sm font-display mb-1">Información de cuenta</p>
                    {[
                        { label: "Correo electrónico", value: email },
                        { label: "Tipo de cuenta", value: rolMeta.label },
                        { label: "Miembro desde", value: fechaRegistro },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-dark-700 last:border-0">
                            <span className="text-[#4A5568] text-xs">{label}</span>
                            <span className="text-text-primary text-xs font-medium">{value}</span>
                        </div>
                    ))}
                </Card>

                {/* Registrar métricas */}
                <Card className="flex flex-col gap-4">
                    <div>
                        <p className="text-text-primary font-bold text-sm font-display">Registrar métricas corporales</p>
                        <p className="text-[#4A5568] text-xs mt-0.5">Se guarda con la fecha de hoy. Puedes actualizar una vez por día.</p>
                    </div>

                    {feedbackMetr && (
                        <div className={`text-xs px-3 py-2.5 rounded-lg font-medium border ${feedbackMetr.tipo === "ok" ? "bg-brand-green/10 text-brand-green border-brand-green/20" : "bg-brand-red/10 text-brand-red border-brand-red/20"}`}>
                            {feedbackMetr.tipo === "ok" ? "✓ " : "⚠️ "}{feedbackMetr.msg}
                        </div>
                    )}

                    <form onSubmit={handleGuardarMetricas} className="flex flex-col gap-3">
                        {[
                            { key: "peso", label: "Peso", unit: "kg", placeholder: "74.2" },
                            { key: "porcentaje_grasa", label: "% Grasa corporal", unit: "%", placeholder: "18.4" },
                            { key: "porcentaje_musculo", label: "% Músculo", unit: "%", placeholder: "42.1" },
                        ].map((f) => (
                            <div key={f.key} className="flex items-center gap-3">
                                <label className="text-xs text-[#4A5568] w-36 flex-shrink-0">{f.label}</label>
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder={f.placeholder}
                                        value={metrForm[f.key]}
                                        onChange={(e) => setMetrForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                                        className="w-28"
                                    />
                                    <span className="text-[#4A5568] text-xs">{f.unit}</span>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="submit"
                            variant="secondary"
                            disabled={guardandoMetr || (!metrForm.peso && !metrForm.porcentaje_grasa && !metrForm.porcentaje_musculo)}
                            fullWidth
                            className="mt-1 !bg-brand-green/15 !text-brand-green !border-brand-green/30"
                        >
                            {guardandoMetr ? "Guardando…" : "Guardar métricas →"}
                        </Button>
                    </form>
                </Card>

                {/* Acciones */}
                <Card className="flex flex-col gap-2">
                    <p className="text-text-primary font-bold text-sm font-display mb-1">Acciones</p>

                    {esPremium ? (
                        <button
                            onClick={() => navigate("/diagnostico")}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm text-left transition-all border border-brand-green/15 hover:bg-brand-green/5"
                        >
                            <div>
                                <p className="text-text-primary font-medium text-sm">Actualizar mis datos físicos</p>
                                <p className="text-[#4A5568] text-xs mt-0.5">Re-hacer el cuestionario y generar un nuevo plan</p>
                            </div>
                            <span className="text-[#1B5E20] text-lg ml-3">→</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm border border-brand-orange/15 opacity-70">
                            <div>
                                <p className="text-text-primary font-medium text-sm">Actualizar mis datos físicos</p>
                                <p className="text-[#4A5568] text-xs mt-0.5">🔒 Disponible solo en Premium</p>
                            </div>
                            <button onClick={() => navigate("/panel?upgrade=true")} className="flex-shrink-0 ml-3">
                                <Badge tone="orange">✦ Premium</Badge>
                            </button>
                        </div>
                    )}

                    {/* Cambiar contraseña inline */}
                    <div className="flex flex-col gap-3 px-4 py-3 rounded-lg border border-brand-blue/15">
                        <p className="text-text-primary font-medium text-sm">Cambiar contraseña</p>

                        {feedbackPass && (
                            <div className={`text-xs px-3 py-2 rounded-lg font-medium border ${feedbackPass.tipo === "ok" ? "bg-brand-green/10 text-brand-green border-brand-green/20" : "bg-brand-red/10 text-brand-red border-brand-red/20"}`}>
                                {feedbackPass.tipo === "ok" ? "✓ " : "⚠️ "}{feedbackPass.msg}
                            </div>
                        )}

                        <form onSubmit={handleCambiarPass} className="flex flex-col gap-2">
                            <Input
                                type="password"
                                placeholder="Nueva contraseña"
                                value={passForm.nueva}
                                onChange={(e) => setPassForm(f => ({ ...f, nueva: e.target.value }))}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={passForm.confirmar}
                                onChange={(e) => setPassForm(f => ({ ...f, confirmar: e.target.value }))}
                                required
                                style={{ borderColor: passForm.confirmar && passForm.confirmar !== passForm.nueva ? "#D64545" : undefined }}
                            />
                            <Button
                                type="submit"
                                disabled={guardandoPass || !passForm.nueva || !passForm.confirmar}
                                className="!bg-brand-blue/15 !text-brand-blue !border-brand-blue/30"
                            >
                                {guardandoPass ? "Actualizando…" : "Actualizar contraseña"}
                            </Button>
                        </form>
                    </div>
                </Card>

            </div>
        </Layout>
    );
}
