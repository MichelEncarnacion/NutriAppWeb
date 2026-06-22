// src/pages/admin/AdminArticulos.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const CATEGORIAS = ["Blog", "Salud", "Nutrición", "Empresa", "Investigación"];

const CAT_TONES = {
  "Blog":          "purple",
  "Salud":         "green",
  "Nutrición":     "blue",
  "Empresa":       "orange",
  "Investigación": "red",
};

const TONE_TEXT = {
  purple: "text-brand-purple",
  green:  "text-brand-green",
  orange: "text-brand-orange",
  blue:   "text-brand-blue",
  red:    "text-brand-red",
};

const FORM_EMPTY = {
  titulo:         "",
  extracto:       "",
  categoria:      "Blog",
  fecha_display:  "",
  imagen_url:     "",
  contenido:      "",
  tiempo_lectura: "",
  tags:           "",
  publicado:      false,
  orden:          0,
};

export default function AdminArticulos() {
  const [articulos, setArticulos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [formData,  setFormData]  = useState(FORM_EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [elimConf,  setElimConf]  = useState(null);
  const [error,     setError]     = useState(null);
  const [busqueda,  setBusqueda]  = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("articulos")
      .select("*")
      .order("orden", { ascending: true });
    if (!err) setArticulos(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const abrirCrear = () => {
    setFormData(FORM_EMPTY);
    setEditId(null);
    setError(null);
    setModal("crear");
  };

  const abrirEditar = (a) => {
    setFormData({
      titulo:         a.titulo,
      extracto:       a.extracto ?? "",
      categoria:      a.categoria,
      fecha_display:  a.fecha_display ?? "",
      imagen_url:     a.imagen_url ?? "",
      contenido:      a.contenido ?? "",
      tiempo_lectura: a.tiempo_lectura ?? "",
      tags:           (a.tags ?? []).join(", "),
      publicado:      a.publicado,
      orden:          a.orden,
    });
    setEditId(a.id);
    setError(null);
    setModal("editar");
  };

  const cerrarModal = () => { setModal(null); setEditId(null); setError(null); };

  const guardar = async () => {
    if (!formData.titulo.trim() || !formData.extracto.trim()) {
      setError("Título y extracto son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);

    const tagsArr = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      titulo:         formData.titulo.trim(),
      extracto:       formData.extracto.trim(),
      categoria:      formData.categoria,
      fecha_display:  formData.fecha_display.trim() || null,
      imagen_url:     formData.imagen_url.trim() || null,
      contenido:      formData.contenido.trim() || null,
      tiempo_lectura: formData.tiempo_lectura.trim() || null,
      tags:           tagsArr,
      publicado:      formData.publicado,
      orden:          Number(formData.orden) || 0,
    };

    let err;
    if (modal === "crear") {
      ({ error: err } = await supabase.from("articulos").insert(payload));
    } else {
      ({ error: err } = await supabase.from("articulos").update(payload).eq("id", editId));
    }

    setGuardando(false);
    if (err) { setError(err.message); return; }
    cerrarModal();
    cargar();
  };

  const togglePublicado = async (a) => {
    await supabase.from("articulos").update({ publicado: !a.publicado }).eq("id", a.id);
    setArticulos((prev) => prev.map((x) => x.id === a.id ? { ...x, publicado: !x.publicado } : x));
  };

  const eliminar = async () => {
    if (!elimConf) return;
    await supabase.from("articulos").delete().eq("id", elimConf);
    setElimConf(null);
    cargar();
  };

  const filtrados = articulos.filter((a) =>
    a.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPublicados = articulos.filter((a) => a.publicado).length;

  return (
    <AdminLayout titulo="Artículos">
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total artículos", value: articulos.length,          tone: "purple" },
            { label: "Publicados",      value: totalPublicados,            tone: "green" },
            { label: "Borradores",      value: articulos.length - totalPublicados, tone: "orange" },
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
            + Nuevo artículo
          </Button>
        </div>

        {/* Tabla */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-muted text-sm">Cargando…</div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">✍️</div>
              <p className="text-text-muted text-sm">
                {busqueda ? "Sin resultados para tu búsqueda." : "No hay artículos todavía. ¡Crea el primero!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="text-text-muted text-left border-b border-dark-600 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Título</th>
                    <th className="px-4 py-3.5 font-bold">Categoría</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold">Lectura</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filtrados.map((a) => {
                    const catTone = CAT_TONES[a.categoria] ?? "neutral";
                    return (
                      <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold leading-snug line-clamp-2 max-w-xs">{a.titulo}</p>
                          {a.extracto && (
                            <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{a.extracto}</p>
                          )}
                          {a.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {a.tags.slice(0, 3).map((t) => (
                                <span key={t} className="text-[9px] bg-dark-700 text-text-muted px-1.5 py-0.5 rounded-md">{t}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone={catTone} className="whitespace-nowrap normal-case">{a.categoria}</Badge>
                        </td>
                        <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">{a.fecha_display ?? "—"}</td>
                        <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">{a.tiempo_lectura ?? "—"}</td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePublicado(a)}
                            title={a.publicado ? "Clic para despublicar" : "Clic para publicar"}
                            className="cursor-pointer"
                          >
                            <Badge tone={a.publicado ? "green" : "orange"} className="normal-case">
                              {a.publicado ? "● Publicado" : "○ Borrador"}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => abrirEditar(a)} className="text-brand-blue hover:bg-brand-blue/10">
                              Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setElimConf(a.id)}>
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
            <Card className="w-full max-w-xl rounded-xl flex flex-col my-auto p-0">

              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
                <div>
                  <h3 className="text-text-primary font-bold font-display text-base">
                    {modal === "crear" ? "Nuevo artículo" : "Editar artículo"}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    {modal === "crear" ? "Se guardará como borrador hasta que lo publiques." : "Los cambios se aplican al guardar."}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-text-muted hover:text-text-primary hover:bg-dark-700 transition-colors"
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <Field label="Título *">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.titulo}
                    onChange={set("titulo")}
                    placeholder="Ej. 5 hábitos de nutrición para mejorar tu energía"
                    maxLength={200}
                  />
                  <span className="text-[10px] text-text-muted text-right">{formData.titulo.length}/200</span>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoría *">
                    <Input accent="purple" as="select" value={formData.categoria} onChange={set("categoria")}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Input>
                  </Field>
                  <Field label="Fecha de publicación">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2026"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tiempo de lectura">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.tiempo_lectura}
                      onChange={set("tiempo_lectura")}
                      placeholder="Ej. 5 min"
                    />
                  </Field>
                  <Field label="Tags (separados por coma)">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.tags}
                      onChange={set("tags")}
                      placeholder="nutrición, salud, hábitos"
                    />
                  </Field>
                </div>

                <Field label="Extracto * (resumen corto)">
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

                <Field label="Contenido completo">
                  <Input
                    accent="purple"
                    as="textarea"
                    value={formData.contenido}
                    onChange={set("contenido")}
                    rows={7}
                    placeholder="Cuerpo del artículo. Soporta texto plano o Markdown."
                    className="resize-none font-mono"
                  />
                </Field>

                <Field label="Imagen (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="articulos"
                  />
                </Field>

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

                {error && (
                  <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" onClick={cerrarModal} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="admin" onClick={guardar} disabled={guardando} className="flex-1">
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear artículo" : "Guardar cambios"}
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
                <p className="text-text-muted text-sm">Esta acción es irreversible.</p>
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
