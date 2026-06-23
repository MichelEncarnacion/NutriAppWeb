// src/pages/Ejercicios.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivePlan } from "../hooks/useActivePlan";
import Layout from "../components/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function Ejercicios() {
  const { plan, isLoading, stuckGenerating } = useActivePlan();
  const navigate = useNavigate();
  const rutina = plan?.rutina_ejercicio ?? null;
  const [abierta, setAbierta] = useState(0);

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

        <div className="flex flex-col gap-3">
          {rutina.sesiones.map((s, i) => {
            const expandida = abierta === i;
            return (
              <Card key={`${s.dia_semana}-${i}`} className="p-0 overflow-hidden">
                <button
                  onClick={() => setAbierta(expandida ? -1 : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-dark-700/50 transition-colors"
                >
                  <div>
                    <p className="text-text-primary font-bold text-sm">{s.dia_semana}</p>
                    <p className="text-text-muted text-xs mt-0.5">{s.enfoque}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {s.duracion_min != null && (
                      <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/10 rounded-full px-2.5 py-1">
                        {s.duracion_min} min
                      </span>
                    )}
                    <span className="text-text-muted text-xs">{expandida ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expandida && (
                  <div className="px-5 pb-5 flex flex-col gap-4 border-t border-dark-600 pt-4">
                    {s.calentamiento && (
                      <div>
                        <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">CALENTAMIENTO</p>
                        <p className="text-text-primary text-xs leading-relaxed">{s.calentamiento}</p>
                      </div>
                    )}

                    {Array.isArray(s.ejercicios) && s.ejercicios.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">EJERCICIOS</p>
                        {s.ejercicios.map((ej, j) => (
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

                    {s.enfriamiento && (
                      <div>
                        <p className="text-[10px] font-bold text-text-muted tracking-widest mb-1">ENFRIAMIENTO</p>
                        <p className="text-text-primary text-xs leading-relaxed">{s.enfriamiento}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
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
    </Layout>
  );
}
