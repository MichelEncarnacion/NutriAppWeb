// src/pages/OlvideContrasena.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

export default function OlvideContrasena() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        });
        setLoading(false);
        if (error) {
            const lower = error.message?.toLowerCase() ?? "";
            if (lower.includes("rate limit")) {
                setError("Demasiados intentos. Espera unos minutos antes de intentar de nuevo.");
            } else if (lower.includes("network") || lower.includes("fetch")) {
                setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
            } else {
                setError("No pudimos enviar el correo. Verifica que el email sea correcto.");
            }
            return;
        }
        setEnviado(true);
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <Logo size="md" />
                    </div>
                    <p style={styles.logoSub}>Recupera tu contraseña</p>
                </div>

                {enviado ? (
                    /* ── Estado: correo enviado ── */
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
                        <div style={{ fontSize: 48 }}>📬</div>
                        <div>
                            <p style={{ color: "#1A1A1A", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                                ¡Correo enviado!
                            </p>
                            <p style={{ color: "#4A5568", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                                Revisa tu bandeja de entrada en <strong style={{ color: "#1A1A1A" }}>{email}</strong>.
                                El enlace expira en 1 hora.
                            </p>
                        </div>
                        <p style={{ color: "#4A5568", fontSize: 13, margin: 0 }}>
                            ¿No llegó?{" "}
                            <button
                                onClick={() => setEnviado(false)}
                                style={{ background: "none", border: "none", color: "#1B5E20", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0 }}
                            >
                                Reenviar
                            </button>
                        </p>
                        <Link to="/login" style={styles.link}>← Volver al inicio de sesión</Link>
                    </div>
                ) : (
                    /* ── Formulario ── */
                    <>
                        <p style={{ color: "#4A5568", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        {error && (
                            <div style={styles.errorBanner}>⚠️ {error}</div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>Correo electrónico</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                            </button>
                        </form>

                        <p style={styles.footerText}>
                            <Link to="/login" style={styles.link}>← Volver al inicio de sesión</Link>
                        </p>
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
    footerText: { textAlign: "center", color: "#4A5568", fontSize: 13, margin: 0 },
    link: { color: "#1B5E20", textDecoration: "none", fontWeight: 600 },
};
