// Dashboard principal
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString().split("T")[0];

            const [
                { count: totalUsers },
                { count: premium },
                { count: planesTotal },
                { count: lecciones },
                { count: planesListos },
                { count: planesError },
                { data: activosData },
            ] = await Promise.all([
                supabase.from("perfiles").select("*", { count: "exact", head: true }),
                supabase.from("perfiles").select("*", { count: "exact", head: true }).eq("tipo_usuario", "premium"),
                supabase.from("planes").select("*", { count: "exact", head: true }),
                supabase.from("lecciones").select("*", { count: "exact", head: true }),
                supabase.from("planes").select("*", { count: "exact", head: true }).eq("estado", "listo"),
                supabase.from("planes").select("*", { count: "exact", head: true }).eq("estado", "error"),
                supabase.from("resumen_diario").select("perfil_id").gte("fecha", hace7dias),
            ]);

            const activos7d = new Set((activosData ?? []).map((r) => r.perfil_id)).size;
            const tasaPremium = totalUsers > 0 ? Math.round((premium / totalUsers) * 100) : 0;

            setStats({ totalUsers, premium, planesTotal, lecciones, planesListos, planesError, activos7d, tasaPremium });
        };
        cargar();
    }, []);

    const KPIS_ROW1 = [
        { label: "Usuarios totales", value: stats?.totalUsers ?? "—", icon: "👥", colorVar: "var(--color-brand-blue)" },
        { label: "Premium activos", value: stats?.premium ?? "—", icon: "✦", colorVar: "var(--color-brand-orange)" },
        { label: "Planes generados", value: stats?.planesTotal ?? "—", icon: "🥗", colorVar: "var(--color-brand-green)" },
        { label: "Lecciones activas", value: stats?.lecciones ?? "—", icon: "📖", colorVar: "var(--color-brand-purple)" },
    ];

    const KPIS_ROW2 = [
        { label: "Planes listos", value: stats?.planesListos ?? "—", icon: "✅", colorVar: "var(--color-brand-green)" },
        { label: "Planes con error", value: stats?.planesError ?? "—", icon: "⚠️", colorVar: "var(--color-brand-red)" },
        { label: "Activos (7 días)", value: stats?.activos7d ?? "—", icon: "🔥", colorVar: "var(--color-brand-orange)" },
        { label: "Tasa premium", value: stats ? `${stats.tasaPremium}%` : "—", icon: "📈", colorVar: "var(--color-brand-blue)" },
    ];

    return (
        <AdminLayout titulo="Dashboard">
            <div className="flex flex-col gap-6">

                {/* KPIs fila 1 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {KPIS_ROW1.map((k, i) => (
                        <Card key={i} className="relative overflow-hidden">
                            <div className="text-2xl mb-3">{k.icon}</div>
                            <div className="font-display font-black text-3xl" style={{ color: k.colorVar }}>{k.value}</div>
                            <div className="text-xs text-text-muted mt-1">{k.label}</div>
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10" style={{ background: k.colorVar, filter: "blur(20px)" }} />
                        </Card>
                    ))}
                </div>

                {/* KPIs fila 2 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {KPIS_ROW2.map((k, i) => (
                        <Card key={i} className="relative overflow-hidden">
                            <div className="text-2xl mb-3">{k.icon}</div>
                            <div className="font-display font-black text-3xl" style={{ color: k.colorVar }}>{k.value}</div>
                            <div className="text-xs text-text-muted mt-1">{k.label}</div>
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10" style={{ background: k.colorVar, filter: "blur(20px)" }} />
                        </Card>
                    ))}
                </div>

                {/* Tabla resumen reciente */}
                <Card>
                    <h3 className="text-text-primary font-bold font-display text-sm mb-4">Usuarios recientes</h3>
                    <RecentUsers />
                </Card>

                {/* Planes con error */}
                <Card>
                    <h3 className="text-text-primary font-bold font-display text-sm mb-4">Planes con error ⚠️</h3>
                    <ErrorPlanes />
                </Card>
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
        demo: { tone: "orange", label: "Demo" },
        freemium: { tone: "blue", label: "Freemium" },
        premium: { tone: "green", label: "Premium" },
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
                <thead>
                    <tr className="text-text-muted text-left border-b border-dark-600">
                        {["Nombre", "Email", "Tipo", "Registro"].map((h) => (
                            <th key={h} className="pb-3 pr-4 text-xs font-bold tracking-wide">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                    {users.map((u) => {
                        const b = ROL_BADGE[u.tipo_usuario] ?? ROL_BADGE.freemium;
                        return (
                            <tr key={u.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                <td className="py-3 pr-4 text-text-primary font-semibold">{u.nombre ?? "Sin nombre"}</td>
                                <td className="py-3 pr-4 text-text-muted text-xs">{u.email}</td>
                                <td className="py-3 pr-4">
                                    <Badge tone={b.tone}>{b.label}</Badge>
                                </td>
                                <td className="py-3 pr-4 text-text-muted text-xs">
                                    {new Date(u.fecha_registro).toLocaleDateString("es-MX")}
                                </td>
                                <td className="py-3">
                                    <Badge tone="green">● Activo</Badge>
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
        return <p className="text-text-muted text-sm">✅ No hay planes con error actualmente.</p>;

    return (
        <div className="flex flex-col gap-2">
            {planes.map((p) => {
                const estado = regenerando[p.id];
                return (
                    <div key={p.id} className="flex items-center justify-between bg-brand-red/[.06] border border-brand-red/20 rounded-xl p-3">
                        <div>
                            <p className="text-text-primary text-xs font-semibold">Plan {p.id.slice(0, 8)}…</p>
                            <p className="text-text-muted text-[11px]">{new Date(p.created_at).toLocaleString("es-MX")}</p>
                        </div>
                        <Button
                            variant={estado === "ok" ? "secondary" : "danger"}
                            size="sm"
                            className={estado === "ok" ? "bg-brand-green text-black border-0 hover:bg-brand-green/85" : ""}
                            onClick={() => regenerar(p)}
                            disabled={estado === "loading" || estado === "ok"}
                        >
                            {estado === "loading" ? "Generando…" : estado === "ok" ? "✓ Listo" : estado === "error" ? "Reintentar" : "Regenerar"}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}