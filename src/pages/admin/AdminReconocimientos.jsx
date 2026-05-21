// src/pages/admin/AdminReconocimientos.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";

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
            { label: "Total",       value: items.length,         color: "#F0A500" },
            { label: "Publicados",  value: totalPublicados,       color: "#3DDC84" },
            { label: "Ocultos",     value: items.length - totalPublicados, color: "#7D8590" },
          ].map((s) => (
            <div key={s.label} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4">
              <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#7D8590] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <button
            onClick={abrirCrear}
            className="bg-[#F0A500] hover:bg-[#e09400] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            + Nuevo reconocimiento
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-[#7D8590] text-sm py-10">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-[#7D8590] text-sm">No hay reconocimientos todavía. ¡Agrega el primero!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((r) => (
              <div
                key={r.id}
                className="bg-[#161B22] border border-[#2D3748] rounded-2xl overflow-hidden"
                style={{ borderColor: r.publicado ? "rgba(191,144,0,0.3)" : undefined }}
              >
                {/* Imagen */}
                {r.imagen_url ? (
                  <img
                    src={r.imagen_url}
                    alt={r.nombre}
                    className="w-full object-contain cursor-pointer"
                    style={{ height: 200, background: "#0D1117" }}
                    onClick={() => window.open(r.imagen_url, "_blank")}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    title="Clic para ver en tamaño completo"
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ height: 100, background: "linear-gradient(135deg, #1C1A0A 0%, #2A240A 100%)" }}
                  >
                    <span className="text-3xl">🏆</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: "rgba(191,144,0,0.15)", color: "#F0A500" }}
                    >
                      {r.organizacion}
                    </span>
                    {r.fecha_display && (
                      <span className="text-[#7D8590] text-xs">{r.fecha_display}</span>
                    )}
                    <span className="ml-auto">
                      <button
                        onClick={() => togglePublicado(r)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all
                          ${r.publicado
                            ? "bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                            : "bg-[rgba(240,165,0,.1)] text-[#F0A500]"
                          }`}
                      >
                        {r.publicado ? "● Publicado" : "○ Oculto"}
                      </button>
                    </span>
                  </div>

                  <p className="text-white font-bold text-sm mb-1">{r.nombre}</p>
                  {r.descripcion && (
                    <p className="text-[#7D8590] text-xs leading-relaxed line-clamp-3 mb-3">{r.descripcion}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(r)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#58A6FF] bg-[rgba(88,166,255,.08)] hover:bg-[rgba(88,166,255,.18)] transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setElimConf(r.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#FF6B6B] bg-[rgba(255,107,107,.08)] hover:bg-[rgba(255,107,107,.18)] transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
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
            <div className="w-full max-w-xl rounded-2xl border border-[#2D3748] flex flex-col my-auto" style={{ background: "#161B22" }}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3748]">
                <div>
                  <h3 className="text-white font-bold font-display text-base">
                    {modal === "crear" ? "Nuevo reconocimiento" : "Editar reconocimiento"}
                  </h3>
                  <p className="text-[#7D8590] text-xs mt-0.5">
                    Se mostrará en la página Nosotros cuando esté publicado.
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-[#7D8590] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <FormField label="Nombre del reconocimiento *">
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={set("nombre")}
                    placeholder="Ej. Premio COPARMEX Puebla: Innovación Empresarial"
                    maxLength={200}
                    className={INPUT_CLS}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Organización *">
                    <input
                      type="text"
                      value={formData.organizacion}
                      onChange={set("organizacion")}
                      placeholder="Ej. COPARMEX Puebla"
                      className={INPUT_CLS}
                    />
                  </FormField>
                  <FormField label="Fecha">
                    <input
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2025"
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                <FormField label="Descripción">
                  <textarea
                    value={formData.descripcion}
                    onChange={set("descripcion")}
                    rows={4}
                    placeholder="Describe brevemente el reconocimiento y su relevancia…"
                    className={`${INPUT_CLS} resize-none`}
                  />
                </FormField>

                <FormField label="Foto del reconocimiento (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="reconocimientos"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <FormField label="Orden de aparición">
                    <input
                      type="number"
                      value={formData.orden}
                      onChange={set("orden")}
                      min={0}
                      className={INPUT_CLS}
                    />
                  </FormField>
                  <div className="flex items-center gap-3 pb-0.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.publicado}
                        onChange={set("publicado")}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#2D3748] peer-focus:ring-2 peer-focus:ring-[#F0A500] rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-[#F0A500] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <span className="text-xs text-[#7D8590]">
                      {formData.publicado ? <span className="text-[#F0A500] font-bold">Publicado</span> : "Oculto"}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-[rgba(255,107,107,.1)] border border-[rgba(255,107,107,.3)] text-[#FF6B6B] rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-[#2D3748]">
                <button
                  onClick={cerrarModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#4A5568] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-[#F0A500] hover:bg-[#e09400] transition-all disabled:opacity-50"
                >
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear reconocimiento" : "Guardar cambios"}
                </button>
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
            <div className="w-full max-w-sm rounded-2xl border border-[#2D3748] flex flex-col" style={{ background: "#161B22" }}>
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="text-3xl mb-3">🗑️</div>
                <h3 className="text-white font-bold font-display text-base mb-1.5">¿Eliminar este reconocimiento?</h3>
                <p className="text-[#7D8590] text-sm">Esta acción es irreversible.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-[#2D3748]">
                <button
                  onClick={() => setElimConf(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminar}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF6B6B] hover:bg-[#ff8585] transition-all"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

const INPUT_CLS = "bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#F0A500] transition-colors placeholder:text-[#4A5568]";

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#7D8590] font-semibold">{label}</label>
      {children}
    </div>
  );
}
