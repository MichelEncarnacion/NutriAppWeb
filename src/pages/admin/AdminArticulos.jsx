// src/pages/admin/AdminArticulos.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import ImageUploader from "../../components/admin/ImageUploader";

const CATEGORIAS = ["Blog", "Salud", "Nutrición", "Empresa", "Investigación"];

const CAT_COLORS = {
  "Blog":          { bg: "rgba(168,85,247,.1)",  color: "#A855F7" },
  "Salud":         { bg: "rgba(61,220,132,.1)",  color: "#3DDC84" },
  "Nutrición":     { bg: "rgba(88,166,255,.1)",  color: "#58A6FF" },
  "Empresa":       { bg: "rgba(240,165,0,.1)",   color: "#F0A500" },
  "Investigación": { bg: "rgba(255,107,107,.1)", color: "#FF6B6B" },
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
            { label: "Total artículos", value: articulos.length,          color: "#A855F7" },
            { label: "Publicados",      value: totalPublicados,            color: "#3DDC84" },
            { label: "Borradores",      value: articulos.length - totalPublicados, color: "#F0A500" },
          ].map((s) => (
            <div key={s.label} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4">
              <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#7D8590] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            type="text"
            placeholder="Buscar por título o categoría…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-[#161B22] border border-[#2D3748] rounded-xl px-3 py-2 text-white text-sm w-full sm:w-72 outline-none focus:border-[#A855F7] transition-colors placeholder:text-[#4A5568]"
          />
          <button
            onClick={abrirCrear}
            className="bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
          >
            + Nuevo artículo
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#7D8590] text-sm">Cargando…</div>
          ) : filtrados.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">✍️</div>
              <p className="text-[#7D8590] text-sm">
                {busqueda ? "Sin resultados para tu búsqueda." : "No hay artículos todavía. ¡Crea el primero!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="text-[#7D8590] text-left border-b border-[#2D3748] text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Título</th>
                    <th className="px-4 py-3.5 font-bold">Categoría</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold">Lectura</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2330]">
                  {filtrados.map((a) => {
                    const cat = CAT_COLORS[a.categoria] ?? { bg: "rgba(255,255,255,.06)", color: "#E6EDF3" };
                    return (
                      <tr key={a.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-white font-semibold leading-snug line-clamp-2 max-w-xs">{a.titulo}</p>
                          {a.extracto && (
                            <p className="text-[#4A5568] text-xs mt-0.5 line-clamp-1">{a.extracto}</p>
                          )}
                          {a.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {a.tags.slice(0, 3).map((t) => (
                                <span key={t} className="text-[9px] bg-[#1C2330] text-[#7D8590] px-1.5 py-0.5 rounded-md">{t}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap" style={{ background: cat.bg, color: cat.color }}>
                            {a.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">{a.fecha_display ?? "—"}</td>
                        <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">{a.tiempo_lectura ?? "—"}</td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePublicado(a)}
                            title={a.publicado ? "Clic para despublicar" : "Clic para publicar"}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer
                              ${a.publicado
                                ? "bg-[rgba(61,220,132,.12)] text-[#3DDC84] hover:bg-[rgba(61,220,132,.22)]"
                                : "bg-[rgba(240,165,0,.1)] text-[#F0A500] hover:bg-[rgba(240,165,0,.2)]"
                              }`}
                          >
                            {a.publicado ? "● Publicado" : "○ Borrador"}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => abrirEditar(a)}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#58A6FF] bg-[rgba(88,166,255,.08)] hover:bg-[rgba(88,166,255,.18)] transition-all"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setElimConf(a.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#FF6B6B] bg-[rgba(255,107,107,.08)] hover:bg-[rgba(255,107,107,.18)] transition-all"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                <div>
                  <h3 className="text-white font-bold font-display text-base">
                    {modal === "crear" ? "Nuevo artículo" : "Editar artículo"}
                  </h3>
                  <p className="text-[#7D8590] text-xs mt-0.5">
                    {modal === "crear" ? "Se guardará como borrador hasta que lo publiques." : "Los cambios se aplican al guardar."}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-[#7D8590] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">

                <FormField label="Título *">
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={set("titulo")}
                    placeholder="Ej. 5 hábitos de nutrición para mejorar tu energía"
                    maxLength={200}
                    className={INPUT_CLS}
                  />
                  <span className="text-[10px] text-[#4A5568] text-right">{formData.titulo.length}/200</span>
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Categoría *">
                    <select value={formData.categoria} onChange={set("categoria")} className={INPUT_CLS}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Fecha de publicación">
                    <input
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2026"
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Tiempo de lectura">
                    <input
                      type="text"
                      value={formData.tiempo_lectura}
                      onChange={set("tiempo_lectura")}
                      placeholder="Ej. 5 min"
                      className={INPUT_CLS}
                    />
                  </FormField>
                  <FormField label="Tags (separados por coma)">
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={set("tags")}
                      placeholder="nutrición, salud, hábitos"
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                <FormField label="Extracto * (resumen corto)">
                  <textarea
                    value={formData.extracto}
                    onChange={set("extracto")}
                    rows={3}
                    maxLength={300}
                    placeholder="Breve descripción del artículo (máx. 300 caracteres)"
                    className={`${INPUT_CLS} resize-none`}
                  />
                  <span className="text-[10px] text-[#4A5568] text-right">{formData.extracto.length}/300</span>
                </FormField>

                <FormField label="Contenido completo">
                  <textarea
                    value={formData.contenido}
                    onChange={set("contenido")}
                    rows={7}
                    placeholder="Cuerpo del artículo. Soporta texto plano o Markdown."
                    className={`${INPUT_CLS} resize-none font-mono`}
                  />
                </FormField>

                <FormField label="Imagen (opcional)">
                  <ImageUploader
                    value={formData.imagen_url}
                    onChange={(url) => setFormData((p) => ({ ...p, imagen_url: url }))}
                    folder="articulos"
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
                      <div className="w-10 h-5 bg-[#2D3748] peer-focus:ring-2 peer-focus:ring-[#A855F7] rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-[#3DDC84] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <span className="text-xs text-[#7D8590]">
                      {formData.publicado ? <span className="text-[#3DDC84] font-bold">Publicado</span> : "Borrador"}
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
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#A855F7] hover:bg-[#9333EA] transition-all disabled:opacity-50"
                >
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear artículo" : "Guardar cambios"}
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
                <h3 className="text-white font-bold font-display text-base mb-1.5">¿Eliminar este artículo?</h3>
                <p className="text-[#7D8590] text-sm">Esta acción es irreversible.</p>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-[#2D3748]">
                <button
                  onClick={() => setElimConf(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] hover:border-[#4A5568] transition-all"
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

const INPUT_CLS = "bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors placeholder:text-[#4A5568]";

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#7D8590] font-semibold">{label}</label>
      {children}
    </div>
  );
}
