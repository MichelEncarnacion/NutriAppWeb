// src/pages/GenerandoPlan.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PASOS = [
    { label: "Analizando tus respuestas",         hasta: 15 },
    { label: "Calculando necesidades calóricas",   hasta: 35 },
    { label: "Eligiendo alimentos para tu objetivo", hasta: 55 },
    { label: "Ajustando al presupuesto y alergias", hasta: 75 },
    { label: "Finalizando tu plan nutricional",    hasta: 95 },
];

export default function GenerandoPlan() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { respuestas, tieneEnfermedad, regenerar } = location.state ?? {};

    const [progreso, setProgreso] = useState(0);
    const [error, setError] = useState(null);
    const [mostrarAviso, setMostrarAviso] = useState(false);
    const [sinEstado, setSinEstado] = useState(false);
    const generandoRef = useRef(false);

    // Barra de progreso basada en tiempo (~25s para llegar a 95%)
    useEffect(() => {
        const DURACION_MS = 25_000;
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(95, Math.round((elapsed / DURACION_MS) * 95));
            setProgreso(pct);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Llamar al backend para generar el plan
    useEffect(() => {
        if (!regenerar && !respuestas) { setSinEstado(true); return; }
        if (!session) return; // Esperar a que AuthContext cargue la sesión
        if (generandoRef.current) return;
        generandoRef.current = true;

        const generar = async () => {
            const token = session?.access_token;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90_000);

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-plan`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                        },
                        body: regenerar
                            ? JSON.stringify({})
                            : JSON.stringify({ respuestas, usuario_id: session.user.id }),
                        signal: controller.signal,
                    }
                );
                clearTimeout(timeoutId);

                if (res.status === 409) {
                    setError("Ya generaste un plan recientemente. Los usuarios Freemium pueden generar 1 plan por mes.");
                    return;
                }
                if (!res.ok) throw new Error("Error al generar el plan");

                if (tieneEnfermedad) {
                    setMostrarAviso(true);
                } else {
                    navigate(regenerar ? "/mi-plan" : "/panel", { replace: true });
                }
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === "AbortError") {
                    setError("El plan tardó demasiado en generarse. Por favor intenta de nuevo.");
                } else {
                    setError("No pudimos generar tu plan. Por favor intenta de nuevo.");
                }
            }
        };

        generar();
    }, [session, respuestas, regenerar, navigate]);

    // ── Sin estado (recarga de página) ──────────────────────────────────
    if (sinEstado) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-8 text-center flex flex-col gap-5 shadow-sm">
                <span className="text-5xl">🔄</span>
                <h2 className="text-text-primary text-xl font-bold font-display">Sesión interrumpida</h2>
                <p className="text-text-muted text-sm leading-relaxed">
                    Parece que la página se recargó durante la generación de tu plan. Por favor regresa al diagnóstico para continuar.
                </p>
                <button
                    onClick={() => navigate("/diagnostico", { replace: true })}
                    className="w-full py-3 bg-brand-green text-white font-bold font-display rounded-xl hover:bg-brand-greenL transition-all text-sm"
                >
                    Ir al diagnóstico →
                </button>
            </div>
        </div>
    );

    // ── Aviso médico ──────────────────────────────────────────────────────
    if (mostrarAviso) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="bg-dark-800 border border-brand-orange/30 rounded-2xl w-full max-w-md p-8 text-center flex flex-col gap-5 shadow-sm">
                <span className="text-5xl">⚕️</span>
                <h2 className="text-text-primary text-xl font-bold font-display">Aviso importante de salud</h2>
                <p className="text-text-muted text-sm leading-relaxed">
                    Notamos que mencionaste tener una condición médica. Por tu seguridad y bienestar,
                    <strong className="text-text-primary"> te recomendamos consultar a un médico o nutriólogo certificado</strong> antes
                    de iniciar cualquier plan nutricional.
                </p>
                <p className="text-text-muted text-sm leading-relaxed">
                    NutriiApp puede complementar tu tratamiento, pero no sustituye la orientación de un profesional de la salud.
                </p>
                <button
                    onClick={() => navigate("/panel", { replace: true })}
                    className="w-full py-3 bg-brand-green text-white font-bold font-display rounded-xl hover:bg-brand-greenL transition-all text-sm"
                >
                    Entendido, ver mi plan →
                </button>
            </div>
        </div>
    );

    // ── Error ─────────────────────────────────────────────────────────────
    if (error) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
            <div className="bg-dark-800 border border-brand-red/30 rounded-2xl w-full max-w-md p-8 text-center flex flex-col gap-5 shadow-sm">
                <span className="text-5xl">⚠️</span>
                <h2 className="text-text-primary text-xl font-bold font-display">Algo salió mal</h2>
                <p className="text-text-muted text-sm">{error}</p>
                <button
                    onClick={() => regenerar
                        ? navigate("/mi-plan", { state: { regenerar: true }, replace: true })
                        : navigate("/generando-plan", { state: { respuestas, tieneEnfermedad }, replace: true })
                    }
                    className="w-full py-3 bg-brand-green text-white font-bold font-display rounded-xl hover:bg-brand-greenL transition-all text-sm"
                >
                    Reintentar
                </button>
                <button
                    onClick={() => navigate(regenerar ? "/mi-plan" : "/panel", { replace: true })}
                    className="w-full py-3 bg-transparent border border-dark-600 text-text-muted font-display rounded-xl hover:border-text-muted transition-all text-sm"
                >
                    {regenerar ? "Volver a mi plan" : "Ir al panel de todas formas"}
                </button>
            </div>
        </div>
    );

    // ── Pantalla de carga ─────────────────────────────────────────────────
    const pasoActual = PASOS.findIndex(p => progreso < p.hasta);
    const idxActivo = pasoActual === -1 ? PASOS.length - 1 : pasoActual;

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 gap-8">

            {/* Icono */}
            <div className="relative w-24 h-24">
                <svg className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#1b5e20" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray="276" strokeDashoffset="207"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🥗</div>
            </div>

            {/* Título + mensaje activo */}
            <div className="text-center">
                <h2 className="text-text-primary text-2xl font-bold font-display mb-2">
                    Generando tu plan nutricional
                </h2>
                <p className="text-brand-green text-sm font-medium h-5">
                    {PASOS[idxActivo].label}...
                </p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs text-text-muted mb-2">
                    <span>Progreso</span>
                    <span>{progreso}%</span>
                </div>
                <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand-green rounded-full transition-all duration-300"
                        style={{ width: `${progreso}%` }}
                    />
                </div>
            </div>

            {/* Pasos */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
                {PASOS.map((p, i) => {
                    const completado = progreso >= p.hasta;
                    const activo = i === idxActivo;
                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-300 ${
                                completado ? "bg-brand-green text-white font-bold"
                                : activo    ? "bg-[rgba(27,94,32,0.12)] border border-brand-green text-brand-green"
                                :             "bg-dark-700 border border-dark-600 text-text-muted"
                            }`}>
                                {completado ? "✓" : i + 1}
                            </div>
                            <span className={`text-xs transition-colors duration-300 ${completado || activo ? "text-text-primary" : "text-text-muted"}`}>
                                {p.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <p className="text-text-muted text-xs">Esto toma aproximadamente 30 segundos</p>
        </div>
    );
}