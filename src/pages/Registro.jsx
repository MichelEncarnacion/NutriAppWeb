// src/pages/Registro.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Logo from "../components/Logo";

export default function Registro() {
    const { registrar } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmar: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [reenvioMsg, setReenvioMsg] = useState(null);
    const [reenviando, setReenviando] = useState(false);

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
        if (data.session && data.user?.confirmed_at) {
            // Sesión inmediata + email confirmado (confirm email desactivado en Supabase)
            navigate("/terminos", { replace: true });
        } else {
            // Necesita confirmar email (user exists pero sin sesión o sin confirmed_at)
            setEnviado(true);
        }
    };

    const handleReenviar = async () => {
        setReenviando(true);
        setReenvioMsg(null);
        const { error } = await supabase.auth.resend({ type: "signup", email: form.email });
        setReenviando(false);
        if (error) {
            setReenvioMsg({ tipo: "error", texto: "No se pudo reenviar. Intenta en unos minutos." });
        } else {
            setReenvioMsg({ tipo: "ok", texto: "Correo reenviado. Revisa tu bandeja de entrada y spam." });
        }
    };

    if (enviado) return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A1A", marginBottom: 8 }}>
                        Revisa tu correo
                    </h2>
                    <p style={{ color: "#4A5568", fontSize: 14, lineHeight: 1.6 }}>
                        Te enviamos un enlace de confirmación a{" "}
                        <strong style={{ color: "#1A1A1A" }}>{form.email}</strong>.
                        Haz clic en el enlace para activar tu cuenta.
                    </p>
                    <p style={{ color: "#4A5568", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
                        Si no lo ves en unos minutos, revisa tu carpeta de spam.
                    </p>

                    {reenvioMsg && (
                        <div style={{
                            marginTop: 16,
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            background: reenvioMsg.tipo === "ok" ? "rgba(27,94,32,.08)" : "rgba(214,69,69,.10)",
                            color: reenvioMsg.tipo === "ok" ? "#1B5E20" : "#D64545",
                            border: `1px solid ${reenvioMsg.tipo === "ok" ? "rgba(27,94,32,.25)" : "rgba(214,69,69,.25)"}`,
                        }}>
                            {reenvioMsg.texto}
                        </div>
                    )}

                    <button
                        onClick={handleReenviar}
                        disabled={reenviando}
                        style={{
                            marginTop: 20,
                            background: "transparent",
                            border: "1px solid #E2E8F0",
                            borderRadius: 10,
                            padding: "11px 20px",
                            color: "#4A5568",
                            fontSize: 13,
                            cursor: reenviando ? "not-allowed" : "pointer",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            width: "100%",
                        }}
                    >
                        {reenviando ? "Reenviando…" : "Reenviar correo de confirmación"}
                    </button>
                    <Link to="/login" style={{ ...styles.link, display: "inline-block", marginTop: 14, fontSize: 13 }}>
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
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <Logo size="md" />
                    </div>
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

// ── Estilos compartidos ──────────────────────────────────────────────────
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
        gap: 18,
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
    form: { display: "flex", flexDirection: "column", gap: 13 },
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