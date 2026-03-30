// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Maneja el redirect de OAuth (Google / Facebook).
 * Supabase actualiza la sesión automáticamente;
 * este componente solo redirige según el estado del usuario.
 */
export default function AuthCallback() {
    const { session, aceptoTerminos, completoDiagnostico, loading } = useAuth();
    const navigate = useNavigate();

    // Detectar si es un redirect de recuperación de contraseña
    const isRecovery = (() => {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.replace("#", ""));
        const searchParams = new URLSearchParams(window.location.search);
        return hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";
    })();

    useEffect(() => {
        if (isRecovery) {
            navigate("/reset-contrasena", { replace: true });
            return;
        }
        if (loading) return;

        if (session) {
            if (!aceptoTerminos) {
                navigate("/terminos", { replace: true });
            } else if (!completoDiagnostico) {
                navigate("/diagnostico", { replace: true });
            } else {
                navigate("/panel", { replace: true });
            }
        } else {
            navigate("/login", { replace: true });
        }
    }, [isRecovery, session, aceptoTerminos, completoDiagnostico, loading, navigate]);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0D1117",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            <div style={{ textAlign: "center", color: "#7D8590" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p>Verificando sesión…</p>
            </div>
        </div>
    );
}
