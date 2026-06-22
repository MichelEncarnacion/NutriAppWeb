// src/pages/admin/AdminNoticias.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

/* ── Constantes ──────────────────────────────────────────────── */
const CATEGORIAS = ["Empresa", "Investigación", "Salud Corporativa"];

const CAT_TONES = {
  "Empresa":           "green",
  "Investigación":     "orange",
  "Salud Corporativa": "blue",
};

const TONE_TEXT = {
  purple: "text-brand-purple",
  green:  "text-brand-green",
  orange: "text-brand-orange",
  blue:   "text-brand-blue",
  red:    "text-brand-red",
};

const FORM_EMPTY = {
  titulo:        "",
  extracto:      "",
  categoria:     "Empresa",
  fecha_display: "",
  imagen_url:    "",
  contenido:     "",
  autor:         "",
  fuente_url:    "",
  publicado:     false,
  orden:         0,
};

/* ── Componente principal ────────────────────────────────────── */
export default function AdminNoticias() {
  const [noticias,   setNoticias]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);   // null | "crear" | "editar"
  const [formData,   setFormData]   = useState(FORM_EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [guardando,  setGuardando]  = useState(false);
  const [elimConf,   setElimConf]   = useState(null);  // id a eliminar
  const [error,      setError]      = useState(null);
  const [busqueda,   setBusqueda]   = useState("");

  /* ── Carga inicial ── */
  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("noticias")
      .select("*")
      .order("orden", { ascending: true });
    if (!err) setNoticias(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  /* ── Helpers de form ── */
  const set = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const abrirCrear = () => {
    setFormData(FORM_EMPTY);
    setEditId(null);
    setError(null);
    setModal("crear");
  };

  const abrirEditar = (n) => {
    setFormData({
      titulo:        n.titulo,
      extracto:      n.extracto,
      categoria:     n.categoria,
      fecha_display: n.fecha_display,
      imagen_url:    n.imagen_url ?? "",
      contenido:     n.contenido ?? "",
      autor:         n.autor ?? "",
      fuente_url:    n.fuente_url ?? "",
      publicado:     n.publicado,
      orden:         n.orden,
    });
    setEditId(n.id);
    setError(null);
    setModal("editar");
  };

  const cerrarModal = () => { setModal(null); setEditId(null); setError(null); };

  /* ── Guardar (crear o editar) ── */
  const guardar = async () => {
    if (!formData.titulo.trim() || !formData.extracto.trim() || !formData.fecha_display.trim()) {
      setError("Título, extracto y fecha son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);

    const payload = {
      titulo:        formData.titulo.trim(),
      extracto:      formData.extracto.trim(),
      categoria:     formData.categoria,
      fecha_display: formData.fecha_display.trim(),
      imagen_url:    formData.imagen_url || null,
      contenido:     formData.contenido.trim() || null,
      autor:         formData.autor.trim() || null,
      fuente_url:    formData.fuente_url.trim() || null,
      publicado:     formData.publicado,
      orden:         Number(formData.orden) || 0,
    };

    let err;
    if (modal === "crear") {
      ({ error: err } = await supabase.from("noticias").insert(payload));
    } else {
      ({ error: err } = await supabase.from("noticias").update(payload).eq("id", editId));
    }

    setGuardando(false);
    if (err) { setError(err.message); return; }
    cerrarModal();
    cargar();
  };

  /* ── Toggle publicado inline ── */
  const togglePublicado = async (n) => {
    await supabase.from("noticias").update({ publicado: !n.publicado }).eq("id", n.id);
    setNoticias((prev) => prev.map((x) => x.id === n.id ? { ...x, publicado: !x.publicado } : x));
  };

  /* ── Eliminar ── */
  const eliminar = async () => {
    if (!elimConf) return;
    await supabase.from("noticias").delete().eq("id", elimConf);
    setElimConf(null);
    cargar();
  };

  /* ── Filtrado ── */
  const filtradas = noticias.filter((n) =>
    n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPublicadas = noticias.filter((n) => n.publicado).length;
  const totalBorradores = noticias.length - totalPublicadas;

  /* ── Render ── */
  return (
    <AdminLayout titulo="Noticias">
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total artículos", value: noticias.length,  tone: "purple" },
            { label: "Publicados",      value: totalPublicadas,   tone: "green" },
            { label: "Borradores",      value: totalBorradores,   tone: "orange" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`font-display font-black text-2xl ${TONE_TEXT[s.tone]}`}>{s.value}</div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            accent="purple"
            type="text"
            placeholder="Buscar por título o categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-72"
          />
          <Button variant="admin" onClick={abrirCrear} className="whitespace-nowrap flex-shrink-0">
            + Nueva noticia
          </Button>
        </div>

        {/* Tabla */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-muted text-sm">Cargando…</div>
          ) : filtradas.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">📰</div>
              <p className="text-text-muted text-sm">
                {busqueda ? "Sin resultados para tu búsqueda." : "No hay noticias todavía. ¡Crea la primera!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-text-muted text-left border-b border-dark-600 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Título</th>
                    <th className="px-4 py-3.5 font-bold">Categoría</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold text-center">Orden</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filtradas.map((n) => {
                    const catTone = CAT_TONES[n.categoria] ?? "neutral";
                    return (
                      <tr key={n.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Título */}
                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold leading-snug line-clamp-2 max-w-xs">{n.titulo}</p>
                          {n.extracto && (
                            <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{n.extracto}</p>
                          )}
                        </td>

                        {/* Categoría */}
                        <td className="px-4 py-4">
                          <Badge tone={catTone} className="whitespace-nowrap normal-case">{n.categoria}</Badge>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">{n.fecha_display}</td>

                        {/* Orden */}
                        <td className="px-4 py-4 text-center text-text-muted text-xs">{n.orden}</td>

                        {/* Estado — toggle */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePublicado(n)}
                            title={n.publicado ? "Clic para despublicar" : "Clic para publicar"}
                            className="cursor-pointer"
                          >
                            <Badge tone={n.publicado ? "green" : "orange"} className="normal-case">
                              {n.publicado ? "● Publicado" : "○ Borrador"}
                            </Badge>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => abrirEditar(n)} className="text-brand-blue hover:bg-brand-blue/10">
                              Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setElimConf(n.id)}>
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Modal crear / editar ─────────────────────────────── */}
      {modal && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={cerrarModal}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
            <Card as="div" className="w-full max-w-xl rounded-xl flex flex-col my-auto p-0">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
                <div>
                  <h3 className="text-text-primary font-bold font-display text-base">
                    {modal === "crear" ? "Nueva noticia" : "Editar noticia"}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    {modal === "crear" ? "Se guardará como borrador hasta que la publiques." : "Los cambios se aplican de inmediato al guardar."}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-text-muted hover:text-text-primary hover:bg-dark-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Título */}
                <Field label="Título *" accent="purple">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.titulo}
                    onChange={set("titulo")}
                    placeholder="Ej. NutriiApp lanza nueva versión del dashboard"
                    maxLength={200}
                  />
                  <span className="text-[10px] text-text-muted text-right">{formData.titulo.length}/200</span>
                </Field>

                {/* Categoría + Fecha */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoría *">
                    <Input accent="purple" as="select" value={formData.categoria} onChange={set("categoria")}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Input>
                  </Field>
                  <Field label="Fecha de publicación *">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2026"
                    />
                  </Field>
                </div>

                {/* Extracto */}
                <Field label="Extracto * (2 líneas resumen)">
                  <Input
                    accent="purple"
                    as="textarea"
                    value={formData.extracto}
                    onChange={set("extracto")}
                    rows={3}
                    maxLength={300}
                    placeholder="Breve descripción del artículo (máx. 300 caracteres)"
                    className="resize-none"
                  />
                  <span className="text-[10px] text-text-muted text-right">{formData.extracto.length}/300</span>
                </Field>

                {/* Contenido */}
                <Field label="Contenido completo (opcional)">
                  <Input
                    accent="purple"
                    as="textarea"
                    value={formData.contenido}
                    onChange={set("contenido")}
                    rows={5}
                    placeholder="Cuerpo del artículo completo. Soporta texto plano."
                    className="resize-none"
                  />
                </Field>

                {/* Imagen */}
                <Field label="Imagen (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="noticias"
                  />
                </Field>

                {/* Autor + URL fuente */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Autor (opcional)">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.autor}
                      onChange={set("autor")}
                      placeholder="Ej. NutriiApp Editorial"
                    />
                  </Field>
                  <Field label='URL "Leer más" (opcional)'>
                    <Input
                      accent="purple"
                      type="url"
                      value={formData.fuente_url}
                      onChange={set("fuente_url")}
                      placeholder="https://..."
                    />
                  </Field>
                </div>

                {/* Orden + Publicado */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <Field label="Orden de aparición">
                    <Input
                      accent="purple"
                      type="number"
                      value={formData.orden}
                      onChange={set("orden")}
                      min={0}
                    />
                  </Field>
                  <div className="flex items-center gap-3 pb-0.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publicado}
                        onChange={set("publicado")}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-dark-600 peer-focus:ring-2 peer-focus:ring-brand-purple rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-brand-green after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <span className="text-xs text-text-muted">
                      {formData.publicado ? <span className="text-brand-green font-bold">Publicado</span> : "Borrador"}
                    </span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" onClick={cerrarModal} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="admin" onClick={guardar} disabled={guardando} className="flex-1">
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear noticia" : "Guardar cambios"}
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ── Modal confirmar eliminación ───────────────────────── */}
      {elimConf && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => setElimConf(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <Card className="w-full max-w-sm rounded-xl flex flex-col p-0">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-3xl mb-3">🗑️</div>
                <h3 className="text-text-primary font-bold font-display text-base mb-1.5">¿Eliminar este artículo?</h3>
                <p className="text-text-muted text-sm">Esta acción es irreversible. El artículo se eliminará de la landing.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" onClick={() => setElimConf(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="danger" onClick={eliminar} className="flex-1 bg-brand-red text-white hover:bg-brand-red/85 border-0">
                  Sí, eliminar
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
