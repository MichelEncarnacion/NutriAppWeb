// src/components/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const ADMIN_NAV = [
    { to: "/admin", label: "Dashboard", icon: "⊞", exact: true },
    { to: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { to: "/admin/planes", label: "Planes IA", icon: "🥗" },
    { to: "/admin/lecciones", label: "Lecciones", icon: "📖" },
];

export default function AdminLayout({ titulo, children }) {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    // Modal cambiar contraseña
    const [modalPass, setModalPass] = useState(false);
    const [passForm, setPassForm] = useState({ nueva: "", confirmar: "" });
    const [passError, setPassError] = useState(null);
    const [passMensaje, setPassMensaje] = useState(null);
    const [guardandoPass, setGuardandoPass] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
    };

    const cambiarPassword = async () => {
        setPassError(null);
        setPassMensaje(null);
        if (passForm.nueva.length < 6) { setPassError("La contraseña debe tener al menos 6 caracteres."); return; }
        if (passForm.nueva !== passForm.confirmar) { setPassError("Las contraseñas no coinciden."); return; }
        setGuardandoPass(true);
        const { error } = await supabase.auth.updateUser({ password: passForm.nueva });
        setGuardandoPass(false);
        if (error) { setPassError(error.message); return; }
        setPassMensaje("Contraseña actualizada correctamente.");
        setPassForm({ nueva: "", confirmar: "" });
        setTimeout(() => { setModalPass(false); setPassMensaje(null); }, 1800);
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex font-sans text-sm">

            {/* ── Sidebar (desktop) ─────────────────────────────────── */}
            <aside className="hidden md:flex w-52 bg-[#0D1117] border-r border-[#1C2330] flex-col py-6 px-3 fixed h-full z-20">
                <div className="px-2 mb-8">
                    <span className="font-display font-black text-xl text-[#A855F7]">Admin</span>
                    <span className="font-display font-black text-xl text-white">Panel</span>
                    <div className="text-[9px] text-[#7D8590] font-bold tracking-widest mt-0.5">NUTRIIAPP v1.0</div>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {ADMIN_NAV.map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all border-l-[3px]
                ${isActive
                                    ? "border-[#A855F7] bg-[rgba(168,85,247,0.12)] text-[#A855F7]"
                                    : "border-transparent text-[#7D8590] hover:bg-[#161B22] hover:text-white"
                                }`
                            }
                        >
                            <span className="text-base">{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-[#1C2330] pt-4 flex flex-col gap-1">
                    <div className="text-[10px] text-[#4A5568] px-3 pb-1 truncate">{session?.user?.email}</div>
                    <button
                        onClick={() => { setPassForm({ nueva: "", confirmar: "" }); setPassError(null); setPassMensaje(null); setModalPass(true); }}
                        className="text-xs text-[#7D8590] hover:text-[#58A6FF] px-3 py-1.5 rounded-lg hover:bg-[#161B22] transition-all w-full text-left"
                    >
                        Cambiar contraseña
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-[#7D8590] hover:text-[#FF6B6B] px-3 py-1.5 rounded-lg hover:bg-[#161B22] transition-all w-full text-left"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Topbar (mobile) ───────────────────────────────────── */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-[#0D1117] border-b border-[#1C2330] z-30 flex items-center justify-between px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold tracking-widest text-[#A855F7] font-display">ADMINPANEL</span>
                    <span className="text-white font-black font-display text-sm leading-tight">{titulo}</span>
                </div>
                <button onClick={() => setMenuOpen((v) => !v)} className="text-[#7D8590] text-xl w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {menuOpen ? "✕" : "☰"}
                </button>
            </header>

            {/* ── Mobile menu overlay ───────────────────────────────── */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-[#0D1117] pt-16 px-4 flex flex-col gap-2">
                    {ADMIN_NAV.map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all
                ${isActive
                                    ? "bg-[rgba(168,85,247,0.12)] text-[#A855F7]"
                                    : "text-[#7D8590] hover:bg-[#161B22] hover:text-white"
                                }`
                            }
                        >
                            <span className="text-lg">{icon}</span>
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}
                    <div className="border-t border-[#1C2330] mt-2 pt-4 flex flex-col gap-1">
                        <div className="text-[10px] text-[#4A5568] px-4 pb-1 truncate">{session?.user?.email}</div>
                        <button
                            onClick={() => { setMenuOpen(false); setPassForm({ nueva: "", confirmar: "" }); setPassError(null); setPassMensaje(null); setModalPass(true); }}
                            className="text-sm text-[#58A6FF] px-4 py-3 text-left w-full"
                        >
                            Cambiar contraseña
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-[#FF6B6B] px-4 py-3 text-left w-full"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal cambiar contraseña ──────────────────────────── */}
            {modalPass && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                        onClick={() => setModalPass(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="w-full max-w-sm rounded-2xl border border-[#2D3748] flex flex-col" style={{ background: "#161B22" }}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D3748]">
                                <h3 className="text-white font-bold font-display text-sm">Cambiar contraseña</h3>
                                <button
                                    onClick={() => setModalPass(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[#7D8590] hover:text-white transition-colors"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >✕</button>
                            </div>
                            <div className="flex flex-col gap-4 px-5 py-5">
                                <div className="text-[11px] text-[#7D8590] bg-[#1C2330] rounded-xl px-3 py-2 truncate">
                                    {session?.user?.email}
                                </div>
                                <div>
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Nueva contraseña</label>
                                    <input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={passForm.nueva}
                                        onChange={(e) => setPassForm((f) => ({ ...f, nueva: e.target.value }))}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#58A6FF] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Confirmar contraseña</label>
                                    <input
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        value={passForm.confirmar}
                                        onChange={(e) => setPassForm((f) => ({ ...f, confirmar: e.target.value }))}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#58A6FF] transition-colors"
                                    />
                                </div>
                                {passError && (
                                    <div className="bg-[rgba(255,107,107,.1)] border border-[rgba(255,107,107,.3)] text-[#FF6B6B] rounded-xl px-3 py-2.5 text-xs">{passError}</div>
                                )}
                                {passMensaje && (
                                    <div className="bg-[rgba(61,220,132,.1)] border border-[rgba(61,220,132,.3)] text-[#3DDC84] rounded-xl px-3 py-2.5 text-xs">{passMensaje}</div>
                                )}
                            </div>
                            <div className="flex gap-3 px-5 py-4 border-t border-[#2D3748]">
                                <button
                                    onClick={() => setModalPass(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#4A5568] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={cambiarPassword}
                                    disabled={guardandoPass || !passForm.nueva || !passForm.confirmar}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#58A6FF] hover:bg-[#79B8FF] transition-all disabled:opacity-50"
                                >
                                    {guardandoPass ? "Guardando…" : "Actualizar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Main content ──────────────────────────────────────── */}
            <main className="flex-1 md:ml-52 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-white text-xl md:text-2xl font-black font-display">{titulo}</h1>
                    <div className="h-0.5 w-16 bg-[#A855F7] rounded-full mt-2" />
                </div>
                {children}
            </main>
        </div>
    );
}
