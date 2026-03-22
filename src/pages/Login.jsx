// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
    const { loginConEmail, loginConGoogle, loginConFacebook } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirige a donde el usuario intentaba ir antes de ser mandado al login
    const destino = location.state?.from?.pathname ?? "/panel";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleEmail = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error } = await loginConEmail(form.email, form.password);
        setLoading(false);
        if (error) {
            setError(traducirError(error.message));
            return;
        }
        navigate(destino, { replace: true });
    };

    const handleGoogle = async () => {
        setError(null);
        const { error } = await loginConGoogle();
        if (error) setError(traducirError(error.message));
        // La redirección la maneja /auth/callback
    };

    const handleFacebook = async () => {
        setError(null);
        const { error } = await loginConFacebook();
        if (error) setError(traducirError(error.message));
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <span style={styles.logoText}>NutriiApp</span>
                    <p style={styles.logoSub}>Inicia sesión en tu cuenta</p>
                </div>

                {/* Error */}
                {error && (
                    <div style={styles.errorBanner}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Formulario email */}
                <form onSubmit={handleEmail} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Correo electrónico</label>
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Contraseña</label>
                        <input
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Ingresando…" : "Iniciar sesión"}
                    </button>
                </form>

                {/* Divisor */}
                <div style={styles.divisor}>
                    <span style={styles.divisorLine} />
                    <span style={styles.divisorText}>o continúa con</span>
                    <span style={styles.divisorLine} />
                </div>

                {/* OAuth */}
                <div style={styles.oauthRow}>
                    <button onClick={handleGoogle} style={styles.btnOauth}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button onClick={handleFacebook} style={styles.btnOauth}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                {/* Links */}
                <p style={styles.footerText}>
                    ¿No tienes cuenta?{" "}
                    <Link to="/registro" style={styles.link}>Regístrate gratis</Link>
                </p>

            </div>
        </div>
    );
}

// ── Traducción de errores de Supabase al español ────────────────────────
function traducirError(msg) {
    const map = {
        "Invalid login credentials": "Correo o contraseña incorrectos.",
        "Email not confirmed": "Confirma tu correo antes de iniciar sesión.",
        "User already registered": "Este correo ya está registrado.",
        "Password should be at least": "La contraseña debe tener al menos 6 caracteres.",
        "Unable to validate email": "Correo inválido.",
    };
    for (const [key, val] of Object.entries(map)) {
        if (msg.includes(key)) return val;
    }
    return "Ocurrió un error. Intenta de nuevo.";
}

// ── Estilos ─────────────────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        background: "#0D1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'DM Sans', sans-serif",
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
        fontFamily: "'Syne', sans-serif",
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
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        transition: "border-color .2s",
    },

    btnPrimary: {
        background: "#3DDC84",
        color: "#000",
        border: "none",
        borderRadius: 10,
        padding: "13px",
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "background .2s",
        marginTop: 4,
    },

    divisor: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    divisorLine: {
        flex: 1,
        height: 1,
        background: "#2D3748",
        display: "block",
    },
    divisorText: { color: "#7D8590", fontSize: 12, whiteSpace: "nowrap" },

    oauthRow: { display: "flex", gap: 10 },
    btnOauth: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "#1C2330",
        border: "1px solid #2D3748",
        borderRadius: 10,
        padding: "11px",
        color: "#E6EDF3",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        transition: "border-color .2s",
    },

    footerText: { textAlign: "center", color: "#7D8590", fontSize: 13, margin: 0 },
    link: { color: "#3DDC84", textDecoration: "none", fontWeight: 600 },
};