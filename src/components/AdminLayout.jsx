// src/components/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_NAV = [
    { to: "/admin", label: "Dashboard", icon: "⊞", exact: true },
    { to: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { to: "/admin/planes", label: "Planes IA", icon: "🥗" },
    { to: "/admin/lecciones", label: "Lecciones", icon: "📖" },
];

export default function AdminLayout({ titulo, children }) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
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

                <div className="border-t border-[#1C2330] pt-4">
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
                <span className="font-display font-black text-lg">
                    <span className="text-[#A855F7]">Admin</span>
                    <span className="text-white">Panel</span>
                </span>
                <button onClick={() => setMenuOpen((v) => !v)} className="text-[#7D8590] text-xl w-8 h-8 flex items-center justify-center">
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
                    <div className="border-t border-[#1C2330] mt-2 pt-4">
                        <button
                            onClick={handleLogout}
                            className="text-sm text-[#FF6B6B] px-4 py-3 text-left w-full"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
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
