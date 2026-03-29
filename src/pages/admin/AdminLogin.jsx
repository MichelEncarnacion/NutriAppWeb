// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword(form);
        setLoading(false);
        if (error) { setError("Credenciales incorrectas."); return; }

        // Verifica custom claim de admin en el JWT
        const jwt = data.session?.access_token;
        let payload = null;
        try {
            payload = JSON.parse(atob(jwt.split(".")[1]));
        } catch {
            await supabase.auth.signOut();
            setError("Token inválido. Intenta de nuevo.");
            setLoading(false);
            return;
        }
        if (payload?.user_metadata?.role !== "admin" && payload?.app_metadata?.role !== "admin") {
            await supabase.auth.signOut();
            setError("No tienes permisos de administrador.");
            return;
        }
        navigate("/admin", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4 font-sans">
            <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-sm p-8 flex flex-col gap-5">
                <div className="text-center">
                    <span className="text-4xl block mb-2">🔐</span>
                    <span className="font-display font-black text-xl text-[#A855F7]">Admin</span>
                    <span className="font-display font-black text-xl text-white">Panel</span>
                    <p className="text-[#7D8590] text-xs mt-1">Solo para el equipo NutriiApp</p>
                </div>

                {error && <div className="bg-[rgba(255,107,107,.12)] border border-[rgba(255,107,107,.3)] text-[#FF6B6B] rounded-xl p-3 text-sm">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {[
                        { name: "email", type: "email", placeholder: "admin@nutriiapp.com", label: "Correo" },
                        { name: "password", type: "password", placeholder: "••••••••", label: "Contraseña" },
                    ].map((f) => (
                        <div key={f.name} className="flex flex-col gap-1.5">
                            <label className="text-xs text-[#7D8590]">{f.label}</label>
                            <input
                                name={f.name} type={f.type} placeholder={f.placeholder}
                                value={form[f.name]}
                                onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
                                required
                                className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#A855F7] transition-colors"
                            />
                        </div>
                    ))}
                    <button
                        type="submit" disabled={loading}
                        className="py-3 bg-[#A855F7] text-white font-bold font-display rounded-xl hover:bg-[#C084FC] transition-all text-sm disabled:opacity-60 mt-2"
                    >
                        {loading ? "Verificando…" : "Entrar al panel"}
                    </button>
                </form>
            </div>
        </div>
    );
}
