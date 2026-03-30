// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Maneja el redirect de OAuth (Google/Facebook) y recuperación de contraseña.
 *
 * El evento PASSWORD_RECOVERY se captura en AuthContext (onAuthStateChange)
 * que setea isRecoverySession=true y detiene el flujo normal. Aquí solo
 * leemos ese flag y redirigimos antes de que el flujo OAuth normal se ejecute.
 */
export default function AuthCallback() {
    const { session, aceptoTerminos, completoDiagnostico, loading, isRecoverySession } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Sesión de recuperación de contraseña → siempre ir a reset
        if (isRecoverySession) {
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
    }, [isRecoverySession, session, aceptoTerminos, completoDiagnostico, loading, navigate]);

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
