// Planes generados
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminPlanes() {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("planes")
            .select("id, perfil_id, estado, created_at, perfiles(nombre, email)")
            .order("created_at", { ascending: false }).limit(30)
            .then(({ data }) => { setPlanes(data ?? []); setLoading(false); });
    }, []);

    const ESTADO = {
        listo: { bg: "rgba(61,220,132,.12)", color: "#3DDC84", label: "Listo" },
        generando: { bg: "rgba(88,166,255,.12)", color: "#58A6FF", label: "Generando" },
        error: { bg: "rgba(255,107,107,.12)", color: "#FF6B6B", label: "Error" },
    };

    return (
        <AdminLayout titulo="Planes generados por IA">
            <div className="flex flex-col gap-4">
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead className="bg-[#1C2330]">
                            <tr className="text-[#7D8590] text-left">
                                {["Plan ID", "Nombre", "Email", "Estado", "Fecha"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]">
                            {loading
                                ? [...Array(8)].map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[#2D3748] rounded animate-pulse" /></td></tr>
                                ))
                                : planes.map((p) => {
                                    const e = ESTADO[p.estado] ?? ESTADO.error;
                                    const nombre = p.perfiles?.nombre ?? "—";
                                    const email = p.perfiles?.email ?? "—";
                                    return (
                                        <tr key={p.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                            <td className="px-4 py-3 text-[#7D8590] font-mono text-xs">{p.id.slice(0, 8)}…</td>
                                            <td className="px-4 py-3 text-white font-semibold text-xs">{nombre}</td>
                                            <td className="px-4 py-3 text-[#7D8590] text-xs">{email}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: e.bg, color: e.color }}>{e.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-[#7D8590] text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString("es-MX")}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
}