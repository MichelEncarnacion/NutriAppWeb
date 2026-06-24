// src/pages/SaludMental.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { MapPin, IdCard, BadgeCheck, MessageCircle, X } from "lucide-react";

function whatsappUrl(telefono, nombreColaborador, nombreUsuario) {
  const digitos = telefono.replace(/\D/g, "");
  const numero  = digitos.length === 10 ? `52${digitos}` : digitos;
  const mensaje =
    `Hola ${nombreColaborador}, soy ${nombreUsuario || "un usuario"} de NutriiApp. ` +
    `Me interesa agendar una consulta y vengo de NutriiApp para aplicar el descuento. ¿Podrías darme más información?`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export default function SaludMental() {
  const { perfil } = useAuth();
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    let activo = true;
    supabase
      .from("colaboradores")
      .select("*")
      .eq("publicado", true)
      .order("orden", { ascending: true })
      .then(({ data }) => {
        if (activo) {
          setItems(data ?? []);
          setLoading(false);
        }
      });
    return () => { activo = false; };
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fadeUp">
        <div>
          <h1 className="text-text-primary text-2xl font-black font-display mb-1">Salud mental</h1>
          <p className="text-text-muted text-sm max-w-xl">
            Psicólogos y centros terapéuticos aliados de NutriiApp. Contáctalos directo por WhatsApp y obtén un descuento exclusivo para ti.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-text-muted text-sm py-10">Cargando…</div>
        ) : items.length === 0 ? (
          <Card className="text-center text-text-muted text-sm py-10">
            Aún no tenemos especialistas registrados. Vuelve pronto.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((c) => (
              <Card key={c.id} className="p-0 rounded-xl overflow-hidden flex flex-col">
                {c.foto_url ? (
                  <div className="w-full h-40 md:h-32 flex items-center justify-center bg-dark-700">
                    <img
                      src={c.foto_url}
                      alt={c.nombre}
                      className="h-full w-full object-contain"
                      onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 md:h-32 flex items-center justify-center bg-brand-purple/10">
                    <span className="text-3xl font-black font-display text-brand-purple">
                      {c.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-text-primary font-bold text-sm mb-0.5">{c.nombre}</p>
                  {c.enfoque && <p className="text-brand-purple text-xs font-semibold mb-3">{c.enfoque}</p>}
                  <Button variant="secondary" size="sm" className="mt-auto" onClick={() => setSeleccion(c)}>
                    Ver perfil
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de perfil ────────────────────────────────────── */}
      {seleccion && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => setSeleccion(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-dark-600 bg-dark-800">
              <div className="relative">
                {seleccion.foto_url ? (
                  <div className="h-44 w-full flex items-center justify-center bg-dark-700">
                    <img
                      src={seleccion.foto_url}
                      alt={seleccion.nombre}
                      className="h-full w-full object-contain"
                      onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                    />
                  </div>
                ) : (
                  <div className="h-44 w-full flex items-center justify-center bg-brand-purple/10">
                    <span className="text-5xl font-black font-display text-brand-purple">
                      {seleccion.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSeleccion(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-dark-900/80 hover:bg-dark-900 transition-colors"
                >
                  <X size={16} className="text-text-primary" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-text-primary font-bold font-display text-lg mb-0.5">{seleccion.nombre}</p>
                {seleccion.enfoque && (
                  <p className="text-brand-purple text-xs font-semibold mb-4">{seleccion.enfoque}</p>
                )}

                <div className="flex flex-col gap-3 mb-4">
                  {seleccion.ubicacion && (
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-text-muted" />
                      <p className="text-text-muted text-xs leading-relaxed">{seleccion.ubicacion}</p>
                    </div>
                  )}
                  {seleccion.cedula && (
                    <div className="flex items-start gap-2.5">
                      <IdCard size={16} className="mt-0.5 flex-shrink-0 text-text-muted" />
                      <p className="text-text-muted text-xs leading-relaxed">Cédula profesional: {seleccion.cedula}</p>
                    </div>
                  )}
                  {seleccion.tipo_terapias && (
                    <div className="flex items-start gap-2.5">
                      <BadgeCheck size={16} className="mt-0.5 flex-shrink-0 text-text-muted" />
                      <p className="text-text-muted text-xs leading-relaxed">{seleccion.tipo_terapias}</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl px-4 py-3 bg-brand-orange/10 border border-brand-orange/25 mb-4">
                  <p className="text-brand-orange text-sm font-bold">
                    {Math.round((seleccion.descuento ?? 0) * 100)}% de descuento para la comunidad NutriiApp
                  </p>
                </div>

                {seleccion.telefono ? (
                  <a
                    href={whatsappUrl(seleccion.telefono, seleccion.nombre, perfil?.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-bold font-display text-sm hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle size={18} />
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <p className="text-text-muted text-xs text-center">Este colaborador no tiene WhatsApp registrado.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
