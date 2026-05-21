// src/pages/admin/AdminFundadores.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";

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
        <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl p-5">
          <p className="text-white font-bold text-sm mb-0.5">Foto del equipo</p>
          <p className="text-[#7D8590] text-xs mb-4">Se muestra en la sección "Quiénes somos" de la página Nosotros.</p>
          <ImageUploader
            value={fotoEquipo}
            onChange={guardarFotoEquipo}
            folder="equipo"
          />
          {guardandoFoto && <p className="text-xs text-[#7D8590] mt-2">Guardando…</p>}
        </div>

        {/* ── Integrantes ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold text-sm">Integrantes del equipo</p>
            <button
              onClick={abrirCrear}
              className="bg-[#F0A500] hover:bg-[#e09400] text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              + Nuevo integrante
            </button>
          </div>

          {loading ? (
            <div className="text-center text-[#7D8590] text-sm py-10">Cargando…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map((f) => (
                <div
                  key={f.id}
                  className="bg-[#161B22] border border-[#2D3748] rounded-2xl overflow-hidden"
                >
                  {/* Foto del integrante */}
                  {f.imagen_url ? (
                    <div
                      className="relative overflow-hidden cursor-pointer group"
                      style={{ background: "#0D1117" }}
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
                        <span className="text-white text-xs font-bold">Ver foto completa</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full flex items-center justify-center"
                      style={{ height: 120, background: "linear-gradient(135deg, #1A1032 0%, #2D1B69 100%)" }}
                    >
                      <span
                        className="text-4xl font-black font-display"
                        style={{ color: "#A855F7" }}
                      >
                        {f.initials}
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    <p className="text-white font-bold text-sm mb-0.5">{f.nombre}</p>
                    <p className="text-[#A855F7] text-xs font-semibold mb-2">{f.rol}</p>
                    {f.descripcion && (
                      <p className="text-[#7D8590] text-xs leading-relaxed line-clamp-3 mb-3">{f.descripcion}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(f)}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#58A6FF] bg-[rgba(88,166,255,.08)] hover:bg-[rgba(88,166,255,.18)] transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setElimConf(f.id)}
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
                <h3 className="text-white font-bold font-display text-base">
                  {modal === "crear" ? "Nuevo integrante" : "Editar integrante"}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-[#7D8590] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <FormField label="Nombre completo *">
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={set("nombre")}
                    placeholder="Ej. Michel Encarnación Dionicio"
                    className={INPUT_CLS}
                  />
                </FormField>

                <FormField label="Rol / Cargo *">
                  <input
                    type="text"
                    value={formData.rol}
                    onChange={set("rol")}
                    placeholder="Ej. CTO y Co-fundador · Ing. de Software"
                    className={INPUT_CLS}
                  />
                </FormField>

                <FormField label="Descripción">
                  <textarea
                    value={formData.descripcion}
                    onChange={set("descripcion")}
                    rows={3}
                    placeholder="Describe brevemente el rol y contribución al proyecto…"
                    className={`${INPUT_CLS} resize-none`}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Inicial (avatar sin foto)">
                    <input
                      type="text"
                      value={formData.initials}
                      onChange={set("initials")}
                      maxLength={2}
                      placeholder="Ej. M"
                      className={INPUT_CLS}
                    />
                  </FormField>
                  <FormField label="Orden de aparición">
                    <input
                      type="number"
                      value={formData.orden}
                      onChange={set("orden")}
                      min={0}
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                <FormField label="Foto del integrante (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="fundadores"
                  />
                </FormField>

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
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear integrante" : "Guardar cambios"}
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
                <h3 className="text-white font-bold font-display text-base mb-1.5">¿Eliminar este integrante?</h3>
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
