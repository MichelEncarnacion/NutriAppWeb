// ─────────────────────────────────────────────────────────────────────────────
// Gestión de lecciones
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminLecciones() {
    const [lecciones, setLecciones] = useState([]);
    const [editando, setEditando] = useState(null);
    const [nueva, setNueva] = useState({ orden: "", titulo: "", contenido: "", duracion_mins: "", categoria: "nutricion", activa: true });
    const [loading, setLoading] = useState(true);

    const cargar = async () => {
        const { data } = await supabase.from("lecciones").select("*").order("orden");
        setLecciones(data ?? []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const guardarNueva = async () => {
        await supabase.from("lecciones").insert({
            orden: Number(nueva.orden),
            titulo: nueva.titulo,
            contenido: nueva.contenido,
            duracion_mins: Number(nueva.duracion_mins),
            categoria: nueva.categoria,
            activa: nueva.activa,
        });
        setNueva({ orden: "", titulo: "", contenido: "", duracion_mins: "", categoria: "nutricion", activa: true });
        cargar();
    };

    const toggleActiva = async (id, activa) => {
        await supabase.from("lecciones").update({ activa: !activa }).eq("id", id);
        cargar();
    };

    return (
        <AdminLayout titulo="Gestión de lecciones">
            <div className="flex flex-col gap-5">

                {/* Formulario nueva lección */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                    <h3 className="text-white font-bold font-display text-sm mb-4">+ Nueva lección</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { key: "orden", label: "Orden", type: "number", placeholder: "9" },
                            { key: "duracion_mins", label: "Duración (min)", type: "number", placeholder: "10" },
                            { key: "titulo", label: "Título", type: "text", placeholder: "Nombre de la lección", col: 2 },
                            { key: "contenido", label: "Contenido (Markdown)", type: "text", placeholder: "## Título\n\nContenido...", col: 2 },
                        ].map((f) => (
                            <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                                <label className="text-xs text-[#7D8590] mb-1 block">{f.label}</label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={nueva[f.key]}
                                    onChange={(e) => setNueva((n) => ({ ...n, [f.key]: e.target.value }))}
                                    className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={guardarNueva}
                        disabled={!nueva.titulo || !nueva.orden}
                        className="mt-4 px-5 py-2.5 bg-[#A855F7] text-white font-bold font-display text-sm rounded-xl hover:bg-[#C084FC] transition-all disabled:opacity-50"
                    >
                        Crear lección
                    </button>
                </div>

                {/* Lista de lecciones */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                        <thead className="bg-[#1C2330]">
                            <tr className="text-[#7D8590] text-left">
                                {["N°", "Título", "Duración", "Categoría", "Estado", "Acciones"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D3748]">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-[#2D3748] rounded animate-pulse" /></td></tr>
                                ))
                                : lecciones.map((l) => (
                                    <tr key={l.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                        <td className="px-4 py-3 text-[#A855F7] font-black font-display">{l.orden}</td>
                                        <td className="px-4 py-3 text-white font-semibold">{l.titulo}</td>
                                        <td className="px-4 py-3 text-[#7D8590]">{l.duracion_mins} min</td>
                                        <td className="px-4 py-3 text-[#7D8590] capitalize">{l.categoria}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold ${l.activa ? "text-[#3DDC84]" : "text-[#7D8590]"}`}>
                                                {l.activa ? "● Activa" : "○ Oculta"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => toggleActiva(l.id, l.activa)}
                                                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[rgba(168,85,247,.12)] text-[#A855F7] hover:bg-[rgba(168,85,247,.2)] transition-all"
                                            >
                                                {l.activa ? "Ocultar" : "Activar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}