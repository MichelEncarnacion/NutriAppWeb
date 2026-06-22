// ─────────────────────────────────────────────────────────────────────────────
// Gestión de lecciones
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

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
                    <span className="text-xs text-text-muted">{lecciones.length} lecciones</span>
                    <Button variant="admin" size="md" onClick={abrirCrear}>
                        + Nueva lección
                    </Button>
                </div>

                {/* Tabla */}
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[560px]">
                            <thead className="bg-dark-700">
                                <tr className="text-text-muted text-left">
                                    {["N°", "Título", "Estado", "Acciones"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-600">
                                {loading
                                    ? [...Array(5)].map((_, i) => (
                                        <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td></tr>
                                    ))
                                    : lecciones.map((l) => (
                                        <tr key={l.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                                            <td className="px-4 py-3 text-brand-purple font-black font-display w-12">{l.orden}</td>
                                            <td className="px-4 py-3 text-text-primary font-semibold">{l.titulo}</td>
                                            <td className="px-4 py-3 w-24">
                                                <Badge tone={l.activa ? "green" : "neutral"}>
                                                    {l.activa ? "● Activa" : "○ Oculta"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <Button variant="secondary" size="sm" onClick={() => abrirEditar(l)}>
                                                        Editar
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-brand-purple hover:bg-brand-purple/10" onClick={() => toggleActiva(l.id, l.activa)}>
                                                        {l.activa ? "Ocultar" : "Activar"}
                                                    </Button>
                                                    {confirmarEliminar === l.id ? (
                                                        <>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => eliminar(l.id)}
                                                                disabled={eliminando[l.id]}
                                                            >
                                                                {eliminando[l.id] ? "Eliminando…" : "Confirmar"}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setConfirmarEliminar(null)}>
                                                                Cancelar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="danger" size="sm" onClick={() => setConfirmarEliminar(l.id)}>
                                                            Eliminar
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </Card>
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
                            className="w-full max-w-lg rounded-xl border border-dark-600 flex flex-col bg-dark-800"
                            style={{ maxHeight: "90vh" }}
                        >
                            {/* Header modal */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600 flex-shrink-0">
                                <h3 className="text-text-primary font-bold font-display text-sm">
                                    {editando ? "Editar lección" : "Nueva lección"}
                                </h3>
                                <button
                                    onClick={cerrarModal}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-text-muted hover:text-text-primary transition-colors bg-dark-700"
                                >✕</button>
                            </div>

                            {/* Body modal */}
                            <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Orden" accent="purple">
                                        <Input
                                            accent="purple"
                                            type="number"
                                            placeholder="1"
                                            value={form.orden}
                                            onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))}
                                        />
                                    </Field>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <div
                                                onClick={() => setForm((f) => ({ ...f, activa: !f.activa }))}
                                                className={`w-9 h-5 rounded-full relative transition-colors ${form.activa ? "bg-brand-green" : "bg-dark-600"}`}
                                            >
                                                <div
                                                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                                                    style={{ left: form.activa ? "calc(100% - 18px)" : "2px" }}
                                                />
                                            </div>
                                            <span className="text-xs text-text-muted">Activa</span>
                                        </label>
                                    </div>
                                </div>

                                <Field label="Título" accent="purple">
                                    <Input
                                        accent="purple"
                                        type="text"
                                        placeholder="Nombre de la lección"
                                        value={form.titulo}
                                        onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                                    />
                                </Field>

                                <Field label="Contenido (Markdown)" accent="purple" className="flex-1">
                                    <Input
                                        as="textarea"
                                        accent="purple"
                                        placeholder={"## Título\n\nEscribe el contenido aquí..."}
                                        value={form.contenido}
                                        onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
                                        rows={10}
                                        className="resize-y font-mono leading-relaxed w-full"
                                    />
                                </Field>
                            </div>

                            {/* Footer modal */}
                            <div className="flex gap-3 px-5 py-4 border-t border-dark-600 flex-shrink-0">
                                <Button variant="secondary" fullWidth onClick={cerrarModal}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="admin"
                                    fullWidth
                                    onClick={guardar}
                                    disabled={guardando || !form.titulo.trim() || !form.orden}
                                >
                                    {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear lección"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
