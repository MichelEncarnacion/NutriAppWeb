// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";

export default function Login() {
    const { loginConEmail } = useAuth();
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

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <Logo size="md" />
                    </div>
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

                {/* Links */}
                <p style={{ ...styles.footerText, marginBottom: -8 }}>
                    <Link to="/olvide-contrasena" style={{ ...styles.link, color: "#7D8590", fontWeight: 400 }}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </p>
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
        transition: "background .2s",
        marginTop: 4,
    },

    footerText: { textAlign: "center", color: "#7D8590", fontSize: 13, margin: 0 },
    link: { color: "#3DDC84", textDecoration: "none", fontWeight: 600 },
};