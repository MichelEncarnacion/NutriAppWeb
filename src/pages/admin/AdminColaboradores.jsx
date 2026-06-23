// src/pages/admin/AdminColaboradores.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";

const FORM_EMPTY = {
  nombre:        "",
  foto_url:      "",
  ubicacion:     "",
  enfoque:       "",
  cedula:        "",
  telefono:      "",
  tipo_terapias: "",
  descuento:     0,
  publicado:     true,
  orden:         0,
};

export default function AdminColaboradores() {
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
      .from("colaboradores")
      .select("*")
      .order("orden", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const set = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const abrirCrear = () => {
    setFormData(FORM_EMPTY);
    setEditId(null);
    setError(null);
    setModal("crear");
  };

  const abrirEditar = (c) => {
    setFormData({
      nombre:        c.nombre,
      foto_url:      c.foto_url ?? "",
      ubicacion:     c.ubicacion ?? "",
      enfoque:       c.enfoque ?? "",
      cedula:        c.cedula ?? "",
      telefono:      c.telefono ?? "",
      tipo_terapias: c.tipo_terapias ?? "",
      descuento:     c.descuento ?? 0,
      publicado:     c.publicado,
      orden:         c.orden,
    });
    setEditId(c.id);
    setError(null);
    setModal("editar");
  };

  const cerrarModal = () => { setModal(null); setEditId(null); setError(null); };

  const guardar = async () => {
    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setGuardando(true);
    setError(null);

    const payload = {
      nombre:        formData.nombre.trim(),
      foto_url:      formData.foto_url || null,
      ubicacion:     formData.ubicacion.trim() || null,
      enfoque:       formData.enfoque.trim() || null,
      cedula:        formData.cedula.trim() || null,
      telefono:      formData.telefono.trim() || null,
      tipo_terapias: formData.tipo_terapias.trim() || null,
      descuento:     Number(formData.descuento) || 0,
      publicado:     formData.publicado,
      orden:         Number(formData.orden) || 0,
      updated_at:    new Date().toISOString(),
    };

    let err;
    if (modal === "crear") {
      ({ error: err } = await supabase.from("colaboradores").insert(payload));
    } else {
      ({ error: err } = await supabase.from("colaboradores").update(payload).eq("id", editId));
    }

    setGuardando(false);
    if (err) { setError(err.message); return; }
    cerrarModal();
    cargar();
  };

  const eliminar = async () => {
    if (!elimConf) return;
    await supabase.from("colaboradores").delete().eq("id", elimConf);
    setElimConf(null);
    cargar();
  };

  return (
    <AdminLayout titulo="Colaboradores">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-primary font-bold text-sm">Profesionales de salud mental</p>
            <Button variant="admin" onClick={abrirCrear}>
              + Nuevo colaborador
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-text-muted text-sm py-10">Cargando…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-10">Aún no hay colaboradores registrados.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map((c) => (
                <Card key={c.id} className="p-0 rounded-xl overflow-hidden">
                  {c.foto_url ? (
                    <div
                      className="relative overflow-hidden cursor-pointer group bg-dark-900"
                      onClick={() => window.open(c.foto_url, "_blank")}
                    >
                      <img
                        src={c.foto_url}
                        alt={c.nombre}
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full flex items-center justify-center bg-brand-purple/10"
                      style={{ height: 120 }}
                    >
                      <span className="text-4xl font-black font-display text-brand-purple">
                        {c.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-text-primary font-bold text-sm">{c.nombre}</p>
                      {!c.publicado && (
                        <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 rounded-full px-2 py-0.5">
                          Oculto
                        </span>
                      )}
                    </div>
                    {c.enfoque && (
                      <p className="text-brand-purple text-xs font-semibold mb-2">{c.enfoque}</p>
                    )}
                    {c.ubicacion && (
                      <p className="text-text-muted text-xs leading-relaxed line-clamp-2 mb-1">{c.ubicacion}</p>
                    )}
                    {c.tipo_terapias && (
                      <p className="text-text-muted text-xs leading-relaxed line-clamp-2 mb-1">{c.tipo_terapias}</p>
                    )}
                    {c.telefono && (
                      <p className="text-text-muted text-xs leading-relaxed mb-1">📞 {c.telefono}</p>
                    )}
                    <p className="text-brand-green text-xs font-bold mb-3">
                      {Math.round((c.descuento ?? 0) * 100)}% de descuento
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => abrirEditar(c)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setElimConf(c.id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
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
            <div className="w-full max-w-xl rounded-xl border border-dark-600 flex flex-col my-auto bg-dark-800">

              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
                <h3 className="text-text-primary font-bold font-display text-base">
                  {modal === "crear" ? "Nuevo colaborador" : "Editar colaborador"}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-text-muted hover:text-text-primary transition-colors bg-dark-700"
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <Field label="Nombre completo *" accent="purple">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.nombre}
                    onChange={set("nombre")}
                    placeholder="Ej. Olga Muñoz Sánchez"
                  />
                </Field>

                <Field label="Ubicación / Dirección" accent="purple">
                  <Input
                    as="textarea"
                    accent="purple"
                    value={formData.ubicacion}
                    onChange={set("ubicacion")}
                    rows={2}
                    placeholder="Calle, colonia, ciudad…"
                    className="resize-none w-full"
                  />
                </Field>

                <Field label="Enfoque" accent="purple">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.enfoque}
                    onChange={set("enfoque")}
                    placeholder="Ej. Cognitivo Conductual"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cédula profesional" accent="purple">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.cedula}
                      onChange={set("cedula")}
                      placeholder="Ej. 4965525"
                    />
                  </Field>
                  <Field label="Descuento (0 a 1)" accent="purple">
                    <Input
                      accent="purple"
                      type="number"
                      step="0.01"
                      min={0}
                      max={1}
                      value={formData.descuento}
                      onChange={set("descuento")}
                    />
                  </Field>
                </div>

                <Field label="Teléfono / WhatsApp" accent="purple">
                  <Input
                    accent="purple"
                    type="tel"
                    value={formData.telefono}
                    onChange={set("telefono")}
                    placeholder="Ej. 2221234567 (10 dígitos, sin espacios)"
                  />
                </Field>

                <Field label="Tipo de terapias" accent="purple">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.tipo_terapias}
                    onChange={set("tipo_terapias")}
                    placeholder="Ej. Terapia individual, Terapia de pareja"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Orden de aparición" accent="purple">
                    <Input
                      accent="purple"
                      type="number"
                      value={formData.orden}
                      onChange={set("orden")}
                      min={0}
                    />
                  </Field>
                  <Field label="Visible en landing" accent="purple">
                    <select
                      className="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 text-sm text-text-primary"
                      value={formData.publicado ? "1" : "0"}
                      onChange={(e) => setFormData((p) => ({ ...p, publicado: e.target.value === "1" }))}
                    >
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </Field>
                </div>

                <Field label="Foto / Logo (opcional)" accent="purple">
                  <ImageUploader
                    value={formData.foto_url}
                    onChange={(url) => setFormData((p) => ({ ...p, foto_url: url }))}
                    folder="colaboradores"
                  />
                </Field>

                {error && (
                  <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" fullWidth onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button variant="admin" fullWidth onClick={guardar} disabled={guardando}>
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear colaborador" : "Guardar cambios"}
                </Button>
              </div>
            </div>
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
            <div className="w-full max-w-sm rounded-xl border border-dark-600 flex flex-col bg-dark-800">
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-3xl mb-3">🗑️</div>
                <h3 className="text-text-primary font-bold font-display text-base mb-1.5">¿Eliminar este colaborador?</h3>
                <p className="text-text-muted text-sm">Esta acción es irreversible.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" fullWidth onClick={() => setElimConf(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" fullWidth className="bg-brand-red text-white hover:bg-brand-red/85" onClick={eliminar}>
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
