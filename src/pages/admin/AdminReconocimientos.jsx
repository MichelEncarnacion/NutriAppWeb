// src/pages/admin/AdminReconocimientos.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const TONE_TEXT = {
  purple: "text-brand-purple",
  green:  "text-brand-green",
  orange: "text-brand-orange",
  blue:   "text-brand-blue",
  red:    "text-brand-red",
  muted:  "text-text-muted",
};

const FORM_EMPTY = {
  nombre:        "",
  organizacion:  "",
  fecha_display: "",
  descripcion:   "",
  imagen_url:    "",
  publicado:     false,
  orden:         0,
};

export default function AdminReconocimientos() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [formData,  setFormData]  = useState(FORM_EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [elimConf,  setElimConf]  = useState(null);
  const [error,     setError]     = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reconocimientos")
      .select("*")
      .order("orden", { ascending: true });
    setItems(data ?? []);
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

  const abrirEditar = (r) => {
    setFormData({
      nombre:        r.nombre,
      organizacion:  r.organizacion,
      fecha_display: r.fecha_display ?? "",
      descripcion:   r.descripcion ?? "",
      imagen_url:    r.imagen_url ?? "",
      publicado:     r.publicado,
      orden:         r.orden,
    });
    setEditId(r.id);
    setError(null);
    setModal("editar");
  };

  const cerrarModal = () => { setModal(null); setEditId(null); setError(null); };

  const guardar = async () => {
    if (!formData.nombre.trim() || !formData.organizacion.trim()) {
      setError("Nombre y organización son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);

    const payload = {
      nombre:        formData.nombre.trim(),
      organizacion:  formData.organizacion.trim(),
      fecha_display: formData.fecha_display.trim() || null,
      descripcion:   formData.descripcion.trim() || null,
      imagen_url:    formData.imagen_url || null,
      publicado:     formData.publicado,
      orden:         Number(formData.orden) || 0,
      updated_at:    new Date().toISOString(),
    };

    let err;
    if (modal === "crear") {
      ({ error: err } = await supabase.from("reconocimientos").insert(payload));
    } else {
      ({ error: err } = await supabase.from("reconocimientos").update(payload).eq("id", editId));
    }

    setGuardando(false);
    if (err) { setError(err.message); return; }
    cerrarModal();
    cargar();
  };

  const togglePublicado = async (r) => {
    await supabase.from("reconocimientos").update({ publicado: !r.publicado }).eq("id", r.id);
    setItems((prev) => prev.map((x) => x.id === r.id ? { ...x, publicado: !x.publicado } : x));
  };

  const eliminar = async () => {
    if (!elimConf) return;
    await supabase.from("reconocimientos").delete().eq("id", elimConf);
    setElimConf(null);
    cargar();
  };

  const totalPublicados = items.filter((r) => r.publicado).length;

  return (
    <AdminLayout titulo="Reconocimientos">
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",       value: items.length,         tone: "orange" },
            { label: "Publicados",  value: totalPublicados,       tone: "green" },
            { label: "Ocultos",     value: items.length - totalPublicados, tone: "muted" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`font-display font-black text-2xl ${TONE_TEXT[s.tone]}`}>{s.value}</div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <Button variant="admin" onClick={abrirCrear}>
            + Nuevo reconocimiento
          </Button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-text-muted text-sm py-10">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-text-muted text-sm">No hay reconocimientos todavía. ¡Agrega el primero!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((r) => (
              <Card
                key={r.id}
                as="div"
                className={`p-0 overflow-hidden ${r.publicado ? "border-brand-orange/30" : ""}`}
              >
                {/* Imagen */}
                {r.imagen_url ? (
                  <div
                    className="relative overflow-hidden cursor-pointer group bg-dark-900"
                    onClick={() => window.open(r.imagen_url, "_blank")}
                  >
                    <img
                      src={r.imagen_url}
                      alt={r.nombre}
                      className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/45">
                      <span className="text-text-primary text-xs font-bold tracking-wide">Ver foto completa</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[100px] flex items-center justify-center bg-dark-700">
                    <span className="text-3xl">🏆</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone="orange" className="normal-case">{r.organizacion}</Badge>
                    {r.fecha_display && (
                      <span className="text-text-muted text-xs">{r.fecha_display}</span>
                    )}
                    <span className="ml-auto">
                      <button onClick={() => togglePublicado(r)}>
                        <Badge tone={r.publicado ? "green" : "orange"} className="normal-case">
                          {r.publicado ? "● Publicado" : "○ Oculto"}
                        </Badge>
                      </button>
                    </span>
                  </div>

                  <p className="text-text-primary font-bold text-sm mb-1">{r.nombre}</p>
                  {r.descripcion && (
                    <p className="text-text-muted text-xs leading-relaxed line-clamp-3 mb-3">{r.descripcion}</p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(r)} className="text-brand-blue hover:bg-brand-blue/10">
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setElimConf(r.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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
                    {modal === "crear" ? "Nuevo reconocimiento" : "Editar reconocimiento"}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    Se mostrará en la página Nosotros cuando esté publicado.
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-text-muted hover:text-text-primary hover:bg-dark-700 transition-colors"
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <Field label="Nombre del reconocimiento *">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.nombre}
                    onChange={set("nombre")}
                    placeholder="Ej. Premio COPARMEX Puebla: Innovación Empresarial"
                    maxLength={200}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Organización *">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.organizacion}
                      onChange={set("organizacion")}
                      placeholder="Ej. COPARMEX Puebla"
                    />
                  </Field>
                  <Field label="Fecha">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2025"
                    />
                  </Field>
                </div>

                <Field label="Descripción">
                  <Input
                    accent="purple"
                    as="textarea"
                    value={formData.descripcion}
                    onChange={set("descripcion")}
                    rows={4}
                    placeholder="Describe brevemente el reconocimiento y su relevancia…"
                    className="resize-none"
                  />
                </Field>

                <Field label="Foto del reconocimiento (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="reconocimientos"
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
                      <div className="w-10 h-5 bg-dark-600 peer-focus:ring-2 peer-focus:ring-brand-purple rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-brand-orange after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <span className="text-xs text-text-muted">
                      {formData.publicado ? <span className="text-brand-orange font-bold">Publicado</span> : "Oculto"}
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
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear reconocimiento" : "Guardar cambios"}
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
                <h3 className="text-text-primary font-bold font-display text-base mb-1.5">¿Eliminar este reconocimiento?</h3>
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
