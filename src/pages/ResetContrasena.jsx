// src/pages/ResetContrasena.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

export default function ResetContrasena() {
    const navigate = useNavigate();
    const { isRecoverySession, session } = useAuth();

    useEffect(() => {
        if (!isRecoverySession && !session) {
            navigate("/olvide-contrasena", { replace: true });
        }
    }, [isRecoverySession, session, navigate]);

    const [form, setForm] = useState({ password: "", confirmar: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (form.password !== form.confirmar) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: form.password });
        setLoading(false);

        if (error) {
            setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
            return;
        }

        setExito(true);
        setTimeout(() => navigate("/panel", { replace: true }), 2500);
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <Logo size="md" />
                    </div>
                    <p style={styles.logoSub}>Nueva contraseña</p>
                </div>

                {exito ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
                        <div style={{ fontSize: 48 }}>✅</div>
                        <div>
                            <p style={{ color: "#1B5E20", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                ¡Contraseña actualizada!
                            </p>
                            <p style={{ color: "#4A5568", fontSize: 14, margin: 0 }}>
                                Redirigiendo a tu panel…
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={{ color: "#4A5568", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                            Elige una contraseña nueva segura para tu cuenta.
                        </p>

                        {error && (
                            <div style={styles.errorBanner}>⚠️ {error}</div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>Nueva contraseña</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Confirmar contraseña</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Repite tu contraseña"
                                    value={form.confirmar}
                                    onChange={(e) => setForm((f) => ({ ...f, confirmar: e.target.value }))}
                                    required
                                    style={{
                                        ...styles.input,
                                        borderColor: form.confirmar && form.confirmar !== form.password ? "rgba(214,69,69,.6)" : "#E2E8F0",
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Guardando…" : "Guardar nueva contraseña"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    card: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    },
    logo: { textAlign: "center" },
    logoText: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: "#1B5E20",
        display: "block",
        marginBottom: 6,
    },
    logoSub: { color: "#4A5568", fontSize: 14, margin: 0 },
    errorBanner: {
        background: "rgba(214,69,69,.10)",
        border: "1px solid rgba(214,69,69,.3)",
        color: "#D64545",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 13,
    },
    form: { display: "flex", flexDirection: "column", gap: 14 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 13, color: "#4A5568", fontWeight: 500 },
    input: {
        background: "#F8F9FA",
        border: "1px solid #E2E8F0",
        borderRadius: 10,
        padding: "12px 14px",
        color: "#1A1A1A",
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        outline: "none",
        transition: "border-color .2s",
    },
    btnPrimary: {
        background: "#1B5E20",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 10,
        padding: "13px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        marginTop: 4,
    },
};
