// src/pages/Registro.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Registro() {
    const { registrar } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validar = () => {
        if (!form.nombre.trim()) return "El nombre es obligatorio.";
        if (!form.email.includes("@")) return "Correo inválido.";
        if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        if (form.password !== form.confirmar) return "Las contraseñas no coinciden.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const validacion = validar();
        if (validacion) { setError(validacion); return; }

        setLoading(true);
        const { data, error } = await registrar(form.email, form.password);
        setLoading(false);

        if (error) {
            setError(traducirError(error.message));
            return;
        }

        // Supabase envía email de confirmación por defecto.
        // Si en tu proyecto tienes "Confirm email" desactivado, el usuario
        // queda logueado de inmediato y puedes redirigir directo.
        if (data.session) {
            // Sesión inmediata (confirm email desactivado en Supabase)
            navigate("/terminos", { replace: true });
        } else {
            // Necesita confirmar email
            setEnviado(true);
        }
    };

    if (enviado) return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", color: "#E6EDF3", marginBottom: 8 }}>
                        Revisa tu correo
                    </h2>
                    <p style={{ color: "#7D8590", fontSize: 14, lineHeight: 1.6 }}>
                        Te enviamos un enlace de confirmación a <strong style={{ color: "#E6EDF3" }}>{form.email}</strong>.
                        Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <Link to="/login" style={{ ...styles.link, display: "inline-block", marginTop: 20 }}>
                        Volver al login →
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.logo}>
                    <span style={styles.logoText}>NutriiApp</span>
                    <p style={styles.logoSub}>Crea tu cuenta gratis</p>
                </div>

                {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {[
                        { name: "nombre", label: "Nombre completo", type: "text", placeholder: "Emanuel Basilio" },
                        { name: "email", label: "Correo electrónico", type: "email", placeholder: "tu@email.com" },
                        { name: "password", label: "Contraseña", type: "password", placeholder: "Mínimo 6 caracteres" },
                        { name: "confirmar", label: "Confirmar contraseña", type: "password", placeholder: "Repite tu contraseña" },
                    ].map(({ name, label, type, placeholder }) => (
                        <div key={name} style={styles.field}>
                            <label style={styles.label}>{label}</label>
                            <input
                                name={name}
                                type={type}
                                placeholder={placeholder}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Creando cuenta…" : "Crear cuenta"}
                    </button>
                </form>

                <p style={styles.footerText}>
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" style={styles.link}>Inicia sesión</Link>
                </p>

            </div>
        </div>
    );
}

function traducirError(msg) {
    if (msg.includes("already registered")) return "Este correo ya está registrado.";
    if (msg.includes("Password")) return "La contraseña debe tener al menos 6 caracteres.";
    if (msg.includes("email")) return "Correo inválido.";
    return "Ocurrió un error. Intenta de nuevo.";
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/AuthCallback.jsx
// Maneja el redirect de OAuth (Google / Facebook) y redirige según estado
// ─────────────────────────────────────────────────────────────────────────────
export function AuthCallback() {
    // Supabase maneja el token en la URL automáticamente.
    // onAuthStateChange en AuthContext lo detecta y actualiza la sesión.
    // Este componente solo necesita esperar y redirigir.
    const { session, aceptoTerminos, completoDiagnostico } = useAuth?.() ?? {};
    const navigate = useNavigate();

    // Redirige según el estado del usuario
    if (session) {
        if (!aceptoTerminos) return navigate("/terminos", { replace: true });
        if (!completoDiagnostico) return navigate("/diagnostico", { replace: true });
        return navigate("/panel", { replace: true });
    }

    return (
        <div style={styles.page}>
            <div style={{ textAlign: "center", color: "#7D8590" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p style={{ fontFamily: "'DM Sans',sans-serif" }}>Verificando sesión…</p>
            </div>
        </div>
    );
}

// ── Estilos compartidos ──────────────────────────────────────────────────
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
        gap: 18,
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
    form: { display: "flex", flexDirection: "column", gap: 13 },
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
        marginTop: 4,
    },
    footerText: { textAlign: "center", color: "#7D8590", fontSize: 13, margin: 0 },
    link: { color: "#3DDC84", textDecoration: "none", fontWeight: 600 },
};