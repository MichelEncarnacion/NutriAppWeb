// src/pages/admin/AdminFundadores.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input, { Field } from "../../components/ui/Input";

const FORM_EMPTY = {
  nombre:     "",
  rol:        "",
  descripcion:"",
  initials:   "",
  imagen_url: "",
  orden:      0,
};

export default function AdminFundadores() {
  const [items,      setItems]      = useState([]);
  const [fotoEquipo, setFotoEquipo] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [formData,   setFormData]   = useState(FORM_EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [guardando,  setGuardando]  = useState(false);
  const [elimConf,   setElimConf]   = useState(null);
  const [error,      setError]      = useState(null);
  const [guardandoFoto, setGuardandoFoto] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    const [{ data: fundadores }, { data: config }] = await Promise.all([
      supabase.from("fundadores").select("*").order("orden", { ascending: true }),
      supabase.from("site_config").select("value").eq("key", "foto_equipo").single(),
    ]);
    setItems(fundadores ?? []);
    setFotoEquipo(config?.value ?? "");
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

  const abrirEditar = (f) => {
    setFormData({
      nombre:      f.nombre,
      rol:         f.rol,
      descripcion: f.descripcion ?? "",
      initials:    f.initials ?? "",
      imagen_url:  f.imagen_url ?? "",
      orden:       f.orden,
    });
    setEditId(f.id);
    setError(null);
    setModal("editar");
  };

  const cerrarModal = () => { setModal(null); setEditId(null); setError(null); };

  const guardar = async () => {
    if (!formData.nombre.trim() || !formData.rol.trim()) {
      setError("Nombre y rol son obligatorios.");
      return;
    }
    setGuardando(true);
    setError(null);

    const payload = {
      nombre:      formData.nombre.trim(),
      rol:         formData.rol.trim(),
      descripcion: formData.descripcion.trim() || null,
      initials:    formData.initials.trim() || formData.nombre.charAt(0).toUpperCase(),
      imagen_url:  formData.imagen_url || null,
      orden:       Number(formData.orden) || 0,
      updated_at:  new Date().toISOString(),
    };

    let err;
    if (modal === "crear") {
      ({ error: err } = await supabase.from("fundadores").insert(payload));
    } else {
      ({ error: err } = await supabase.from("fundadores").update(payload).eq("id", editId));
    }

    setGuardando(false);
    if (err) { setError(err.message); return; }
    cerrarModal();
    cargar();
  };

  const eliminar = async () => {
    if (!elimConf) return;
    await supabase.from("fundadores").delete().eq("id", elimConf);
    setElimConf(null);
    cargar();
  };

  const guardarFotoEquipo = async (url) => {
    setGuardandoFoto(true);
    await supabase.from("site_config")
      .upsert({ key: "foto_equipo", value: url || null, updated_at: new Date().toISOString() });
    setFotoEquipo(url);
    setGuardandoFoto(false);
  };

  return (
    <AdminLayout titulo="Quiénes somos">
      <div className="flex flex-col gap-8">

        {/* ── Foto grupal ─────────────────────────────────────── */}
        <Card className="rounded-xl">
          <p className="text-text-primary font-bold text-sm mb-0.5">Foto del equipo</p>
          <p className="text-text-muted text-xs mb-4">Se muestra en la sección "Quiénes somos" de la página Nosotros.</p>
          <ImageUploader
            value={fotoEquipo}
            onChange={guardarFotoEquipo}
            folder="equipo"
          />
          {guardandoFoto && <p className="text-xs text-text-muted mt-2">Guardando…</p>}
        </Card>

        {/* ── Integrantes ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-primary font-bold text-sm">Integrantes del equipo</p>
            <Button variant="admin" onClick={abrirCrear}>
              + Nuevo integrante
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-text-muted text-sm py-10">Cargando…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map((f) => (
                <Card key={f.id} className="p-0 rounded-xl overflow-hidden">
                  {/* Foto del integrante */}
                  {f.imagen_url ? (
                    <div
                      className="relative overflow-hidden cursor-pointer group bg-dark-900"
                      onClick={() => window.open(f.imagen_url, "_blank")}
                    >
                      <img
                        src={f.imagen_url}
                        alt={f.nombre}
                        className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "rgba(0,0,0,0.45)" }}
                      >
                        <span className="text-text-primary text-xs font-bold">Ver foto completa</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full flex items-center justify-center bg-brand-purple/10"
                      style={{ height: 120 }}
                    >
                      <span className="text-4xl font-black font-display text-brand-purple">
                        {f.initials}
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    <p className="text-text-primary font-bold text-sm mb-0.5">{f.nombre}</p>
                    <p className="text-brand-purple text-xs font-semibold mb-2">{f.rol}</p>
                    {f.descripcion && (
                      <p className="text-text-muted text-xs leading-relaxed line-clamp-3 mb-3">{f.descripcion}</p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => abrirEditar(f)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setElimConf(f.id)}>
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
                  {modal === "crear" ? "Nuevo integrante" : "Editar integrante"}
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
                    placeholder="Ej. Michel Encarnación Dionicio"
                  />
                </Field>

                <Field label="Rol / Cargo *" accent="purple">
                  <Input
                    accent="purple"
                    type="text"
                    value={formData.rol}
                    onChange={set("rol")}
                    placeholder="Ej. CTO y Co-fundador · Ing. de Software"
                  />
                </Field>

                <Field label="Descripción" accent="purple">
                  <Input
                    as="textarea"
                    accent="purple"
                    value={formData.descripcion}
                    onChange={set("descripcion")}
                    rows={3}
                    placeholder="Describe brevemente el rol y contribución al proyecto…"
                    className="resize-none w-full"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Inicial (avatar sin foto)" accent="purple">
                    <Input
                      accent="purple"
                      type="text"
                      value={formData.initials}
                      onChange={set("initials")}
                      maxLength={2}
                      placeholder="Ej. M"
                    />
                  </Field>
                  <Field label="Orden de aparición" accent="purple">
                    <Input
                      accent="purple"
                      type="number"
                      value={formData.orden}
                      onChange={set("orden")}
                      min={0}
                    />
                  </Field>
                </div>

                <Field label="Foto del integrante (opcional)" accent="purple">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="fundadores"
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
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear integrante" : "Guardar cambios"}
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
                <h3 className="text-text-primary font-bold font-display text-base mb-1.5">¿Eliminar este integrante?</h3>
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
