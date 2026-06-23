// src/components/Layout.jsx
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Logo from "./Logo";
import ThemeToggle from "./ui/ThemeToggle";

const NAV = [
    { to: "/panel", label: "Panel General", icon: "⊞" },
    { to: "/mi-plan", label: "Mi Plan", icon: "🥗" },
    { to: "/lista-compras", label: "Lista de Compras", icon: "🛒" },
    { to: "/lecciones", label: "Lecciones", icon: "📖" },
    { to: "/progreso", label: "Progreso", icon: "📈", soloPremiun: true },
    { to: "/salud-mental", label: "Salud Mental", icon: "🧠" },
    { to: "/ejercicios", label: "Ejercicios", icon: "💪" },
    { to: "/wearables", label: "Wearables", icon: "⌚", proximamente: true },
];

export default function Layout({ children }) {
    const { perfil, rol, esPremium, cerrarSesion, session } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const showUpgrade = params.get("upgrade") === "true";
    const [menuOpen, setMenuOpen] = useState(false);
    const [racha, setRacha] = useState(null);

    useEffect(() => {
        const uid = session?.user?.id;
        if (!uid) return;
        const calcularRacha = async () => {
            const pad = (n) => String(n).padStart(2, "0");
            const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            const hoy = toStr(new Date());
            await supabase.from("resumen_diario").upsert(
                { perfil_id: uid, fecha: hoy },
                { onConflict: "perfil_id,fecha", ignoreDuplicates: true }
            );

            const { data } = await supabase
                .from("resumen_diario")
                .select("fecha")
                .eq("perfil_id", uid)
                .order("fecha", { ascending: false })
                .limit(60);
            const fechas = new Set((data ?? []).map((r) => r.fecha));
            let cursor = new Date();
            if (!fechas.has(toStr(cursor))) cursor.setDate(cursor.getDate() - 1);
            let dias = 0;
            while (fechas.has(toStr(cursor))) { dias++; cursor.setDate(cursor.getDate() - 1); }
            setRacha(dias);
        };
        calcularRacha();
    }, [session?.user?.id]);

    const handleLogout = async () => {
        await cerrarSesion();
        navigate("/login", { replace: true });
    };

    const iniciales = perfil?.nombre
        ? perfil.nombre.slice(0, 1).toUpperCase()
        : perfil?.email?.slice(0, 1).toUpperCase() ?? "U";

    const nombreCorto = perfil?.nombre?.split(" ")[0] ?? "Usuario";

    return (
        <div className="min-h-screen bg-dark-900 text-text-primary flex font-sans text-sm">

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="hidden md:flex w-52 bg-dark-900 border-r border-dark-700 flex-col py-6 px-3 fixed h-full z-20">

                {/* Logo */}
                <div className="px-2 mb-8">
                    <Logo size="sm" />
                    <div className="text-[9px] text-text-muted font-bold tracking-widest mt-1.5 pl-0.5">v1.0 DEMO</div>
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1 flex-1">
                    {NAV.map(({ to, label, icon, soloPremiun, proximamente }) => {
                        const bloqueado = soloPremiun && !esPremium;
                        return (
                            <NavLink
                                key={to}
                                to={bloqueado ? "/panel?upgrade=true" : to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all border-l-[3px]
                  ${isActive && !bloqueado
                                        ? "border-brand-green bg-brand-green/12 text-brand-green"
                                        : "border-transparent text-text-muted hover:bg-dark-700 hover:text-text-primary"
                                    }
                  ${bloqueado ? "opacity-50 cursor-not-allowed" : ""}`
                                }
                            >
                                <span className="text-base">{icon}</span>
                                <span>{label}</span>
                                {bloqueado && <span className="ml-auto text-[9px] bg-brand-orange/20 text-brand-orange font-bold px-1.5 py-0.5 rounded-full">PRO</span>}
                                {proximamente && !bloqueado && <span className="ml-auto text-[9px] bg-brand-blue/20 text-brand-blue font-bold px-1.5 py-0.5 rounded-full">PRONTO</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Usuario */}
                <div className="border-t border-dark-700 pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2 pb-1">
                        <span className="text-[10px] text-text-muted font-bold tracking-widest">MODO OSCURO</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={() => navigate("/perfil")}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-dark-800 transition-colors w-full text-left"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                            {iniciales}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate">{nombreCorto}</div>
                            <div className="text-[10px] text-brand-orange">
                                {rol === "premium" ? "✦ Premium" : rol === "demo" ? "🔬 Demo" : "Freemium"}
                            </div>
                        </div>
                        <span className="text-dark-600 text-xs">⚙</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-text-muted hover:text-brand-red px-3 py-1.5 rounded-lg hover:bg-dark-800 transition-all text-left w-full"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Topbar mobile ────────────────────────────────────────────── */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-dark-900 border-b border-dark-700 z-20 flex items-center justify-between px-4 py-3">
                <Logo size="sm" />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-brand-green/[0.08] border border-brand-green/20 rounded-full px-3 py-1">
                        <span className="text-sm">🔥</span>
                        <span className="font-display font-black text-sm text-text-primary">{racha ?? "—"}</span>
                        <span className="text-[10px] text-text-muted">días</span>
                    </div>
                    <ThemeToggle />
                    <button onClick={() => setMenuOpen((v) => !v)} className="text-text-muted text-xl">
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </header>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-dark-900 pt-16 px-4 flex flex-col gap-2">
                    {NAV.map(({ to, label, icon, soloPremiun, proximamente }) => {
                        const bloqueado = soloPremiun && !esPremium;
                        return (
                            <NavLink
                                key={to}
                                to={bloqueado ? "/panel?upgrade=true" : to}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${isActive ? "bg-brand-green/12 text-brand-green" : "text-text-muted"}`
                                }
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                                {proximamente && !bloqueado && <span className="ml-auto text-[9px] bg-brand-blue/20 text-brand-blue font-bold px-1.5 py-0.5 rounded-full">PRONTO</span>}
                            </NavLink>
                        );
                    })}
                    <NavLink
                        to="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${isActive ? "bg-brand-green/12 text-brand-green" : "text-text-muted"}`
                        }
                    >
                        <span>⚙</span>
                        <span>Mi Perfil</span>
                    </NavLink>
                    <button onClick={handleLogout} className="text-brand-red px-4 py-3 text-left text-sm mt-2">
                        Cerrar sesión
                    </button>
                </div>
            )}

            {/* ── Contenido principal ──────────────────────────────────────── */}
            <main className="flex-1 md:ml-52 flex flex-col">
                <div className="flex-1 md:flex">
                    {/* Área de contenido */}
                    <div className="flex-1 px-4 md:px-8 py-6 md:py-8 mt-12 md:mt-0 overflow-y-auto min-h-screen">
                        {children}
                    </div>

                    {/* Panel derecho — notificaciones (solo desktop) */}
                    <RightPanel racha={racha} />
                </div>
            </main>

            {/* Modal upgrade */}
            {showUpgrade && <UpgradeModal />}
        </div>
    );
}

