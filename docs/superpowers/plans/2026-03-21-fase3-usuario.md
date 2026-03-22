# Fase 3 — Funcionalidades del Usuario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar el flujo de usuario de punta a punta: Edge Function `generar-plan` con Gemini, tabla `registro_comidas`, y corrección de las 4 páginas de usuario (Panel, MiPlan, Lecciones, Progreso).

**Architecture:** La Edge Function recibe las respuestas del diagnóstico, llama a Gemini y guarda el plan como JSONB en `planes.contenido_json`. Las páginas leen directamente del schema real de Supabase (corrección de mismatches). El tracking de comidas usa la nueva tabla `registro_comidas`.

**Tech Stack:** React 19, Vite, Supabase (Postgres + Edge Functions + RLS), Gemini API (gemini-2.0-flash), Tailwind CSS v4, Deno (Edge Functions)

**Spec:** `docs/superpowers/specs/2026-03-21-fase3-design.md`

> ⚠️ No hay test framework configurado en este proyecto. Los pasos de verificación son manuales en el navegador y/o via Supabase MCP.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `supabase/functions/generar-plan/index.ts` | Crear | Edge Function: Gemini → planes.contenido_json |
| `src/pages/Panel.jsx` | Modificar | KPIs reales desde planes + metricas + registro_comidas |
| `src/pages/MiPlan.jsx` | Modificar | Parseo JSONB, checkboxes en registro_comidas |
| `src/pages/Lecciones.jsx` | Modificar | Schema correcto + regla 7 días + seed inicial |
| `src/pages/Progreso.jsx` | Modificar | Columnas correctas + overlay freemium |
| `src/pages/GenerandoPlan.jsx` | Modificar | Manejo de error 409 (límite freemium) |

---

## Task 1: Migración SQL — tabla `registro_comidas`

**Archivos:**
- Sin archivos de código — se aplica via Supabase MCP

- [ ] **Step 1: Aplicar la migración via MCP**

Ejecutar el siguiente SQL en el proyecto `rviylcgphrqkjtfzapxx`:

```sql
-- Tabla de tracking de comidas por día
CREATE TABLE registro_comidas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id     uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  plan_id       uuid NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
  dia_numero    integer NOT NULL CHECK (dia_numero BETWEEN 1 AND 15),
  comida_index  integer NOT NULL CHECK (comida_index >= 0),
  fecha         date NOT NULL DEFAULT CURRENT_DATE,
  completada    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (perfil_id, plan_id, dia_numero, comida_index, fecha)
);

-- RLS
ALTER TABLE registro_comidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registro_comidas: usuario lee los suyos"
  ON registro_comidas FOR SELECT
  USING (auth.uid() = perfil_id);

CREATE POLICY "registro_comidas: usuario inserta los suyos"
  ON registro_comidas FOR INSERT
  WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "registro_comidas: usuario elimina los suyos"
  ON registro_comidas FOR DELETE
  USING (auth.uid() = perfil_id);

-- Índices
CREATE INDEX idx_registro_comidas_perfil_fecha
  ON registro_comidas (perfil_id, fecha);

CREATE INDEX idx_registro_comidas_plan_dia
  ON registro_comidas (plan_id, dia_numero, fecha);
```

