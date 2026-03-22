// Planes generados
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminPlanes() {
    const [planes, setPlanes] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from("planes")
            .select("id,usuario_id,estado,created_at,objetivo,kcal_objetivo,modelo_ia,prompt_usado")
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
                    <table className="w-full text-sm">
                        <thead className="bg-[#1C2330]">
                            <tr className="text-[#7D8590] text-left">
                                {["Plan ID", "Usuario", "Objetivo", "Calorías", "Estado", "Fecha", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]">
                            {loading
                                ? [...Array(8)].map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-[#2D3748] rounded animate-pulse" /></td></tr>
                                ))
                                : planes.map((p) => {
                                    const e = ESTADO[p.estado] ?? ESTADO.error;
                                    return (
                                        <tr key={p.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                            <td className="px-4 py-3 text-[#7D8590] font-mono text-xs">{p.id.slice(0, 8)}…</td>
                                            <td className="px-4 py-3 text-[#7D8590] font-mono text-xs">{p.usuario_id.slice(0, 8)}…</td>
                                            <td className="px-4 py-3 text-white text-xs">{p.objetivo?.replace(/_/g, " ") ?? "—"}</td>
                                            <td className="px-4 py-3 text-[#3DDC84] font-display font-bold text-xs">{p.kcal_objetivo ?? "—"}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: e.bg, color: e.color }}>{e.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-[#7D8590] text-xs">{new Date(p.created_at).toLocaleDateString("es-MX")}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => setDetalle(p)} className="text-xs text-[#A855F7] hover:underline">Ver prompt</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal detalle */}
            {detalle && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between">
                            <h3 className="text-white font-bold font-display">Prompt del plan</h3>
                            <button onClick={() => setDetalle(null)} className="text-[#7D8590] hover:text-white">✕</button>
                        </div>
                        <pre className="bg-[#0D1117] rounded-xl p-4 text-[#3DDC84] text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                            {detalle.prompt_usado ?? "Prompt no disponible"}
                        </pre>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}