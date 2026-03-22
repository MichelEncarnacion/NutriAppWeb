// src/components/AdminLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ADMIN_NAV = [
    { to: "/admin", label: "Dashboard", icon: "⊞", exact: true },
    { to: "/admin/usuarios", label: "Usuarios", icon: "👥" },
    { to: "/admin/planes", label: "Planes IA", icon: "🥗" },
    { to: "/admin/lecciones", label: "Lecciones", icon: "📖" },
];

export default function AdminLayout({ titulo, children }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex font-sans text-sm">

            {/* Sidebar admin */}
            <aside className="hidden md:flex w-52 bg-[#0D1117] border-r border-[#1C2330] flex-col py-6 px-3 fixed h-full z-20">

                {/* Logo admin */}
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

            {/* Main content */}
            <main className="flex-1 md:ml-52 p-6 md:p-8 min-h-screen">
                <div className="mb-6">
                    <h1 className="text-white text-2xl font-black font-display">{titulo}</h1>
                    <div className="h-0.5 w-16 bg-[#A855F7] rounded-full mt-2" />
                </div>
                {children}
            </main>
        </div>
    );
}
