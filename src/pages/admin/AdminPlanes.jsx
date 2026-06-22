// Planes generados
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

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
        listo: { tone: "green", label: "Listo" },
        generando: { tone: "blue", label: "Generando" },
        error: { tone: "red", label: "Error" },
    };

    return (
        <AdminLayout titulo="Planes generados por IA">
            <div className="flex flex-col gap-4">
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                        <thead className="bg-dark-700">
                            <tr className="text-text-muted text-left">
                                {["Plan ID", "Nombre", "Email", "Estado", "Fecha"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-600">
                            {loading
                                ? [...Array(8)].map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                                ))
                                : planes.map((p) => {
                                    const e = ESTADO[p.estado] ?? ESTADO.error;
                                    const nombre = p.perfiles?.nombre ?? "—";
                                    const email = p.perfiles?.email ?? "—";
                                    return (
                                        <tr key={p.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                            <td className="px-4 py-3 text-text-muted font-mono text-xs">{p.id.slice(0, 8)}…</td>
                                            <td className="px-4 py-3 text-text-primary font-semibold text-xs">{nombre}</td>
                                            <td className="px-4 py-3 text-text-muted text-xs">{email}</td>
                                            <td className="px-4 py-3">
                                                <Badge tone={e.tone}>{e.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString("es-MX")}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    </div>
                </Card>
            </div>

        </AdminLayout>
    );
}