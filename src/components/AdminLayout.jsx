// src/components/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Button from "./ui/Button";
import { Field } from "./ui/Input";
import Input from "./ui/Input";
import ThemeToggle from "./ui/ThemeToggle";

const ADMIN_NAV = [
    { to: "/admin",           label: "Dashboard", icon: "⊞", exact: true },
    { to: "/admin/usuarios",  label: "Usuarios",  icon: "👥" },
    { to: "/admin/planes",    label: "Planes IA", icon: "🥗" },
    { to: "/admin/lecciones", label: "Lecciones", icon: "📖" },
    { to: "/admin/noticias",   label: "Noticias",  icon: "📰" },
    { to: "/admin/articulos",        label: "Artículos",        icon: "✍️" },
    { to: "/admin/reconocimientos",  label: "Reconocimientos",  icon: "🏆" },
    { to: "/admin/nosotros",         label: "Quiénes somos",    icon: "👤" },
    { to: "/admin/solicitudes",      label: "Solicitudes demo",  icon: "📋" },
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
        <div className="min-h-screen bg-dark-900 text-text-primary flex font-sans text-sm">

            {/* ── Sidebar (desktop) ─────────────────────────────────── */}
            <aside className="hidden md:flex w-52 bg-dark-900 border-r border-dark-600 flex-col py-6 px-3 fixed h-full z-20">
                <div className="px-2 mb-8">
                    <span className="font-display font-black text-xl text-brand-purple">Admin</span>
                    <span className="font-display font-black text-xl text-text-primary">Panel</span>
                    <div className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">NUTRIIAPP v1.0</div>
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
                                    ? "border-brand-purple bg-brand-purple/12 text-brand-purple"
                                    : "border-transparent text-text-muted hover:bg-dark-700 hover:text-text-primary"
                                }`
                            }
                        >
                            <span className="text-base">{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-dark-600 pt-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between px-3 pb-2">
                        <span className="text-[10px] text-text-muted font-bold tracking-widest">MODO OSCURO</span>
                        <ThemeToggle />
                    </div>
                    <div className="text-[10px] text-text-muted px-3 pb-1 truncate">{session?.user?.email}</div>
                    <button
                        onClick={() => { setPassForm({ nueva: "", confirmar: "" }); setPassError(null); setPassMensaje(null); setModalPass(true); }}
                        className="text-xs text-text-muted hover:text-brand-blue px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-all w-full text-left"
                    >
                        Cambiar contraseña
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-text-muted hover:text-brand-red px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-all w-full text-left"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Topbar (mobile) ───────────────────────────────────── */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-dark-900 border-b border-dark-600 z-30 flex items-center justify-between px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold tracking-widest text-brand-purple font-display">ADMINPANEL</span>
                    <span className="text-text-primary font-black font-display text-sm leading-tight">{titulo}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <ThemeToggle />
                    <button onClick={() => setMenuOpen((v) => !v)} className="text-text-muted text-xl w-8 h-8 flex items-center justify-center">
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </header>

            {/* ── Mobile menu overlay ───────────────────────────────── */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-20 bg-dark-900 pt-16 px-4 flex flex-col gap-2">
                    {ADMIN_NAV.map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all
                ${isActive
                                    ? "bg-brand-purple/12 text-brand-purple"
                                    : "text-text-muted hover:bg-dark-700 hover:text-text-primary"
                                }`
                            }
                        >
                            <span className="text-lg">{icon}</span>
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}
                    <div className="border-t border-dark-600 mt-2 pt-4 flex flex-col gap-1">
                        <div className="text-[10px] text-text-muted px-4 pb-1 truncate">{session?.user?.email}</div>
                        <button
                            onClick={() => { setMenuOpen(false); setPassForm({ nueva: "", confirmar: "" }); setPassError(null); setPassMensaje(null); setModalPass(true); }}
                            className="text-sm text-brand-blue px-4 py-3 text-left w-full"
                        >
                            Cambiar contraseña
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-brand-red px-4 py-3 text-left w-full"
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
                        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                        onClick={() => setModalPass(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="w-full max-w-sm rounded-2xl border border-dark-600 bg-dark-800 flex flex-col shadow-[0_16px_56px_rgba(0,0,0,0.13)]">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
                                <h3 className="text-text-primary font-bold font-display text-sm">Cambiar contraseña</h3>
                                <button
                                    onClick={() => setModalPass(false)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-text-muted hover:text-text-primary transition-colors bg-dark-700"
                                >✕</button>
                            </div>
                            <div className="flex flex-col gap-4 px-5 py-5">
                                <div className="text-[11px] text-text-muted bg-dark-700 rounded-xl px-3 py-2 truncate">
                                    {session?.user?.email}
                                </div>
                                <Field label="Nueva contraseña" accent="purple">
                                    <Input
                                        accent="purple"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={passForm.nueva}
                                        onChange={(e) => setPassForm((f) => ({ ...f, nueva: e.target.value }))}
                                    />
                                </Field>
                                <Field label="Confirmar contraseña" accent="purple">
                                    <Input
                                        accent="purple"
                                        type="password"
                                        placeholder="Repite la contraseña"
                                        value={passForm.confirmar}
                                        onChange={(e) => setPassForm((f) => ({ ...f, confirmar: e.target.value }))}
                                    />
                                </Field>
                                {passError && (
                                    <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-xl px-3 py-2.5 text-xs">{passError}</div>
                                )}
                                {passMensaje && (
                                    <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-xl px-3 py-2.5 text-xs">{passMensaje}</div>
                                )}
                            </div>
                            <div className="flex gap-3 px-5 py-4 border-t border-dark-600">
                                <Button variant="secondary" onClick={() => setModalPass(false)} fullWidth>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="admin"
                                    onClick={cambiarPassword}
                                    disabled={guardandoPass || !passForm.nueva || !passForm.confirmar}
                                    fullWidth
                                >
                                    {guardandoPass ? "Guardando…" : "Actualizar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Main content ──────────────────────────────────────── */}
            <main className="flex-1 md:ml-52 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-text-primary text-xl md:text-2xl font-black font-display">{titulo}</h1>
                    <div className="h-0.5 w-16 bg-brand-purple rounded-full mt-2" />
                </div>
                {children}
            </main>
        </div>
    );
}