// ── Panel derecho: notificaciones ────────────────────────────────────────
function RightPanel({ racha }) {
    return (
        <aside className="hidden xl:flex w-56 border-l border-dark-700 flex-col py-6 px-3 flex-shrink-0">
            <p className="text-[9px] text-text-muted font-bold tracking-widest mb-3 px-2">NOTIFICACIONES</p>
            <div className="flex flex-col items-center justify-center py-6 px-2 text-center gap-2">
                <span className="text-2xl">🔔</span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                    Sin notificaciones por ahora.
                </p>
            </div>

            <div className="mt-4 p-3 bg-brand-green/[0.06] border border-brand-green/[0.18] rounded-xl">
                <p className="text-[9px] text-brand-green font-bold tracking-widest mb-1">RACHA ACTIVA 🔥</p>
                <p className="font-display font-black text-2xl text-text-primary">
                    {racha === null ? "—" : racha}{" "}
                    <span className="text-xs font-normal text-text-muted">días</span>
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                    {racha === null ? "" : racha > 0 ? "¡Sigue así!" : "¡Empieza hoy!"}
                </p>
            </div>
        </aside>
    );
}

// ── Modal de upgrade ─────────────────────────────────────────────────────
function UpgradeModal() {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-sm p-8 text-center flex flex-col gap-5">
                <span className="text-4xl">🔒</span>
                <h3 className="text-text-primary font-bold font-display text-lg">Función exclusiva Premium</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                    El panel de <strong className="text-text-primary">Progreso</strong> está disponible para usuarios Premium y Demo.
                    Actualiza tu plan para desbloquear seguimiento completo de métricas.
                </p>
                <button
                    onClick={() => navigate("/panel")}
                    className="w-full py-3 bg-brand-green text-white font-bold font-display rounded-xl hover:bg-brand-greenL transition-all text-sm"
                >
                    Ver planes →
                </button>
                <button
                    onClick={() => navigate("/panel")}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                    Volver al panel
                </button>
            </div>
        </div>
    );
}
