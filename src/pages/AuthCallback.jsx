// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

/**
 * Maneja el redirect de OAuth (Google/Facebook) y recuperación de contraseña.
 * Supabase v2 borra el hash con history.replaceState antes de que React renderice,
 * por lo que detectamos PASSWORD_RECOVERY via onAuthStateChange en lugar del hash.
 */
export default function AuthCallback() {
    const { session, aceptoTerminos, completoDiagnostico, loading } = useAuth();
    const navigate = useNavigate();

    // Detectar evento PASSWORD_RECOVERY (recuperación de contraseña por email)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                navigate("/reset-contrasena", { replace: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [navigate]);

    // Flujo normal: OAuth login o confirmación de email
    useEffect(() => {
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
    }, [session, aceptoTerminos, completoDiagnostico, loading, navigate]);

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
