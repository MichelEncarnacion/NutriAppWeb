// src/pages/admin/AdminNoticias.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

/* ── Constantes ──────────────────────────────────────────────── */
const CATEGORIAS = ["Empresa", "Investigación", "Salud Corporativa"];

const CAT_COLORS = {
  "Empresa":           { bg: "rgba(61,220,132,.1)",   color: "#3DDC84" },
  "Investigación":     { bg: "rgba(240,165,0,.1)",    color: "#F0A500" },
  "Salud Corporativa": { bg: "rgba(88,166,255,.1)",   color: "#58A6FF" },
};

const FORM_EMPTY = {
  titulo:        "",
  extracto:      "",
  categoria:     "Empresa",
  fecha_display: "",
  imagen_url:    "",
  contenido:     "",
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
      imagen_url:    formData.imagen_url.trim() || null,
      contenido:     formData.contenido.trim() || null,
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
            { label: "Total artículos", value: noticias.length,  color: "#A855F7" },
            { label: "Publicados",      value: totalPublicadas,   color: "#3DDC84" },
            { label: "Borradores",      value: totalBorradores,   color: "#F0A500" },
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
            + Nueva noticia
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#7D8590] text-sm">Cargando…</div>
          ) : filtradas.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">📰</div>
              <p className="text-[#7D8590] text-sm">
                {busqueda ? "Sin resultados para tu búsqueda." : "No hay noticias todavía. ¡Crea la primera!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[#7D8590] text-left border-b border-[#2D3748] text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Título</th>
                    <th className="px-4 py-3.5 font-bold">Categoría</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold text-center">Orden</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2330]">
                  {filtradas.map((n) => {
                    const cat = CAT_COLORS[n.categoria] ?? { bg: "rgba(255,255,255,.06)", color: "#E6EDF3" };
                    return (
                      <tr key={n.id} className="hover:bg-[rgba(255,255,255,.02)] transition-colors group">
                        {/* Título */}
                        <td className="px-5 py-4">
                          <p className="text-white font-semibold leading-snug line-clamp-2 max-w-xs">{n.titulo}</p>
                          {n.extracto && (
                            <p className="text-[#4A5568] text-xs mt-0.5 line-clamp-1">{n.extracto}</p>
                          )}
                        </td>

                        {/* Categoría */}
                        <td className="px-4 py-4">
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                            style={{ background: cat.bg, color: cat.color }}
                          >
                            {n.categoria}
                          </span>
                        </td>

                        {/* Fecha */}
                        <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">{n.fecha_display}</td>

                        {/* Orden */}
                        <td className="px-4 py-4 text-center text-[#7D8590] text-xs">{n.orden}</td>

                        {/* Estado — toggle */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => togglePublicado(n)}
                            title={n.publicado ? "Clic para despublicar" : "Clic para publicar"}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer
                              ${n.publicado
                                ? "bg-[rgba(61,220,132,.12)] text-[#3DDC84] hover:bg-[rgba(61,220,132,.22)]"
                                : "bg-[rgba(240,165,0,.1)] text-[#F0A500] hover:bg-[rgba(240,165,0,.2)]"
                              }`}
                          >
                            {n.publicado ? "● Publicado" : "○ Borrador"}
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => abrirEditar(n)}
                              className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#58A6FF] bg-[rgba(88,166,255,.08)] hover:bg-[rgba(88,166,255,.18)] transition-all"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setElimConf(n.id)}
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

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3748]">
                <div>
                  <h3 className="text-white font-bold font-display text-base">
                    {modal === "crear" ? "Nueva noticia" : "Editar noticia"}
                  </h3>
                  <p className="text-[#7D8590] text-xs mt-0.5">
                    {modal === "crear" ? "Se guardará como borrador hasta que la publiques." : "Los cambios se aplican de inmediato al guardar."}
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-[#7D8590] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Título */}
                <FormField label="Título *">
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={set("titulo")}
                    placeholder="Ej. NutriiApp lanza nueva versión del dashboard"
                    maxLength={200}
                    className={INPUT_CLS}
                  />
                  <span className="text-[10px] text-[#4A5568] text-right">{formData.titulo.length}/200</span>
                </FormField>

                {/* Categoría + Fecha */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Categoría *">
                    <select value={formData.categoria} onChange={set("categoria")} className={INPUT_CLS}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Fecha de publicación *">
                    <input
                      type="text"
                      value={formData.fecha_display}
                      onChange={set("fecha_display")}
                      placeholder="Ej. Mayo 2026"
                      className={INPUT_CLS}
                    />
                  </FormField>
                </div>

                {/* Extracto */}
                <FormField label="Extracto * (2 líneas resumen)">
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

                {/* Contenido */}
                <FormField label="Contenido completo (opcional)">
                  <textarea
                    value={formData.contenido}
                    onChange={set("contenido")}
                    rows={5}
                    placeholder="Cuerpo del artículo completo. Soporta texto plano."
                    className={`${INPUT_CLS} resize-none`}
                  />
                </FormField>

                {/* Imagen URL */}
                <FormField label="URL de imagen (opcional)">
                  <input
                    type="url"
                    value={formData.imagen_url}
                    onChange={set("imagen_url")}
                    placeholder="https://..."
                    className={INPUT_CLS}
                  />
                </FormField>

                {/* Orden + Publicado */}
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

                {/* Error */}
                {error && (
                  <div className="bg-[rgba(255,107,107,.1)] border border-[rgba(255,107,107,.3)] text-[#FF6B6B] rounded-xl px-4 py-2.5 text-xs">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
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
                  {guardando ? "Guardando…" : modal === "crear" ? "Crear noticia" : "Guardar cambios"}
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
                <p className="text-[#7D8590] text-sm">Esta acción es irreversible. El artículo se eliminará de la landing.</p>
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

/* ── Helpers de UI ───────────────────────────────────────────── */
const INPUT_CLS = "bg-[#1C2330] border border-[#2D3748] rounded-xl px-3 py-2.5 text-white text-sm w-full outline-none focus:border-[#A855F7] transition-colors placeholder:text-[#4A5568]";

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#7D8590] font-semibold">{label}</label>
      {children}
    </div>
  );
}
