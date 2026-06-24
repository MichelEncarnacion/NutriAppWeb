// src/pages/Ejercicios.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivePlan } from "../hooks/useActivePlan";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { X } from "lucide-react";

const ZONA_DEFAULT = { emoji: "🏋️", gradiente: "linear-gradient(135deg,#1B5E20,#3DDC84)" };

const ZONAS = [
  { match: /pierna|glúte|gluteo|cuadríceps|cuadriceps|muslo/i, emoji: "🦵", gradiente: "linear-gradient(135deg,#7C3AED,#A855F7)" },
  { match: /pecho|push|empuje/i, emoji: "🏋️", gradiente: "linear-gradient(135deg,#2563EB,#58A6FF)" },
  { match: /espalda|jalón|jalon|pull|tracción|traccion/i, emoji: "💪", gradiente: "linear-gradient(135deg,#1B5E20,#3DDC84)" },
  { match: /abdomen|core|abdominal/i, emoji: "🔥", gradiente: "linear-gradient(135deg,#BF9000,#F0A500)" },
  { match: /cardio|hiit|resistencia/i, emoji: "🏃", gradiente: "linear-gradient(135deg,#DC2626,#FF6B6B)" },
  { match: /brazo|bícep|bicep|trícep|tricep|hombro/i, emoji: "💪", gradiente: "linear-gradient(135deg,#0E7490,#22D3EE)" },
  { match: /descanso|movilidad|estiramiento|recuperación|recuperacion/i, emoji: "🧘", gradiente: "linear-gradient(135deg,#475569,#94A3B8)" },
];

function zonaDe(enfoque) {
  const texto = enfoque ?? "";
  return ZONAS.find((z) => z.match.test(texto)) ?? ZONA_DEFAULT;
}

export default function Ejercicios() {
  const { plan, isLoading, stuckGenerating } = useActivePlan();
  const navigate = useNavigate();
  const rutina = plan?.rutina_ejercicio ?? null;
  const [seleccion, setSeleccion] = useState(null);
  const zonaSeleccion = seleccion ? zonaDe(seleccion.enfoque) : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center text-text-muted text-sm py-16">Cargando tu rutina…</div>
      </Layout>
    );
  }

  if (!plan || !rutina || !Array.isArray(rutina.sesiones) || rutina.sesiones.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fadeUp">
          <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl bg-brand-blue/10 border border-brand-blue/20">
            💪
          </div>
          <div>
            <h1 className="text-text-primary text-2xl font-black font-display mb-2">Ejercicios</h1>
            <p className="text-text-muted text-sm max-w-xs leading-relaxed">
              {stuckGenerating
                ? "Tu plan está tardando más de lo normal en generarse. Intenta regenerarlo desde Mi Plan."
                : "Genera tu plan nutricional para recibir también una rutina de ejercicio personalizada según tu objetivo."}
            </p>
          </div>
          <Button onClick={() => navigate("/mi-plan")}>Ir a Mi Plan</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fadeUp">
        <div>
          <Badge tone="blue" className="mb-2">Personalizada para ti</Badge>
          <h1 className="text-text-primary text-2xl font-black font-display mb-1">Ejercicios</h1>
          <p className="text-text-muted text-sm max-w-xl leading-relaxed">{rutina.resumen}</p>
          {rutina.dias_por_semana != null && (
            <p className="text-brand-blue text-xs font-bold mt-2">
              {rutina.dias_por_semana} {Number(rutina.dias_por_semana) === 1 ? "día" : "días"} de entrenamiento por semana
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {rutina.sesiones.map((s, i) => {
            const zona = zonaDe(s.enfoque);
            return (
              <button
                key={`${s.dia_semana}-${i}`}
                onClick={() => setSeleccion(s)}
                className="relative h-36 rounded-2xl overflow-hidden text-left flex flex-col justify-between p-4 transition-transform hover:scale-[1.02]"
                style={{ background: zona.gradiente }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">{s.dia_semana}</span>
                  {s.duracion_min != null && (
                    <span className="text-[10px] font-bold text-white bg-black/25 rounded-full px-2 py-0.5">
                      {s.duracion_min} min
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-white font-black font-display text-sm leading-tight max-w-[80%]">{s.enfoque}</p>
                  <span className="text-3xl">{zona.emoji}</span>
                </div>
              </button>
            );
          })}
        </div>

        {Array.isArray(rutina.recomendaciones) && rutina.recomendaciones.length > 0 && (
          <Card>
            <p className="text-[10px] font-bold text-brand-green tracking-widest mb-3">RECOMENDACIONES</p>
            <ul className="flex flex-col gap-2">
              {rutina.recomendaciones.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-text-muted text-xs leading-relaxed">
                  <span className="text-brand-green mt-0.5">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* ── Modal de detalle de sesión ─────────────────────────── */}
      {seleccion && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => setSeleccion(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-dark-600 bg-dark-800">
              <div className="relative p-6 pb-4" style={{ background: zonaSeleccion.gradiente }}>
                <button
                  onClick={() => setSeleccion(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                <span className="text-4xl block mb-2">{zonaSeleccion.emoji}</span>
                <p className="text-white/80 text-[10px] font-bold tracking-widest uppercase mb-1">{seleccion.dia_semana}</p>
                <h3 className="text-white font-black font-display text-lg">{seleccion.enfoque}</h3>
                {seleccion.duracion_min != null && (
                  <p className="text-white/90 text-xs font-bold mt-1">{seleccion.duracion_min} min de entrenamiento</p>
                )}
              </div>

              <div className="p-6 flex flex-col gap-4">
                {seleccion.calentamiento && (
                  <div>
                    <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">CALENTAMIENTO</p>
                    <p className="text-text-primary text-xs leading-relaxed">{seleccion.calentamiento}</p>
                  </div>
                )}

                {Array.isArray(seleccion.ejercicios) && seleccion.ejercicios.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">EJERCICIOS</p>
                    {seleccion.ejercicios.map((ej, j) => (
                      <div key={j} className="bg-dark-700 rounded-xl px-4 py-3">
                        <p className="text-text-primary font-semibold text-sm mb-1">{ej.nombre}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                          {ej.series && <span>Series: <span className="text-text-primary font-medium">{ej.series}</span></span>}
                          {ej.repeticiones && <span>Reps: <span className="text-text-primary font-medium">{ej.repeticiones}</span></span>}
                          {ej.descanso && <span>Descanso: <span className="text-text-primary font-medium">{ej.descanso}</span></span>}
                        </div>
                        {ej.notas && <p className="text-text-muted text-xs mt-1.5 italic">{ej.notas}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {seleccion.enfriamiento && (
                  <div>
                    <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">ENFRIAMIENTO</p>
                    <p className="text-text-primary text-xs leading-relaxed">{seleccion.enfriamiento}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
