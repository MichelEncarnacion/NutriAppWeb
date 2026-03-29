// Dashboard principal
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            const [
                { count: totalUsers },
                { count: premium },
                { count: planes },
                { count: lecciones },
            ] = await Promise.all([
                supabase.from("perfiles").select("*", { count: "exact", head: true }),
                supabase.from("perfiles").select("*", { count: "exact", head: true }).eq("tipo_usuario", "premium"),
                supabase.from("planes").select("*", { count: "exact", head: true }),
                supabase.from("lecciones").select("*", { count: "exact", head: true }),
            ]);
            setStats({ totalUsers, premium, planes, lecciones });
        };
        cargar();
    }, []);

    const KPIS = [
        { label: "Usuarios totales", value: stats?.totalUsers ?? "—", icon: "👥", color: "#58A6FF" },
        { label: "Premium activos", value: stats?.premium ?? "—", icon: "✦", color: "#F0A500" },
        { label: "Planes generados", value: stats?.planes ?? "—", icon: "🥗", color: "#3DDC84" },
        { label: "Lecciones activas", value: stats?.lecciones ?? "—", icon: "📖", color: "#A855F7" },
    ];

    return (
        <AdminLayout titulo="Dashboard">
            <div className="flex flex-col gap-6">

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    {KPIS.map((k, i) => (
                        <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5 relative overflow-hidden">
                            <div className="text-2xl mb-3">{k.icon}</div>
                            <div className="font-display font-black text-3xl" style={{ color: k.color }}>{k.value}</div>
                            <div className="text-xs text-[#7D8590] mt-1">{k.label}</div>
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10" style={{ background: k.color, filter: "blur(20px)" }} />
                        </div>
                    ))}
                </div>

                {/* Tabla resumen reciente */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                    <h3 className="text-white font-bold font-display text-sm mb-4">Usuarios recientes</h3>
                    <RecentUsers />
                </div>

                {/* Planes con error */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                    <h3 className="text-white font-bold font-display text-sm mb-4">Planes con error ⚠️</h3>
                    <ErrorPlanes />
                </div>
            </div>
        </AdminLayout>
    );
}

function RecentUsers() {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        supabase.from("perfiles").select("id,nombre,email,tipo_usuario,fecha_registro")
            .order("fecha_registro", { ascending: false }).limit(8)
            .then(({ data }) => setUsers(data ?? []));
    }, []);

    const ROL_BADGE = {
        demo: { bg: "rgba(240,165,0,.12)", color: "#F0A500", label: "Demo" },
        freemium: { bg: "rgba(88,166,255,.12)", color: "#58A6FF", label: "Freemium" },
        premium: { bg: "rgba(61,220,132,.12)", color: "#3DDC84", label: "Premium" },
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-[#7D8590] text-left border-b border-[#2D3748]">
                        {["Nombre", "Email", "Tipo", "Registro"].map((h) => (
                            <th key={h} className="pb-3 pr-4 text-xs font-bold tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3748]">
                    {users.map((u) => {
                        const b = ROL_BADGE[u.tipo_usuario] ?? ROL_BADGE.freemium;
                        return (
                            <tr key={u.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                <td className="py-3 pr-4 text-white font-semibold">{u.nombre ?? "Sin nombre"}</td>
                                <td className="py-3 pr-4 text-[#7D8590] text-xs">{u.email}</td>
                                <td className="py-3 pr-4">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                                </td>
                                <td className="py-3 pr-4 text-[#7D8590] text-xs">
                                    {new Date(u.fecha_registro).toLocaleDateString("es-MX")}
                                </td>
                                <td className="py-3">
                                    <span className="text-[10px] font-bold text-[#3DDC84]">● Activo</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function ErrorPlanes() {
    const [planes, setPlanes] = useState([]);
    const [regenerando, setRegenerando] = useState({}); // { [planId]: 'loading' | 'ok' | 'error' }

    const cargar = () => {
        supabase.from("planes").select("id,perfil_id,estado,created_at")
            .eq("estado", "error").order("created_at", { ascending: false }).limit(5)
            .then(({ data }) => setPlanes(data ?? []));
    };

    useEffect(() => { cargar(); }, []);

    const regenerar = async (plan) => {
        setRegenerando((s) => ({ ...s, [plan.id]: "loading" }));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-plan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ target_perfil_id: plan.perfil_id }),
                }
            );
            if (!res.ok) throw new Error();
            setRegenerando((s) => ({ ...s, [plan.id]: "ok" }));
            setTimeout(() => cargar(), 2000);
        } catch {
            setRegenerando((s) => ({ ...s, [plan.id]: "error" }));
        }
    };

    if (planes.length === 0)
        return <p className="text-[#7D8590] text-sm">✅ No hay planes con error actualmente.</p>;

    return (
        <div className="flex flex-col gap-2">
            {planes.map((p) => {
                const estado = regenerando[p.id];
                return (
                    <div key={p.id} className="flex items-center justify-between bg-[rgba(255,107,107,.06)] border border-[rgba(255,107,107,.2)] rounded-xl p-3">
                        <div>
                            <p className="text-white text-xs font-semibold">Plan {p.id.slice(0, 8)}…</p>
                            <p className="text-[#7D8590] text-[11px]">{new Date(p.created_at).toLocaleString("es-MX")}</p>
                        </div>
                        <button
                            onClick={() => regenerar(p)}
                            disabled={estado === "loading" || estado === "ok"}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-60
                                ${estado === "ok"
                                    ? "bg-[#3DDC84] text-black"
                                    : estado === "error"
                                        ? "bg-[rgba(255,107,107,.3)] text-[#FF6B6B]"
                                        : "bg-[#FF6B6B] text-white hover:bg-[#ff8585]"
                                }`}
                        >
                            {estado === "loading" ? "Generando…" : estado === "ok" ? "✓ Listo" : estado === "error" ? "Reintentar" : "Regenerar"}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}