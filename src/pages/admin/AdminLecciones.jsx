// ─────────────────────────────────────────────────────────────────────────────
// Gestión de lecciones
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

const FORM_VACIO = { orden: "", titulo: "", contenido: "", activa: true };

export default function AdminLecciones() {
    const [lecciones, setLecciones] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null); // null = crear, objeto = editar
    const [form, setForm] = useState(FORM_VACIO);
    const [guardando, setGuardando] = useState(false);

    // Eliminación con confirmación inline
    const [confirmarEliminar, setConfirmarEliminar] = useState(null);
    const [eliminando, setEliminando] = useState({});

    const cargar = async () => {
        const { data } = await supabase.from("lecciones").select("*").order("orden");
        setLecciones(data ?? []);
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const abrirCrear = () => {
        setEditando(null);
        setForm(FORM_VACIO);
        setModalAbierto(true);
    };

    const abrirEditar = (leccion) => {
        setEditando(leccion);
        setForm({
            orden: String(leccion.orden),
            titulo: leccion.titulo,
            contenido: leccion.contenido ?? "",
            activa: leccion.activa,
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setEditando(null);
        setForm(FORM_VACIO);
    };

    const guardar = async () => {
        if (!form.titulo.trim() || !form.orden) return;
        setGuardando(true);
        const payload = {
            orden: Number(form.orden),
            titulo: form.titulo.trim(),
            contenido: form.contenido,
            activa: form.activa,
        };
        if (editando) {
            await supabase.from("lecciones").update(payload).eq("id", editando.id);
        } else {
            await supabase.from("lecciones").insert(payload);
        }
        setGuardando(false);
        cerrarModal();
        cargar();
    };

    const toggleActiva = async (id, activa) => {
        await supabase.from("lecciones").update({ activa: !activa }).eq("id", id);
        cargar();
    };

    const eliminar = async (id) => {
        setEliminando((p) => ({ ...p, [id]: true }));
        await supabase.from("lecciones").delete().eq("id", id);
        setLecciones((prev) => prev.filter((l) => l.id !== id));
        setEliminando((p) => { const n = { ...p }; delete n[id]; return n; });
        setConfirmarEliminar(null);
    };

    return (
        <AdminLayout titulo="Gestión de lecciones">
            <div className="flex flex-col gap-5">

                {/* Header acciones */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7D8590]">{lecciones.length} lecciones</span>
                    <button
                        onClick={abrirCrear}
                        className="px-4 py-2.5 bg-[#A855F7] text-white font-bold font-display text-sm rounded-xl hover:bg-[#C084FC] transition-all"
                    >
                        + Nueva lección
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead className="bg-[#1C2330]">
                                <tr className="text-[#7D8590] text-left">
                                    {["N°", "Título", "Estado", "Acciones"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2D3748]">
                                {loading
                                    ? [...Array(5)].map((_, i) => (
                                        <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-[#2D3748] rounded animate-pulse" /></td></tr>
                                    ))
                                    : lecciones.map((l) => (
                                        <tr key={l.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                            <td className="px-4 py-3 text-[#A855F7] font-black font-display w-12">{l.orden}</td>
                                            <td className="px-4 py-3 text-white font-semibold">{l.titulo}</td>
                                            <td className="px-4 py-3 w-24">
                                                <span className={`text-[10px] font-bold ${l.activa ? "text-[#3DDC84]" : "text-[#7D8590]"}`}>
                                                    {l.activa ? "● Activa" : "○ Oculta"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <button
                                                        onClick={() => abrirEditar(l)}
                                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(88,166,255,.1)] text-[#58A6FF] hover:bg-[rgba(88,166,255,.2)] transition-all"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => toggleActiva(l.id, l.activa)}
                                                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,.12)] text-[#A855F7] hover:bg-[rgba(168,85,247,.2)] transition-all"
                                                    >
                                                        {l.activa ? "Ocultar" : "Activar"}
                                                    </button>
                                                    {confirmarEliminar === l.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => eliminar(l.id)}
                                                                disabled={eliminando[l.id]}
                                                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(255,107,107,.2)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,.35)] transition-all disabled:opacity-60"
                                                            >
                                                                {eliminando[l.id] ? "Eliminando…" : "Confirmar"}
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmarEliminar(null)}
                                                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#1C2330] text-[#7D8590] hover:text-white transition-all"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmarEliminar(l.id)}
                                                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[rgba(255,107,107,.08)] text-[#FF6B6B] hover:bg-[rgba(255,107,107,.2)] transition-all"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Modal crear / editar ───────────────────────────────────── */}
            {modalAbierto && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                        onClick={cerrarModal}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div
                            className="w-full max-w-lg rounded-2xl border border-[#2D3748] flex flex-col"
                            style={{ background: "#161B22", maxHeight: "90vh" }}
                        >
                            {/* Header modal */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D3748] flex-shrink-0">
                                <h3 className="text-white font-bold font-display text-sm">
                                    {editando ? "Editar lección" : "Nueva lección"}
                                </h3>
                                <button
                                    onClick={cerrarModal}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-[#7D8590] hover:text-white transition-colors"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >✕</button>
                            </div>

                            {/* Body modal */}
                            <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-[#7D8590] mb-1.5 block">Orden</label>
                                        <input
                                            type="number"
                                            placeholder="1"
                                            value={form.orden}
                                            onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))}
                                            className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <div
                                                onClick={() => setForm((f) => ({ ...f, activa: !f.activa }))}
                                                className="w-9 h-5 rounded-full relative transition-colors"
                                                style={{ background: form.activa ? "#3DDC84" : "#2D3748" }}
                                            >
                                                <div
                                                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                                                    style={{ left: form.activa ? "calc(100% - 18px)" : "2px" }}
                                                />
                                            </div>
                                            <span className="text-xs text-[#7D8590]">Activa</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Título</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre de la lección"
                                        value={form.titulo}
                                        onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col flex-1">
                                    <label className="text-xs text-[#7D8590] mb-1.5 block">Contenido (Markdown)</label>
                                    <textarea
                                        placeholder={"## Título\n\nEscribe el contenido aquí..."}
                                        value={form.contenido}
                                        onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
                                        rows={10}
                                        className="bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors resize-y font-mono leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Footer modal */}
                            <div className="flex gap-3 px-5 py-4 border-t border-[#2D3748] flex-shrink-0">
                                <button
                                    onClick={cerrarModal}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#4A5568] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardar}
                                    disabled={guardando || !form.titulo.trim() || !form.orden}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#A855F7] hover:bg-[#C084FC] transition-all disabled:opacity-50"
                                >
                                    {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear lección"}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
