// src/pages/Perfil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

const ROL_LABEL = {
    premium: { label: "✦ Premium", color: "#F0A500", bg: "rgba(240,165,0,0.1)", border: "rgba(240,165,0,0.2)" },
    demo:    { label: "🔬 Demo",   color: "#A855F7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)" },
    freemium:{ label: "Freemium", color: "#58A6FF", bg: "rgba(88,166,255,0.1)",  border: "rgba(88,166,255,0.2)" },
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

    const fechaRegistro = perfil?.fecha_registro
        ? new Date(perfil.fecha_registro).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <Layout>
            <div className="flex flex-col gap-6 max-w-lg">

                {/* Header */}
                <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#3DDC84] mb-1 font-display">CUENTA</p>
                    <h1 className="text-white text-3xl font-black font-display leading-none">Mi Perfil</h1>
                </div>

                {/* Avatar + info */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3DDC84] to-[#58A6FF] flex items-center justify-center text-black font-black text-2xl font-display flex-shrink-0">
                        {iniciales}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-lg leading-tight truncate">{perfil?.nombre ?? "Sin nombre"}</p>
                        <p className="text-[#7D8590] text-xs mt-0.5 truncate">{email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: rolMeta.bg, color: rolMeta.color, border: `1px solid ${rolMeta.border}` }}>
                            {rolMeta.label}
                        </span>
                    </div>
                </div>

                {/* Editar nombre */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5 flex flex-col gap-4">
                    <p className="text-white font-bold text-sm font-display">Editar nombre</p>

                    {feedback && (
                        <div className="text-xs px-3 py-2.5 rounded-xl font-medium"
                            style={{
                                background: feedback.tipo === "ok" ? "rgba(61,220,132,0.1)" : "rgba(255,107,107,0.1)",
                                color: feedback.tipo === "ok" ? "#3DDC84" : "#FF6B6B",
                                border: `1px solid ${feedback.tipo === "ok" ? "rgba(61,220,132,0.2)" : "rgba(255,107,107,0.2)"}`,
                            }}>
                            {feedback.tipo === "ok" ? "✓ " : "⚠️ "}{feedback.msg}
                        </div>
                    )}

                    <form onSubmit={handleGuardar} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-[#7D8590]">Nombre completo</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                required
                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#3DDC84] transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={guardando || nombre.trim() === (perfil?.nombre ?? "")}
                            className="py-2.5 text-sm font-bold font-display rounded-xl transition-all disabled:opacity-50"
                            style={{ background: "#3DDC84", color: "#000" }}
                        >
                            {guardando ? "Guardando…" : "Guardar cambios"}
                        </button>
                    </form>
                </div>

                {/* Info de cuenta */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5 flex flex-col gap-3">
                    <p className="text-white font-bold text-sm font-display mb-1">Información de cuenta</p>
                    {[
                        { label: "Correo electrónico", value: email },
                        { label: "Tipo de cuenta", value: rolMeta.label },
                        { label: "Miembro desde", value: fechaRegistro },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-2 border-b border-[#1C2330] last:border-0">
                            <span className="text-[#7D8590] text-xs">{label}</span>
                            <span className="text-white text-xs font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Acciones */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5 flex flex-col gap-2">
                    <p className="text-white font-bold text-sm font-display mb-1">Acciones</p>

                    {esPremium ? (
                        <button
                            onClick={() => navigate("/diagnostico")}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm text-left transition-all hover:bg-[rgba(61,220,132,0.05)]"
                            style={{ border: "1px solid rgba(61,220,132,0.15)" }}
                        >
                            <div>
                                <p className="text-white font-medium text-sm">Actualizar mis datos físicos</p>
                                <p className="text-[#7D8590] text-xs mt-0.5">Re-hacer el cuestionario y generar un nuevo plan</p>
                            </div>
                            <span className="text-[#3DDC84] text-lg ml-3">→</span>
                        </button>
                    ) : (
                        <div
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm"
                            style={{ border: "1px solid rgba(240,165,0,0.15)", opacity: 0.7 }}
                        >
                            <div>
                                <p className="text-white font-medium text-sm">Actualizar mis datos físicos</p>
                                <p className="text-[#7D8590] text-xs mt-0.5">🔒 Disponible solo en Premium</p>
                            </div>
                            <button
                                onClick={() => navigate("/panel?upgrade=true")}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-3"
                                style={{ background: "rgba(240,165,0,0.12)", color: "#F0A500", border: "1px solid rgba(240,165,0,0.25)" }}
                            >
                                ✦ Premium
                            </button>
                        </div>
                    )}

                    {/* Cambiar contraseña inline */}
                    <div className="flex flex-col gap-3 px-4 py-3 rounded-xl" style={{ border: "1px solid rgba(88,166,255,0.15)" }}>
                        <p className="text-white font-medium text-sm">Cambiar contraseña</p>

                        {feedbackPass && (
                            <div className="text-xs px-3 py-2 rounded-lg font-medium"
                                style={{
                                    background: feedbackPass.tipo === "ok" ? "rgba(61,220,132,0.1)" : "rgba(255,107,107,0.1)",
                                    color: feedbackPass.tipo === "ok" ? "#3DDC84" : "#FF6B6B",
                                    border: `1px solid ${feedbackPass.tipo === "ok" ? "rgba(61,220,132,0.2)" : "rgba(255,107,107,0.2)"}`,
                                }}>
                                {feedbackPass.tipo === "ok" ? "✓ " : "⚠️ "}{feedbackPass.msg}
                            </div>
                        )}

                        <form onSubmit={handleCambiarPass} className="flex flex-col gap-2">
                            <input
                                type="password"
                                placeholder="Nueva contraseña"
                                value={passForm.nueva}
                                onChange={(e) => setPassForm(f => ({ ...f, nueva: e.target.value }))}
                                required
                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#58A6FF] transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={passForm.confirmar}
                                onChange={(e) => setPassForm(f => ({ ...f, confirmar: e.target.value }))}
                                required
                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#58A6FF] transition-colors"
                                style={{ borderColor: passForm.confirmar && passForm.confirmar !== passForm.nueva ? "#FF6B6B" : undefined }}
                            />
                            <button
                                type="submit"
                                disabled={guardandoPass || !passForm.nueva || !passForm.confirmar}
                                className="py-2.5 text-sm font-bold font-display rounded-xl transition-all disabled:opacity-50"
                                style={{ background: "rgba(88,166,255,0.15)", color: "#58A6FF", border: "1px solid rgba(88,166,255,0.3)" }}
                            >
                                {guardandoPass ? "Actualizando…" : "Actualizar contraseña"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
