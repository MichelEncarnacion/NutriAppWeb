// src/pages/ResetContrasena.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

export default function ResetContrasena() {
    const navigate = useNavigate();
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
                            <p style={{ color: "#3DDC84", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                ¡Contraseña actualizada!
                            </p>
                            <p style={{ color: "#7D8590", fontSize: 14, margin: 0 }}>
                                Redirigiendo a tu panel…
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={{ color: "#7D8590", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
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
                                        borderColor: form.confirmar && form.confirmar !== form.password ? "rgba(255,107,107,.5)" : "#2D3748",
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
        background: "#0D1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    card: {
        background: "#161B22",
        border: "1px solid #2D3748",
        borderRadius: 20,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 20,
    },
    logo: { textAlign: "center" },
    logoText: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        color: "#3DDC84",
        display: "block",
        marginBottom: 6,
    },
    logoSub: { color: "#7D8590", fontSize: 14, margin: 0 },
    errorBanner: {
        background: "rgba(255,107,107,.12)",
        border: "1px solid rgba(255,107,107,.3)",
        color: "#FF6B6B",
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 13,
    },
    form: { display: "flex", flexDirection: "column", gap: 14 },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { fontSize: 13, color: "#7D8590", fontWeight: 500 },
    input: {
        background: "#1C2330",
        border: "1px solid #2D3748",
        borderRadius: 10,
        padding: "12px 14px",
        color: "#E6EDF3",
        fontSize: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        outline: "none",
        transition: "border-color .2s",
    },
    btnPrimary: {
        background: "#3DDC84",
        color: "#000",
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
