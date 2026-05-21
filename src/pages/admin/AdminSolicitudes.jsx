// src/pages/admin/AdminSolicitudes.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";

export default function AdminSolicitudes() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("solicitudes_demo")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarLeida = async (id, leida) => {
    await supabase.from("solicitudes_demo").update({ leida }).eq("id", id);
    setItems((prev) => prev.map((x) => x.id === id ? { ...x, leida } : x));
  };

  const eliminar = async (id) => {
    await supabase.from("solicitudes_demo").delete().eq("id", id);
    setDetalle(null);
    cargar();
  };

  const noLeidas = items.filter((i) => !i.leida).length;

  const fmtFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout titulo="Solicitudes de demo">
      <div className="flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",     value: items.length,          color: "#A855F7" },
            { label: "Sin leer",  value: noLeidas,              color: "#F0A500" },
            { label: "Leídas",    value: items.length - noLeidas, color: "#3DDC84" },
          ].map((s) => (
            <div key={s.label} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4">
              <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#7D8590] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-[#161B22] border border-[#2D3748] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#7D8590] text-sm">Cargando…</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-[#7D8590] text-sm">Aún no hay solicitudes de demo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[#7D8590] text-left border-b border-[#2D3748] text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Empresa / Contacto</th>
                    <th className="px-4 py-3.5 font-bold">Correo</th>
                    <th className="px-4 py-3.5 font-bold">Teléfono</th>
                    <th className="px-4 py-3.5 font-bold">Colaboradores</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2330]">
                  {items.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[rgba(255,255,255,.02)] transition-colors group cursor-pointer"
                      onClick={() => { setDetalle(s); if (!s.leida) marcarLeida(s.id, true); }}
                    >
                      <td className="px-5 py-4">
                        <p className="text-white font-semibold leading-snug">{s.empresa}</p>
                        <p className="text-[#7D8590] text-xs mt-0.5">{s.nombre} · {s.cargo}</p>
                      </td>
                      <td className="px-4 py-4 text-[#58A6FF] text-xs">
                        <a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()}>{s.email}</a>
                      </td>
                      <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">
                        {s.telefono || <span className="text-[#4A5568]">—</span>}
                      </td>
                      <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">{s.colaboradores}</td>
                      <td className="px-4 py-4 text-[#7D8590] text-xs whitespace-nowrap">{fmtFecha(s.created_at)}</td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full
                            ${s.leida
                              ? "bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                              : "bg-[rgba(240,165,0,.12)] text-[#F0A500]"
                            }`}
                        >
                          {s.leida ? "● Leída" : "○ Nueva"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => marcarLeida(s.id, !s.leida)}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#58A6FF] bg-[rgba(88,166,255,.08)] hover:bg-[rgba(88,166,255,.18)] transition-all"
                          >
                            {s.leida ? "Sin leer" : "Marcar leída"}
                          </button>
                          <button
                            onClick={() => { if (confirm("¿Eliminar esta solicitud?")) eliminar(s.id); }}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold text-[#FF6B6B] bg-[rgba(255,107,107,.08)] hover:bg-[rgba(255,107,107,.18)] transition-all"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal detalle ── */}
      {detalle && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => setDetalle(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#2D3748] flex flex-col" style={{ background: "#161B22" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D3748]">
                <div>
                  <h3 className="text-white font-bold font-display text-base">{detalle.empresa}</h3>
                  <p className="text-[#7D8590] text-xs mt-0.5">{fmtFecha(detalle.created_at)}</p>
                </div>
                <button
                  onClick={() => setDetalle(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-[#7D8590] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >✕</button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-3">
                {[
                  { label: "Nombre",         value: detalle.nombre },
                  { label: "Cargo",          value: detalle.cargo },
                  { label: "Correo",         value: detalle.email, link: `mailto:${detalle.email}` },
                  { label: "Teléfono",       value: detalle.telefono, link: `tel:${detalle.telefono}` },
                  { label: "Colaboradores",  value: detalle.colaboradores },
                  { label: "Reto principal", value: detalle.reto },
                ].map(({ label, value, link }) => value ? (
                  <div key={label}>
                    <p className="text-[10px] text-[#7D8590] font-bold uppercase tracking-wide mb-0.5">{label}</p>
                    {link ? (
                      <a href={link} className="text-[#58A6FF] text-sm font-semibold hover:underline">{value}</a>
                    ) : (
                      <p className="text-white text-sm">{value}</p>
                    )}
                  </div>
                ) : null)}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-[#2D3748]">
                <button
                  onClick={() => setDetalle(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#7D8590] hover:text-white border border-[#2D3748] transition-all"
                >
                  Cerrar
                </button>
                <a
                  href={`mailto:${detalle.email}`}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-[#F0A500] hover:bg-[#e09400] transition-all text-center"
                >
                  Responder por correo
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
