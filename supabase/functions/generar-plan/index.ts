import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Configuración incompleta" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verificar JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar identidad con anon key + JWT del usuario
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perfilId = user.id;

    // Cliente con service role para operaciones de DB (bypass RLS, identidad ya verificada)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Soporte para regeneración desde admin: si el JWT es de un admin
    // y el body incluye target_perfil_id, generar el plan para ese usuario.
    let effectivePerfilId = perfilId;
    let isAdminRegeneration = false;
    try {
      const bodyText = await req.text();
      console.log("[generar-plan] raw body:", bodyText);
      const body = bodyText ? JSON.parse(bodyText) : null;
      console.log("[generar-plan] parsed body:", JSON.stringify(body));
      if (body?.target_perfil_id) {
        const isAdmin =
          user.app_metadata?.role === "admin" ||
          user.user_metadata?.role === "admin";
        console.log("[generar-plan] isAdmin:", isAdmin, "app_metadata:", JSON.stringify(user.app_metadata));
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "No autorizado para regenerar planes de otros usuarios" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        effectivePerfilId = body.target_perfil_id;
        isAdminRegeneration = true;
      }
    } catch (bodyErr) {
      console.error("[generar-plan] error parsing body:", bodyErr);
      // Body vacío o inválido — continuar con perfilId del JWT
    }
    console.log("[generar-plan] effectivePerfilId:", effectivePerfilId, "isAdminRegeneration:", isAdminRegeneration);

    // 2. Leer diagnóstico
    const { data: diag, error: diagError } = await supabase
      .from("diagnosticos")
      .select(`
        peso, peso_meta, estatura, edad, sexo, objetivo, meta_personal, ocupacion,
        nivel_actividad, dias_ejercicio, tipo_ejercicio,
        comidas_por_dia, horario_primer_comida, horario_ultima_comida,
        habitos_alimenticios, alimentos_no_gustados,
        restricciones_medicas, alergias, enfermedades, presupuesto_quincenal,
        vasos_agua, horas_sueno, consume_alcohol, nivel_estres, tiempo_cocina
      `)
      .eq("perfil_id", effectivePerfilId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (diagError || !diag) {
      return new Response(JSON.stringify({ error: "Diagnóstico no encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verificar límite freemium (omitir si es regeneración por admin)
    if (!isAdminRegeneration) {
      const { data: puedeGenerar, error: limitError } = await supabase
        .rpc("check_planes_freemium_limit", { uid: effectivePerfilId });

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
    }

    // 4. Desactivar planes anteriores activos del usuario
    await supabase
      .from("planes")
      .update({ es_activo: false })
      .eq("perfil_id", effectivePerfilId)
      .eq("es_activo", true);

    // Crear registro en planes con estado='generando'
    const hoy = new Date().toISOString().split("T")[0];
    const fechaFin = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];

    const { data: planRow, error: insertError } = await supabase
      .from("planes")
      .insert({
        perfil_id: effectivePerfilId,
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
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    let geminiData: unknown;
    try {
      const geminiRes = await fetch(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              thinkingConfig: { thinkingBudget: 0 },
              maxOutputTokens: 65536,
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!geminiRes.ok) {
        const body = await geminiRes.text();
        throw new Error(`Gemini ${geminiRes.status}: ${body.slice(0, 300)}`);
      }
      geminiData = await geminiRes.json();
    } catch (err) {
      clearTimeout(timeoutId);
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      const isTimeout = (err as Error).name === "AbortError";
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: isTimeout ? 504 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Extraer y validar JSON del plan
    const candidate = (geminiData as { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[] })
      ?.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text ?? "";
    console.log("[generar-plan] finishReason:", candidate?.finishReason, "rawText length:", rawText.length);

    let plan: { meta_diaria: Record<string, number>; dias: { dia: number; comidas: unknown[] }[] };
    try {
      plan = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[generar-plan] JSON.parse failed:", parseErr, "finishReason:", candidate?.finishReason);
      await supabase.from("planes").update({ estado: "error", respuesta_ia: rawText }).eq("id", planId);
      return new Response(JSON.stringify({ error: "Respuesta inválida de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Validar estructura mínima
    const valid =
      plan?.meta_diaria &&
      Array.isArray(plan?.dias) &&
      plan.dias.length === 15 &&
      plan.dias.every((d) => typeof d.dia === "number" && Array.isArray(d.comidas) && d.comidas.length >= 3);

    if (!valid) {
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      return new Response(JSON.stringify({ error: "Plan incompleto generado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 8. Guardar plan listo
    const { error: updateError } = await supabase.from("planes").update({
      contenido_json: plan,
      estado: "listo",
      prompt_enviado: prompt,
      respuesta_ia: rawText,
    }).eq("id", planId);

    if (updateError) {
      await supabase.from("planes").update({ estado: "error" }).eq("id", planId);
      return new Response(JSON.stringify({ error: "Error guardando plan" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, plan_id: planId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("generar-plan unexpected error:", err);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const OBJETIVO_ESTRATEGIA: Record<string, string> = {
  perder_peso: "Aplica un déficit calórico moderado y sostenible (no agresivo), priorizando saciedad (proteína y fibra altas) para minimizar el hambre y preservar masa muscular.",
  bajar_grasa: "Aplica un déficit calórico moderado con proteína alta para preservar masa muscular mientras se reduce el porcentaje de grasa corporal.",
  ganar_masa_muscular: "Aplica un superávit calórico ligero con proteína alta (mínimo 1.6-2.2 g/kg de peso) repartida en todas las comidas para favorecer la síntesis muscular.",
  subir_peso: "Aplica un superávit calórico moderado usando alimentos densos en energía y nutrientes, evitando solo ultraprocesados, para una ganancia de peso saludable.",
  peso_ideal: "Aplica un balance calórico de mantenimiento, enfocado en calidad nutricional, regularidad de horarios y composición corporal equilibrada.",
};

function buildPrompt(diag: Record<string, unknown>): string {
  const safe = (v: unknown, max = 200): string =>
    String(v ?? "no especificado").slice(0, max).replace(/\n/g, " ");

  const listaSafe = (v: unknown): string =>
    Array.isArray(v) && v.length > 0 ? safe(v.join(", ")) : "ninguno";

  const objetivo = String(diag.objetivo ?? "");
  const estrategiaObjetivo = OBJETIVO_ESTRATEGIA[objetivo] ?? OBJETIVO_ESTRATEGIA.peso_ideal;

  const enfermedades = listaSafe(diag.enfermedades);
  const tipoEjercicio = listaSafe(diag.tipo_ejercicio);
  const alimentosNoGustados = listaSafe(diag.alimentos_no_gustados);
  const diasEjercicio = diag.dias_ejercicio !== null && diag.dias_ejercicio !== undefined
    ? String(diag.dias_ejercicio)
    : "0";

  return `Actúa como un equipo de dos especialistas trabajando en conjunto para una persona en Puebla, México:
1) Un nutriólogo especializado en salud pública y economía familiar mexicana, experto en maximizar la nutrición minimizando el gasto usando alimentos accesibles en mercados y tiendas locales (frijoles, tortillas, verduras de temporada, proteínas económicas como huevo, pollo, atún, sardina, hígado, leguminosas, etc.).
2) Un entrenador físico certificado, experto en diseñar rutinas seguras y realistas adaptadas al nivel, tiempo y equipo disponible de cada persona, y en cómo el ejercicio debe coordinarse con la alimentación.

Tu tarea es generar un plan COMPLETO Y PERSONALIZADO basado ÚNICAMENTE en las respuestas del cuestionario del usuario que se muestran abajo — cada respuesta debe reflejarse de forma evidente en el resultado (macros, tipo de comidas, horarios, tipo de rutina, intensidad, días de entrenamiento, recomendaciones de bienestar). No generes un plan genérico: ajústalo a esta persona en particular.

ESTRATEGIA NUTRICIONAL SEGÚN SU OBJETIVO ("${safe(objetivo)}"): ${estrategiaObjetivo}

Respeta estrictamente su presupuesto quincenal, sus restricciones médicas, alergias y enfermedades. Evita por completo los alimentos que no le gustan. Ajusta el número y horario de comidas a sus hábitos reales (comidas/día y horario de su primera y última comida). Si su tiempo disponible para cocinar es bajo, prioriza recetas simples y rápidas; si es alto, puedes incluir preparaciones algo más elaboradas. Prioriza ingredientes de bajo costo y alta densidad nutricional típicos de Puebla y México.

Para la rutina de ejercicio: ajústala a su nivel de actividad actual, los días por semana que ya entrena, el tipo de ejercicio que prefiere y su objetivo nutricional (p. ej. si el objetivo es ganar masa muscular, prioriza rutinas de fuerza progresiva; si es perder peso o bajar grasa, combina fuerza con cardio para maximizar gasto calórico sin sacrificar músculo). Si tiene enfermedades, alergias o restricciones médicas relevantes para el ejercicio (cardiovasculares, articulares, etc.), modera la intensidad y evita movimientos de riesgo, indicándolo en las notas. Si su nivel de estrés es alto o duerme poco, incluye una nota breve de recuperación (sueño/estrés) ligada al rendimiento físico y nutricional.

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta estructura exacta:

{
  "meta_diaria": { "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number, "agua_l": number },
  "lista_compras": {
    "costo_total_estimado": number,
    "items": [
      {
        "categoria": "Proteínas|Verduras y frutas|Cereales y tortillas|Lácteos|Leguminosas|Condimentos y otros",
        "nombre": string,
        "cantidad": string,
        "costo_aproximado": number
      }
    ]
  },
  "dias": [
    {
      "dia": number,
      "kcal_total": number,
      "comidas": [
        { "tipo": "desayuno|colacion_am|comida|colacion_pm|cena", "nombre": string, "descripcion": string, "ingredientes": [{"nombre": string, "cantidad": string}], "hora_sugerida": "HH:MM", "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number }
      ]
    }
  ],
  "rutina_ejercicio": {
    "resumen": string,
    "dias_por_semana": number,
    "sesiones": [
      {
        "dia_semana": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
        "enfoque": string,
        "duracion_min": number,
        "calentamiento": string,
        "ejercicios": [
          { "nombre": string, "series": string, "repeticiones": string, "descanso": string, "notas": string }
        ],
        "enfriamiento": string
      }
    ],
    "recomendaciones": [string]
  }
}

El array "dias" debe tener exactamente 15 elementos (dia 1 al 15). Cada día debe tener al menos 3 comidas.
El campo "ingredientes" de cada comida es OBLIGATORIO y debe listar TODOS y CADA UNO de los ingredientes necesarios para prepararla, sin excepción. Incluye condimentos, aceite, sal y cualquier ingrediente menor. Usa cantidades exactas en gramos (g), mililitros (ml), piezas, tazas o cucharadas según corresponda. Ejemplo: {"nombre": "pechuga de pollo", "cantidad": "150g"}, {"nombre": "tortilla de maíz", "cantidad": "2 piezas"}, {"nombre": "aceite vegetal", "cantidad": "1 cdita"}. Nunca dejes el array ingredientes vacío.
El campo "lista_compras" debe contener TODOS los ingredientes necesarios para los 15 días, consolidados y sin repetir, con cantidades totales para toda la quincena y precios aproximados en MXN según el mercado local de Puebla, México. El costo_total_estimado debe estar dentro del presupuesto quincenal del usuario.
El campo "rutina_ejercicio.sesiones" debe tener un elemento por cada día de entrenamiento que la persona indicó (o, si indicó 0, propone una rutina de inicio de 2-3 días/semana acorde a su nivel sedentario). El array "ejercicios" de cada sesión debe tener entre 4 y 8 ejercicios concretos y realizables sin equipo especializado salvo que el usuario haya indicado que va al gimnasio/pesas. "recomendaciones" debe incluir 2-4 tips breves de bienestar (hidratación, sueño, estrés, descanso) conectados a sus respuestas de estilo de vida.

Respuestas del cuestionario del usuario:
- Peso actual: ${safe(diag.peso, 20)} kg
- Peso objetivo: ${safe(diag.peso_meta, 20)} kg
- Estatura: ${safe(diag.estatura, 20)} cm
- Edad: ${safe(diag.edad, 10)} años
- Sexo: ${safe(diag.sexo, 20)}
- Objetivo principal: ${safe(diag.objetivo)}
- Motivación personal: ${safe(diag.meta_personal, 300)}
- Ocupación: ${safe(diag.ocupacion, 100)}
- Nivel de actividad física: ${safe(diag.nivel_actividad)}
- Días de ejercicio por semana actuales: ${diasEjercicio}
- Tipo de ejercicio que practica: ${tipoEjercicio}
- Comidas por día: ${safe(diag.comidas_por_dia, 10)}
- Horario primera comida: ${safe(diag.horario_primer_comida, 10)}
- Horario última comida: ${safe(diag.horario_ultima_comida, 10)}
- Alimentos que prefiere/consume: ${safe(diag.habitos_alimenticios)}
- Alimentos que NO le gustan: ${alimentosNoGustados}
- Restricciones médicas / medicamentos: ${safe(diag.restricciones_medicas)}
- Alergias: ${safe(diag.alergias)}
- Enfermedades diagnosticadas: ${enfermedades}
- Presupuesto quincenal: $${safe(diag.presupuesto_quincenal, 20)} MXN
- Vasos de agua al día: ${safe(diag.vasos_agua, 10)}
- Horas de sueño promedio: ${safe(diag.horas_sueno, 10)}
- Consumo de alcohol: ${safe(diag.consume_alcohol, 30)}
- Nivel de estrés: ${safe(diag.nivel_estres, 30)}
- Tiempo disponible para cocinar (min): ${safe(diag.tiempo_cocina, 10)}
`;
}
