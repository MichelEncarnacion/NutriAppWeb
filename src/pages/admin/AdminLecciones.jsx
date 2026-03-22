// ─────────────────────────────────────────────────────────────────────────────
// Gestión de lecciones
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminLecciones() {
    const [lecciones, setLecciones] = useState([]);
    const [editando, setEditando] = useState(null);
    const [nueva, setNueva] = useState({ numero: "", titulo: "", descripcion: "", duracion_mins: "", categoria: "nutricion", publicada: true });
    const [loading, setLoading] = useState(true);

    const cargar = async () => {
        const { data } = await supabase.from("lecciones").select("*").order("numero");
        setLecciones(data ?? []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const guardarNueva = async () => {
        await supabase.from("lecciones").insert({
            numero: Number(nueva.numero),
            titulo: nueva.titulo,
            descripcion: nueva.descripcion,
            duracion_mins: Number(nueva.duracion_mins),
            categoria: nueva.categoria,
            publicada: nueva.publicada,
        });
        setNueva({ numero: "", titulo: "", descripcion: "", duracion_mins: "", categoria: "nutricion", publicada: true });
        cargar();
    };

    const togglePublicada = async (id, pub) => {
        await supabase.from("lecciones").update({ publicada: !pub }).eq("id", id);
        cargar();
    };

    return (
        <AdminLayout titulo="Gestión de lecciones">
            <div className="flex flex-col gap-5">

                {/* Formulario nueva lección */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                    <h3 className="text-white font-bold font-display text-sm mb-4">+ Nueva lección</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: "numero", label: "N°", type: "number", placeholder: "9" },
                            { key: "duracion_mins", label: "Duración (min)", type: "number", placeholder: "10" },
                            { key: "titulo", label: "Título", type: "text", placeholder: "Nombre de la lección", col: 2 },
                            { key: "descripcion", label: "Descripción", type: "text", placeholder: "Breve descripción...", col: 2 },
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
                        disabled={!nueva.titulo || !nueva.numero}
                        className="mt-4 px-5 py-2.5 bg-[#A855F7] text-white font-bold font-display text-sm rounded-xl hover:bg-[#C084FC] transition-all disabled:opacity-50"
                    >
                        Crear lección
                    </button>
                </div>

                {/* Lista de lecciones */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
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
                                        <td className="px-4 py-3 text-[#A855F7] font-black font-display">{l.numero}</td>
                                        <td className="px-4 py-3 text-white font-semibold">{l.titulo}</td>
                                        <td className="px-4 py-3 text-[#7D8590]">{l.duracion_mins} min</td>
                                        <td className="px-4 py-3 text-[#7D8590] capitalize">{l.categoria}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold ${l.publicada ? "text-[#3DDC84]" : "text-[#7D8590]"}`}>
                                                {l.publicada ? "● Publicada" : "○ Oculta"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => togglePublicada(l.id, l.publicada)}
                                                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[rgba(168,85,247,.12)] text-[#A855F7] hover:bg-[rgba(168,85,247,.2)] transition-all"
                                            >
                                                {l.publicada ? "Ocultar" : "Publicar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}