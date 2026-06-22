// src/pages/admin/AdminSolicitudes.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

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
            { label: "Total",     value: items.length,          colorVar: "var(--color-brand-purple)" },
            { label: "Sin leer",  value: noLeidas,              colorVar: "var(--color-brand-orange)" },
            { label: "Leídas",    value: items.length - noLeidas, colorVar: "var(--color-brand-green)" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className="font-display font-black text-2xl" style={{ color: s.colorVar }}>{s.value}</div>
              <div className="text-xs text-text-muted mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabla */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-muted text-sm">Cargando…</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-text-muted text-sm">Aún no hay solicitudes de demo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-text-muted text-left border-b border-dark-600 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3.5 font-bold">Empresa / Contacto</th>
                    <th className="px-4 py-3.5 font-bold">Correo</th>
                    <th className="px-4 py-3.5 font-bold">Teléfono</th>
                    <th className="px-4 py-3.5 font-bold">Colaboradores</th>
                    <th className="px-4 py-3.5 font-bold">Fecha</th>
                    <th className="px-4 py-3.5 font-bold text-center">Estado</th>
                    <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {items.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[rgba(255,255,255,.02)] transition-colors group cursor-pointer"
                      onClick={() => { setDetalle(s); if (!s.leida) marcarLeida(s.id, true); }}
                    >
                      <td className="px-5 py-4">
                        <p className="text-text-primary font-semibold leading-snug">{s.empresa}</p>
                        <p className="text-text-muted text-xs mt-0.5">{s.nombre} · {s.cargo}</p>
                      </td>
                      <td className="px-4 py-4 text-brand-blue text-xs">
                        <a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()}>{s.email}</a>
                      </td>
                      <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">
                        {s.telefono || <span className="text-dark-600">—</span>}
                      </td>
                      <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">{s.colaboradores}</td>
                      <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">{fmtFecha(s.created_at)}</td>
                      <td className="px-4 py-4 text-center">
                        <Badge tone={s.leida ? "green" : "orange"}>
                          {s.leida ? "● Leída" : "○ Nueva"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" size="sm" onClick={() => marcarLeida(s.id, !s.leida)}>
                            {s.leida ? "Sin leer" : "Marcar leída"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => { if (confirm("¿Eliminar esta solicitud?")) eliminar(s.id); }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
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
            <div className="w-full max-w-lg rounded-xl border border-dark-600 flex flex-col bg-dark-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
                <div>
                  <h3 className="text-text-primary font-bold font-display text-base">{detalle.empresa}</h3>
                  <p className="text-text-muted text-xs mt-0.5">{fmtFecha(detalle.created_at)}</p>
                </div>
                <button
                  onClick={() => setDetalle(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-text-muted hover:text-text-primary transition-colors bg-dark-700"
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
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide mb-0.5">{label}</p>
                    {link ? (
                      <a href={link} className="text-brand-blue text-sm font-semibold hover:underline">{value}</a>
                    ) : (
                      <p className="text-text-primary text-sm">{value}</p>
                    )}
                  </div>
                ) : null)}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-dark-600">
                <Button variant="secondary" fullWidth onClick={() => setDetalle(null)}>
                  Cerrar
                </Button>
                <a
                  href={`mailto:${detalle.email}`}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold font-display text-white bg-brand-purple hover:bg-brand-purple/85 transition-colors text-center"
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