- [ ] **Step 2: Verificar que la tabla existe**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'registro_comidas'
ORDER BY ordinal_position;
```

Esperado: 8 columnas — id, perfil_id, plan_id, dia_numero, comida_index, fecha, completada, created_at

- [ ] **Step 3: Commit del paso completado**

```bash
git commit --allow-empty -m "chore: migración registro_comidas aplicada en Supabase"
```

---

## Task 2: Configurar secret GEMINI_API_KEY en Supabase

**Archivos:** Sin archivos de código

- [ ] **Step 1: Agregar el secret via Supabase CLI o Dashboard**

```bash
# Si tienes Supabase CLI instalado:
supabase secrets set GEMINI_API_KEY=<valor-del-.env> --project-ref rviylcgphrqkjtfzapxx
```

Si no tienes CLI: Dashboard → Settings → Edge Functions → Secrets → agregar `GEMINI_API_KEY`.

- [ ] **Step 2: Verificar que el secret está registrado**

El secret NO es visible después de guardarlo — basta con que aparezca el nombre `GEMINI_API_KEY` en la lista.

---

## Task 3: Edge Function `generar-plan`

**Archivos:**
- Crear: `supabase/functions/generar-plan/index.ts`

- [ ] **Step 1: Crear la estructura de directorios**

```bash
mkdir -p supabase/functions/generar-plan
```

- [ ] **Step 2: Escribir la Edge Function**

Crear `supabase/functions/generar-plan/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verificar JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perfilId = user.id;

    // 2. Leer diagnóstico
    const { data: diag, error: diagError } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("perfil_id", perfilId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (diagError || !diag) {
      return new Response(JSON.stringify({ error: "Diagnóstico no encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verificar límite freemium
    const { data: puedeGenerar, error: limitError } = await supabase
      .rpc("check_planes_freemium_limit", { p_perfil_id: perfilId });

    if (limitError) {
      return new Response(JSON.stringify({ error: "Error verificando límite" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (puedeGenerar === false) {
      return new Response(JSON.stringify({ error: "plan_limit_reached" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Desactivar planes anteriores activos del usuario
    await supabase
      .from("planes")
      .update({ es_activo: false })
      .eq("perfil_id", perfilId)
      .eq("es_activo", true);

    // Crear registro en planes con estado='generando'
    const hoy = new Date().toISOString().split("T")[0];
    const fechaFin = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];

    const { data: planRow, error: insertError } = await supabase
      .from("planes")
      .insert({
        perfil_id: perfilId,
        estado: "generando",
        fecha_inicio: hoy,
        fecha_fin: fechaFin,
        es_activo: true,
      })
      .select("id")
      .single();

    if (insertError || !planRow) {
      return new Response(JSON.stringify({ error: "Error creando plan" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planId = planRow.id;

    // 5. Llamar a Gemini con timeout 25s
    const prompt = buildPrompt(diag);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let geminiData: unknown;
    try {
      const geminiRes = await fetch(
        `${GEMINI_URL}?key=${Deno.env.get("GEMINI_API_KEY")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!geminiRes.ok) throw new Error("Gemini error: " + geminiRes.status);
      geminiData = await geminiRes.json();
    } catch (err) {
      clearTimeout(timeoutId);
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      const status = (err as Error).name === "AbortError" ? 504 : 500;
      return new Response(JSON.stringify({ error: "Error generando plan" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Extraer y validar JSON del plan
    const rawText = (geminiData as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let plan: { meta_diaria: Record<string, number>; dias: { dia: number; comidas: unknown[] }[] };
    try {
      plan = JSON.parse(rawText);
    } catch {
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      return new Response(JSON.stringify({ error: "Respuesta inválida de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Validar estructura mínima
    const valid =
      plan?.meta_diaria &&
      Array.isArray(plan?.dias) &&
      plan.dias.length === 15 &&
      plan.dias.every((d) => typeof d.dia === "number" && Array.isArray(d.comidas) && d.comidas.length > 0);

    if (!valid) {
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      return new Response(JSON.stringify({ error: "Plan incompleto generado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. Guardar plan listo
    await supabase.from("planes").update({
      contenido_json: plan,
      estado: "listo",
      prompt_enviado: prompt,
      respuesta_ia: rawText,
    }).eq("id", planId);

    return new Response(JSON.stringify({ ok: true, plan_id: planId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPrompt(diag: Record<string, unknown>): string {
  return `Eres un nutriólogo profesional. Genera un plan nutricional personalizado de exactamente 15 días.
Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta estructura exacta:

{
  "meta_diaria": { "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number, "agua_l": number },
  "dias": [
    {
      "dia": number,
      "kcal_total": number,
      "comidas": [
        { "tipo": "desayuno|colacion_am|comida|colacion_pm|cena", "nombre": string, "descripcion": string, "hora_sugerida": "HH:MM", "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number }
      ]
    }
  ]
}

El array "dias" debe tener exactamente 15 elementos (dia 1 al 15). Cada día debe tener al menos 3 comidas.

Datos del usuario:
- Peso: ${diag.peso} kg
- Estatura: ${diag.estatura} cm
- Edad: ${diag.edad} años
- Sexo: ${diag.sexo}
- Objetivo: ${diag.objetivo}
- Nivel de actividad: ${diag.nivel_actividad}
- Hábitos alimenticios: ${diag.habitos_alimenticios}
- Restricciones médicas: ${diag.restricciones_medicas ?? "ninguna"}
- Alergias: ${diag.alergias ?? "ninguna"}
- Enfermedades: ${Array.isArray(diag.enfermedades) && diag.enfermedades.length > 0 ? diag.enfermedades.join(", ") : "ninguna"}
- Presupuesto quincenal: $${diag.presupuesto_quincenal} MXN
`;
}
```

- [ ] **Step 3: Desplegar la Edge Function via MCP**

Usar `mcp__supabase__deploy_edge_function` con:
- `project_id`: `rviylcgphrqkjtfzapxx`
- `name`: `generar-plan`
- `entrypoint_path`: `supabase/functions/generar-plan/index.ts`

- [ ] **Step 4: Verificar que la función aparece desplegada**

Usar `mcp__supabase__list_edge_functions` y confirmar que `generar-plan` aparece con status activo.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/generar-plan/index.ts
git commit -m "feat: Edge Function generar-plan — Gemini 2.0 Flash + validación JSON"
```

---

## Task 4: Corregir Panel.jsx

**Archivos:**
- Modificar: `src/pages/Panel.jsx`

El Panel actual queries tablas inexistentes (`resumen_diario`) y tiene datos hardcodeados. Se reemplaza con queries reales al plan activo, métricas del día y registro de comidas.

- [ ] **Step 1: Reemplazar Panel.jsx completo**

```jsx
// src/pages/Panel.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Panel() {
    const { session, perfil } = useAuth();
    const [plan, setPlan] = useState(null);
    const [metricasHoy, setMetricasHoy] = useState(null);
    const [comidasCompletadas, setComidasCompletadas] = useState(0);
    const [adherencia, setAdherencia] = useState([]);
    const [loading, setLoading] = useState(true);

    const nombre = perfil?.nombre?.split(" ")[0] ?? "Usuario";
    const uid = session.user.id;
    const hoy = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const cargar = async () => {
            const [
                { data: planData },
                { data: metricasData },
                { count: completadas },
                { data: semanaData },
            ] = await Promise.all([
                supabase
                    .from("planes")
                    .select("id, contenido_json, fecha_inicio, fecha_fin")
                    .eq("perfil_id", uid)
                    .eq("es_activo", true)
                    .eq("estado", "listo")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),

                supabase
                    .from("metricas")
                    .select("calorias_consumidas, agua_ml")
                    .eq("perfil_id", uid)
                    .eq("fecha", hoy)
                    .maybeSingle(),

                supabase
                    .from("registro_comidas")
                    .select("id", { count: "exact", head: true })
                    .eq("perfil_id", uid)
                    .eq("fecha", hoy),

                supabase
                    .from("registro_comidas")
                    .select("fecha, plan_id")
                    .eq("perfil_id", uid)
                    .gte("fecha", new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0])
                    .order("fecha"),
            ]);

            setPlan(planData);
            setMetricasHoy(metricasData);
            setComidasCompletadas(completadas ?? 0);

            // Calcular adherencia semanal (últimos 7 días)
            const diasSemana = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
                const registros = semanaData?.filter((r) => r.fecha === d) ?? [];
                diasSemana.push({ fecha: d, count: registros.length });
            }
            setAdherencia(diasSemana);
            setLoading(false);
        };
        cargar();
    }, []);

    // Calcular día actual del plan
    const diaActual = plan?.fecha_inicio
        ? Math.min(Math.floor((Date.now() - new Date(plan.fecha_inicio)) / 86400000) + 1, 15)
        : 1;

    const meta = plan?.contenido_json?.meta_diaria ?? null;
    const comidasDelDia = plan?.contenido_json?.dias?.[diaActual - 1]?.comidas ?? [];
    const totalComidas = comidasDelDia.length;

    const kcalConsumidas = metricasHoy?.calorias_consumidas ?? 0;
    const kcalObj = meta?.kcal ?? 0;
    const aguaL = metricasHoy?.agua_ml ? (metricasHoy.agua_ml / 1000).toFixed(1) : "0";
    const aguaObj = meta?.agua_l ?? 2.5;

    const KPIS = [
        {
            label: "Calorías", icon: "🔥", color: "#3DDC84",
            value: kcalObj > 0 ? `${kcalConsumidas}` : "—",
            sub: kcalObj > 0 ? `/ ${kcalObj} kcal` : "sin plan activo",
        },
        {
            label: "Comidas", icon: "✅", color: "#58A6FF",
            value: totalComidas > 0 ? `${comidasCompletadas}/${totalComidas}` : "—",
            sub: "completadas hoy",
        },
        {
            label: "Agua", icon: "💧", color: "#F0A500",
            value: `${aguaL}L`,
            sub: `/ ${aguaObj}L objetivo`,
        },
        {
            label: "Día del plan", icon: "📅", color: "#FF6B6B",
            value: plan ? `${diaActual}` : "—",
            sub: plan ? "de 15 días" : "sin plan activo",
        },
    ];

    const MACROS = meta ? [
        { label: "Proteína", g: 0, max: meta.proteina_g, color: "#3DDC84" },
        { label: "Carbohidratos", g: 0, max: meta.carbos_g, color: "#58A6FF" },
        { label: "Grasas", g: 0, max: meta.grasas_g, color: "#F0A500" },
    ] : [];

    const DIAS_LABEL = ["L", "M", "X", "J", "V", "S", "D"];
    const HOY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-4xl animate-fadeUp">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-[#7D8590] text-xs mb-1">
                            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <h1 className="text-white text-2xl font-black font-display">
                            Hola, <span className="text-[#3DDC84]">{nombre} 👋</span>
                        </h1>
                    </div>
                </div>

                {/* KPIs */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-24 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {KPIS.map((k, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                                <div className="text-lg mb-2">{k.icon}</div>
                                <div className="font-display font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                                <div className="text-[11px] text-[#7D8590] mt-0.5">{k.sub}</div>
                                <div className="text-[9px] text-[#7D8590] mt-1.5 font-bold tracking-widest">{k.label.toUpperCase()}</div>
                                <div className="absolute top-0 right-0 w-14 h-14 rounded-full opacity-10" style={{ background: k.color, filter: "blur(16px)" }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Macros + Adherencia */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Macros */}
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Macronutrientes objetivo</h3>
                            <span className="text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-1 rounded-full">HOY</span>
                        </div>
                        {!meta ? (
                            <p className="text-[#7D8590] text-sm text-center py-4">Genera tu plan para ver tus macros objetivo</p>
                        ) : (
                            MACROS.map((m) => (
                                <div key={m.label} className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[#7D8590]">{m.label}</span>
                                        <span className="text-white">{m.g}g <span className="text-[#7D8590]">/ {m.max}g</span></span>
                                    </div>
                                    <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: m.max > 0 ? `${Math.min((m.g / m.max) * 100, 100)}%` : "0%",
                                                background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Adherencia semanal */}
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold font-display text-sm">Adherencia semanal</h3>
                            <span className="text-[10px] bg-[rgba(88,166,255,.12)] text-[#58A6FF] font-bold px-2 py-1 rounded-full">7 DÍAS</span>
                        </div>
                        <div className="flex gap-2 justify-between">
                            {DIAS_LABEL.map((d, i) => {
                                const info = adherencia[i];
                                const tiene = (info?.count ?? 0) > 0;
                                const isHoy = i === HOY_IDX;
                                return (
                                    <div key={d} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div
                                            className="h-20 w-full bg-[#1C2330] rounded-lg relative overflow-hidden"
                                            style={{ border: isHoy ? "1px solid #3DDC84" : "1px solid transparent" }}
                                        >
                                            {tiene && (
                                                <div className="absolute bottom-0 w-full h-full rounded-t-md bg-[rgba(61,220,132,.45)]" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold font-display" style={{ color: isHoy ? "#3DDC84" : "#7D8590" }}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sin plan activo */}
                {!loading && !plan && (
                    <div className="bg-[#161B22] border border-[rgba(61,220,132,.2)] rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-3">🥗</span>
                        <p className="text-white font-bold mb-1">Tu plan nutricional se está preparando</p>
                        <p className="text-[#7D8590] text-sm">Cuando esté listo aparecerá aquí tu progreso del día.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
```

- [ ] **Step 2: Verificar en el navegador**

```bash
npm run dev
```

Abrir `/panel` con un usuario logueado. Confirmar:
- Sin plan activo: KPIs muestran "—" y aparece card informativo
- Sin errores en consola relacionados con tablas inexistentes

- [ ] **Step 3: Commit**

```bash
git add src/pages/Panel.jsx
git commit -m "fix: Panel.jsx — KPIs reales desde planes + metricas + registro_comidas"
```

---

## Task 5: Corregir MiPlan.jsx

**Archivos:**
- Modificar: `src/pages/MiPlan.jsx`

Reemplazar: RPCs inexistentes, tabla `comidas` y `registro_comidas` inexistentes. La nueva versión parsea `planes.contenido_json` y usa la tabla `registro_comidas` creada en Task 1.

- [ ] **Step 1: Reemplazar MiPlan.jsx completo**

```jsx
// src/pages/MiPlan.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

const TIPO_COLOR = {
    desayuno:    { bg: "rgba(240,165,0,.12)",   color: "#F0A500", label: "Desayuno" },
    colacion_am: { bg: "rgba(88,166,255,.12)",  color: "#58A6FF", label: "Colación AM" },
    comida:      { bg: "rgba(61,220,132,.12)",  color: "#3DDC84", label: "Comida" },
    colacion_pm: { bg: "rgba(88,166,255,.12)",  color: "#58A6FF", label: "Colación PM" },
    cena:        { bg: "rgba(147,51,234,.12)",  color: "#A855F7", label: "Cena" },
};

export default function MiPlan() {
    const { session } = useAuth();
    const uid = session.user.id;

    const [plan, setPlan] = useState(null);
    const [diaActivo, setDia] = useState(1);
    const [registro, setRegistro] = useState({}); // { "diaNum-comidaIdx": true }
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);

    const hoy = new Date().toISOString().split("T")[0];

    const cargarRegistro = useCallback(async (planId, dia) => {
        const { data } = await supabase
            .from("registro_comidas")
            .select("comida_index, id")
            .eq("perfil_id", uid)
            .eq("plan_id", planId)
            .eq("dia_numero", dia)
            .eq("fecha", hoy);

        const map = {};
        (data ?? []).forEach((r) => { map[`${dia}-${r.comida_index}`] = r.id; });
        setRegistro(map);
    }, [uid, hoy]);

    useEffect(() => {
        const cargar = async () => {
            const { data: planData } = await supabase
                .from("planes")
                .select("id, contenido_json, fecha_inicio, fecha_fin, estado")
                .eq("perfil_id", uid)
                .eq("es_activo", true)
                .eq("estado", "listo")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (planData) {
                setPlan(planData);
                // Calcular día actual del plan
                const diaCalculado = Math.min(
                    Math.floor((Date.now() - new Date(planData.fecha_inicio)) / 86400000) + 1,
                    15
                );
                setDia(diaCalculado);
                await cargarRegistro(planData.id, diaCalculado);
            }
            setLoading(false);
        };
        cargar();
    }, [uid, cargarRegistro]);

    // Al cambiar de día, recargar registro
    const cambiarDia = async (dia) => {
        setDia(dia);
        if (plan) await cargarRegistro(plan.id, dia);
    };

    const toggleComida = async (comidaIndex) => {
        if (!plan || toggling !== null) return;
        const key = `${diaActivo}-${comidaIndex}`;
        const registroId = registro[key];
        setToggling(comidaIndex);

        if (registroId) {
            // Des-marcar: eliminar registro
            const nuevo = { ...registro };
            delete nuevo[key];
            setRegistro(nuevo);
            await supabase.from("registro_comidas").delete().eq("id", registroId);
        } else {
            // Marcar: insertar registro
            const { data } = await supabase
                .from("registro_comidas")
                .insert({
                    perfil_id: uid,
                    plan_id: plan.id,
                    dia_numero: diaActivo,
                    comida_index: comidaIndex,
                    fecha: hoy,
                })
                .select("id")
                .single();
            if (data) setRegistro((r) => ({ ...r, [key]: data.id }));
        }
        setToggling(null);
    };

    const comidasDelDia = plan?.contenido_json?.dias?.[diaActivo - 1]?.comidas ?? [];
    const kcalTotal = plan?.contenido_json?.dias?.[diaActivo - 1]?.kcal_total ?? 0;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Mi Plan Nutricional</h1>
                    <p className="text-[#7D8590] text-xs">
                        {plan
                            ? `Vigente hasta ${new Date(plan.fecha_fin).toLocaleDateString("es-MX")} · Día ${diaActivo} de 15`
                            : "Cargando plan..."}
                    </p>
                </div>

                {/* Selector de día */}
                {plan && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => (
                            <button
                                key={d}
                                onClick={() => cambiarDia(d)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold font-display border transition-all flex-shrink-0
                                    ${diaActivo === d
                                        ? "border-[#3DDC84] bg-[rgba(61,220,132,.12)] text-[#3DDC84]"
                                        : "border-[#2D3748] text-[#7D8590] hover:border-[#3DDC84] hover:text-white"
                                    }`}
                            >
                                Día {d}
                            </button>
                        ))}
                    </div>
                )}

                {/* Lista de comidas */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-20 animate-pulse" />
                        ))}
                    </div>
                ) : !plan ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">🥗</span>
                        <p className="text-white font-bold mb-2">No tienes un plan activo</p>
                        <p className="text-[#7D8590] text-sm">Completa tu diagnóstico para generar tu plan nutricional.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {comidasDelDia.map((c, idx) => {
                            const key = `${diaActivo}-${idx}`;
                            const completada = Boolean(registro[key]);
                            const tc = TIPO_COLOR[c.tipo] ?? TIPO_COLOR.comida;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleComida(idx)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer
                                        ${toggling === idx ? "opacity-60" : "hover:-translate-y-0.5"}
                                        ${completada ? "border-[rgba(61,220,132,.3)] opacity-75" : "border-[#2D3748]"}`}
                                >
                                    {/* Check */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                                        ${completada ? "bg-[#3DDC84] text-black" : "border-2 border-[#2D3748] text-transparent"}`}>
                                        ✓
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>
                                                {tc.label.toUpperCase()}
                                            </span>
                                            {c.hora_sugerida && (
                                                <span className="text-[10px] text-[#7D8590]">{c.hora_sugerida} hrs</span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-semibold truncate ${completada ? "line-through text-[#7D8590]" : "text-white"}`}>
                                            {c.nombre}
                                        </p>
                                        {c.descripcion && (
                                            <p className="text-xs text-[#7D8590] mt-0.5 truncate">{c.descripcion}</p>
                                        )}
                                    </div>

                                    {/* Kcal */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-bold font-display text-[#3DDC84]">{c.kcal}</div>
                                        <div className="text-[10px] text-[#7D8590]">kcal</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total del día */}
                {comidasDelDia.length > 0 && (
                    <div className="bg-[rgba(61,220,132,.06)] border border-[rgba(61,220,132,.18)] rounded-xl p-4 flex justify-between items-center">
                        <span className="text-sm text-[#7D8590]">Total del día {diaActivo}</span>
                        <span className="font-display font-black text-[#3DDC84] text-lg">{kcalTotal} kcal</span>
                    </div>
                )}
            </div>
        </Layout>
    );
}
```

- [ ] **Step 2: Verificar en el navegador**

Abrir `/mi-plan`. Confirmar:
- Sin plan activo: muestra estado vacío correcto
- Sin errores en consola sobre tablas inexistentes

- [ ] **Step 3: Commit**

```bash
git add src/pages/MiPlan.jsx
git commit -m "fix: MiPlan.jsx — parseo de contenido_json, registro_comidas, selector 15 días"
```

---

## Task 6: Corregir Lecciones.jsx

**Archivos:**
- Modificar: `src/pages/Lecciones.jsx`

Corrige: tabla `lecciones_progreso` → `lecciones_usuario`, columnas incorrectas, lógica de desbloqueo 7 días para Demo/Freemium, seed inicial.

- [ ] **Step 1: Reemplazar Lecciones.jsx completo**

```jsx
// src/pages/Lecciones.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Lecciones() {
    const { session, perfil } = useAuth();
    const uid = session.user.id;
    const esSoloPremium = perfil?.tipo_usuario === "premium";

    const [lecciones, setLecciones] = useState([]);
    const [progreso, setProgreso] = useState({}); // { leccion_id: { estado, fecha_disponible } }
    const [activa, setActiva] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            const { data: lecs } = await supabase
                .from("lecciones")
                .select("id, titulo, contenido, orden")
                .eq("activa", true)
                .order("orden");

            const { data: prog } = await supabase
                .from("lecciones_usuario")
                .select("leccion_id, estado, fecha_disponible, fecha_completada")
                .eq("perfil_id", uid);

            const map = {};
            (prog ?? []).forEach((p) => { map[p.leccion_id] = p; });

            // Seed inicial: si no hay filas en lecciones_usuario y hay lecciones activas
            if ((prog ?? []).length === 0 && (lecs ?? []).length > 0) {
                await seedLecciones(lecs, esSoloPremium, uid);
                // Recargar tras seed
                const { data: progAfter } = await supabase
                    .from("lecciones_usuario")
                    .select("leccion_id, estado, fecha_disponible, fecha_completada")
                    .eq("perfil_id", uid);
                (progAfter ?? []).forEach((p) => { map[p.leccion_id] = p; });
            }

            setLecciones(lecs ?? []);
            setProgreso(map);
            setLoading(false);
        };
        cargar();
    }, [uid, esSoloPremium]);

    const marcarCompletada = async (leccion) => {
        // Marcar leccion actual como completada
        await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: leccion.id,
            estado: "completada",
            fecha_completada: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });

        // Desbloquear siguiente lección
        const idx = lecciones.findIndex((l) => l.id === leccion.id);
        const siguiente = lecciones[idx + 1];
        if (siguiente) {
            const disponibleEn = esSoloPremium
                ? new Date().toISOString()
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            await supabase.from("lecciones_usuario").upsert({
                perfil_id: uid,
                leccion_id: siguiente.id,
                estado: "disponible",
                fecha_disponible: disponibleEn,
            }, { onConflict: "perfil_id,leccion_id" });
            setProgreso((p) => ({
                ...p,
                [leccion.id]: { ...p[leccion.id], estado: "completada" },
                [siguiente.id]: { estado: "disponible", fecha_disponible: disponibleEn },
            }));
        } else {
            setProgreso((p) => ({
                ...p,
                [leccion.id]: { ...p[leccion.id], estado: "completada" },
            }));
        }

        setActiva(null);
    };

    const estaDesbloqueada = (leccion) => {
        const p = progreso[leccion.id];
        if (!p) return false;
        if (p.estado === "completada") return true;
        if (p.estado === "disponible") {
            // Verificar si la fecha_disponible ya pasó
            return !p.fecha_disponible || new Date(p.fecha_disponible) <= new Date();
        }
        return false;
    };

    const completadas = Object.values(progreso).filter((p) => p?.estado === "completada").length;
    const total = lecciones.length;

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Lecciones</h1>
                    <p className="text-[#7D8590] text-xs">Aprende los fundamentos de la nutrición a tu ritmo</p>
                </div>

                {/* Progreso general */}
                {!loading && total > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#7D8590]">Tu progreso general</span>
                                <span className="text-[#3DDC84] font-bold font-display">{completadas}/{total} completadas</span>
                            </div>
                            <div className="h-1.5 bg-[#1C2330] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#3DDC84] to-[#58A6FF] rounded-full transition-all duration-700"
                                    style={{ width: `${total > 0 ? (completadas / total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-2xl font-display font-black text-[#3DDC84] flex-shrink-0">
                            {total > 0 ? Math.round((completadas / total) * 100) : 0}%
                        </div>
                    </div>
                )}

                {/* Lista de lecciones */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-24 animate-pulse" />
                        ))}
                    </div>
                ) : lecciones.length === 0 ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📖</span>
                        <p className="text-white font-bold mb-2">Próximamente</p>
                        <p className="text-[#7D8590] text-sm">Las lecciones estarán disponibles pronto.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {lecciones.map((lec, idx) => {
                            const p = progreso[lec.id];
                            const completada = p?.estado === "completada";
                            const desbloqueada = estaDesbloqueada(lec);
                            const diasRestantes = p?.fecha_disponible
                                ? Math.max(0, Math.ceil((new Date(p.fecha_disponible) - new Date()) / 86400000))
                                : null;

                            return (
                                <div
                                    key={lec.id}
                                    onClick={() => desbloqueada && !completada && setActiva(lec)}
                                    className={`bg-[#161B22] border rounded-xl p-4 flex items-center gap-4 transition-all
                                        ${desbloqueada && !completada ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#3DDC84]" : ""}
                                        ${completada ? "border-[rgba(61,220,132,.3)] opacity-80 cursor-default" : "border-[#2D3748]"}
                                        ${!desbloqueada && !completada ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {/* Número / estado */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm flex-shrink-0
                                        ${completada ? "bg-[#3DDC84] text-black" : "bg-[#1C2330] text-[#7D8590] border border-[#2D3748]"}`}>
                                        {completada ? "✓" : desbloqueada ? lec.orden : "🔒"}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${completada ? "text-[#7D8590]" : "text-white"}`}>
                                            {lec.titulo}
                                        </p>
                                        {!desbloqueada && !completada && diasRestantes !== null && diasRestantes > 0 && (
                                            <p className="text-[10px] text-[#F0A500] mt-0.5">
                                                Disponible en {diasRestantes} {diasRestantes === 1 ? "día" : "días"}
                                            </p>
                                        )}
                                        {completada && (
                                            <p className="text-[10px] text-[#3DDC84] mt-0.5">Completada ✓</p>
                                        )}
                                    </div>

                                    {desbloqueada && !completada && (
                                        <span className="text-[#7D8590] flex-shrink-0">→</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de lección activa */}
            {activa && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-2xl w-full max-w-xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-[#3DDC84] font-bold mb-1">LECCIÓN {activa.orden}</p>
                                <h2 className="text-white font-bold font-display text-lg">{activa.titulo}</h2>
                            </div>
                            <button onClick={() => setActiva(null)} className="text-[#7D8590] hover:text-white text-xl">✕</button>
                        </div>

                        <div className="text-[#7D8590] text-sm leading-relaxed whitespace-pre-wrap">
                            {activa.contenido}
                        </div>

                        <button
                            onClick={() => marcarCompletada(activa)}
                            className="w-full py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm"
                        >
                            Marcar como completada ✓
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}

async function seedLecciones(lecciones, esSoloPremium, uid) {
    if (esSoloPremium) {
        // Premium: todas disponibles inmediatamente (upsert para evitar errores en seed parcial)
        const rows = lecciones.map((l) => ({
            perfil_id: uid,
            leccion_id: l.id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }));
        await supabase.from("lecciones_usuario").upsert(rows, { onConflict: "perfil_id,leccion_id" });
    } else {
        // Demo/Freemium: solo primera lección disponible
        await supabase.from("lecciones_usuario").upsert({
            perfil_id: uid,
            leccion_id: lecciones[0].id,
            estado: "disponible",
            fecha_disponible: new Date().toISOString(),
        }, { onConflict: "perfil_id,leccion_id" });
    }
}
```

- [ ] **Step 2: Agregar unique constraint en `lecciones_usuario` si no existe**

```sql
-- Verificar si el constraint existe
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'lecciones_usuario' AND constraint_type = 'UNIQUE';

-- Si no existe (perfil_id, leccion_id), crearlo:
ALTER TABLE lecciones_usuario
  ADD CONSTRAINT lecciones_usuario_perfil_leccion_unique
  UNIQUE (perfil_id, leccion_id);
```

Ejecutar via Supabase MCP antes de continuar.

- [ ] **Step 3: Verificar en el navegador**

Abrir `/lecciones`. Confirmar:
- Sin lecciones en DB: muestra "Próximamente"
- Con lecciones en DB: seed inicial funciona y se ve la primera disponible
- Sin errores de tablas inexistentes en consola

- [ ] **Step 4: Commit**

```bash
git add src/pages/Lecciones.jsx
git commit -m "fix: Lecciones.jsx — schema correcto, regla 7 días Demo/Freemium, seed inicial"
```

---

## Task 7: Corregir Progreso.jsx

**Archivos:**
- Modificar: `src/pages/Progreso.jsx`

Corrige columnas incorrectas y agrega overlay bloqueante para usuarios Freemium.

- [ ] **Step 1: Reemplazar Progreso.jsx completo**

```jsx
// src/pages/Progreso.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function Progreso() {
    const { session, perfil } = useAuth();
    const uid = session.user.id;
    const esFreemium = perfil?.tipo_usuario === "freemium";

    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (esFreemium) { setLoading(false); return; }

        const cargar = async () => {
            const { data } = await supabase
                .from("metricas")
                .select("fecha, peso, porcentaje_grasa, porcentaje_musculo, calorias_consumidas, agua_ml")
                .eq("perfil_id", uid)
                .order("fecha", { ascending: false })
                .limit(10);
            setMetricas(data ?? []);
            setLoading(false);
        };
        cargar();
    }, [uid, esFreemium]);

    const ultima = metricas[0] ?? null;
    const segunda = metricas[1] ?? null;

    const delta = (campo) => {
        if (!ultima || !segunda || ultima[campo] == null || segunda[campo] == null) return null;
        const d = (ultima[campo] - segunda[campo]).toFixed(1);
        return { valor: d, positivo: Number(d) > 0 };
    };

    const CAMPOS = [
        { key: "peso", label: "Peso", unit: "kg", bueno: false },
        { key: "porcentaje_grasa", label: "% Grasa", unit: "%", bueno: false },
        { key: "porcentaje_musculo", label: "% Músculo", unit: "%", bueno: true },
        { key: "calorias_consumidas", label: "Calorías", unit: "kcal", bueno: true },
    ];

    return (
        <Layout>
            <div className="flex flex-col gap-5 max-w-3xl relative">
                <div>
                    <h1 className="text-white text-2xl font-black font-display mb-1">Progreso</h1>
                    <p className="text-[#7D8590] text-xs">Seguimiento de tus métricas corporales a lo largo del tiempo</p>
                </div>

                {/* Overlay bloqueante para Freemium */}
                {esFreemium && (
                    <div className="absolute inset-0 z-10 bg-[#0D1117]/90 rounded-xl flex flex-col items-center justify-center gap-5 p-8 text-center min-h-[400px]">
                        <span className="text-5xl">📊</span>
                        <h2 className="text-white text-xl font-bold font-display">Tu progreso, protegido</h2>
                        <p className="text-[#7D8590] text-sm leading-relaxed max-w-xs">
                            Con Premium puedes ver tus métricas históricas, gráficas de peso, % grasa y músculo a lo largo del tiempo.
                        </p>
                        <button className="px-6 py-3 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm">
                            Hazte Premium ✨
                        </button>
                    </div>
                )}

                {/* Tarjetas de métricas */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="bg-[#161B22] border border-[#2D3748] rounded-xl h-32 animate-pulse" />)}
                    </div>
                ) : !ultima ? (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-8 text-center">
                        <span className="text-4xl block mb-3">📊</span>
                        <p className="text-white font-bold mb-2">Sin métricas registradas</p>
                        <p className="text-[#7D8590] text-sm">Completa tu primer formulario de seguimiento para ver tu progreso.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {CAMPOS.map((c) => {
                            if (ultima[c.key] == null) return null;
                            const d = delta(c.key);
                            const mejora = d ? (c.bueno ? d.positivo : !d.positivo) : null;
                            return (
                                <div key={c.key} className="bg-[#161B22] border border-[#2D3748] rounded-xl p-4 hover:-translate-y-0.5 transition-transform">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[9px] text-[#7D8590] font-bold tracking-widest">{c.label.toUpperCase()}</p>
                                        {d && (
                                            <span className={`text-xs font-bold font-display ${mejora ? "text-[#3DDC84]" : "text-[#FF6B6B]"}`}>
                                                {Number(d.valor) > 0 ? "+" : ""}{d.valor}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-display font-black text-2xl text-white mb-3">
                                        {ultima[c.key]}
                                        <span className="text-sm text-[#7D8590] font-normal"> {c.unit}</span>
                                    </div>
                                    {/* Mini sparkline */}
                                    <div className="flex gap-0.5 items-end h-8">
                                        {metricas.slice().reverse().map((m, i) => m[c.key] != null && (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-sm"
                                                style={{
                                                    height: `${Math.max(10, (m[c.key] / Math.max(...metricas.map((x) => x[c.key] ?? 0))) * 100)}%`,
                                                    background: i === metricas.length - 1 ? "#3DDC84" : "rgba(61,220,132,.3)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Historial */}
                {metricas.length > 0 && (
                    <div className="bg-[#161B22] border border-[#2D3748] rounded-xl p-5">
                        <h3 className="text-white font-bold font-display text-sm mb-4">Historial de registros</h3>
                        <div className="flex flex-col divide-y divide-[#2D3748]">
                            {metricas.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 py-3 text-sm flex-wrap">
                                    <span className="text-[#7D8590] text-xs w-20 flex-shrink-0">
                                        {new Date(m.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                                    </span>
                                    {m.peso != null && <span className="text-white font-semibold">{m.peso} kg</span>}
                                    {m.porcentaje_grasa != null && <span className="text-[#7D8590]">Grasa: {m.porcentaje_grasa}%</span>}
                                    {m.porcentaje_musculo != null && <span className="text-[#7D8590]">Músculo: {m.porcentaje_musculo}%</span>}
                                    {i === 0 && <span className="ml-auto text-[10px] bg-[rgba(61,220,132,.12)] text-[#3DDC84] font-bold px-2 py-0.5 rounded-full">ACTUAL</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
```

- [ ] **Step 2: Verificar en el navegador**

Abrir `/progreso` con usuario freemium: debe ver overlay bloqueante. Con usuario premium/demo: debe ver las métricas (o el estado vacío si no hay métricas).

- [ ] **Step 3: Commit**

```bash
git add src/pages/Progreso.jsx
git commit -m "fix: Progreso.jsx — columnas correctas, overlay freemium"
```

---

## Task 8: Corregir GenerandoPlan.jsx — error 409

**Archivos:**
- Modificar: `src/pages/GenerandoPlan.jsx`

Agregar manejo del error 409 (límite freemium) con mensaje específico.

- [ ] **Step 1: Agregar manejo de error 409**

En `GenerandoPlan.jsx`, localizar el bloque `catch` y la verificación `if (!res.ok)`, y reemplazar:

```jsx
// Línea actual (~64):
if (!res.ok) throw new Error("Error al generar el plan");
```

Por:

```jsx
if (res.status === 409) {
    setError("Ya tienes un plan activo este mes. Los usuarios Freemium pueden generar 1 plan por mes.");
    return;
}
if (!res.ok) throw new Error("Error al generar el plan");
```

- [ ] **Step 2: Verificar en el navegador**

Simular la respuesta 409 (o probar con usuario freemium con plan activo). El mensaje debe ser claro y distinto al error genérico.

- [ ] **Step 3: Commit**

```bash
git add src/pages/GenerandoPlan.jsx
git commit -m "fix: GenerandoPlan.jsx — manejo de error 409 límite freemium"
```

---

## Task 9: Verificación final end-to-end

- [ ] **Step 1: Build de producción sin errores**

```bash
npm run build
```

Esperado: sin errores de compilación.

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

Esperado: 0 errores (warnings menores son aceptables).

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: Fase 3 completa — generar-plan Edge Function + Panel + MiPlan + Lecciones + Progreso"
```
