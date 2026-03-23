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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const perfilId = user.id;

    // 2. Leer diagnóstico
    const { data: diag, error: diagError } = await supabase
      .from("diagnosticos")
      .select("peso, estatura, edad, sexo, objetivo, nivel_actividad, habitos_alimenticios, restricciones_medicas, alergias, enfermedades, presupuesto_quincenal")
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
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
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

function buildPrompt(diag: Record<string, unknown>): string {
  const safe = (v: unknown, max = 200): string =>
    String(v ?? "ninguna").slice(0, max).replace(/\n/g, " ");

  const enfermedades = Array.isArray(diag.enfermedades) && diag.enfermedades.length > 0
    ? safe(diag.enfermedades.join(", "))
    : "ninguna";

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
- Peso: ${safe(diag.peso, 20)} kg
- Estatura: ${safe(diag.estatura, 20)} cm
- Edad: ${safe(diag.edad, 10)} años
- Sexo: ${safe(diag.sexo, 20)}
- Objetivo: ${safe(diag.objetivo)}
- Nivel de actividad: ${safe(diag.nivel_actividad)}
- Hábitos alimenticios: ${safe(diag.habitos_alimenticios)}
- Restricciones médicas: ${safe(diag.restricciones_medicas)}
- Alergias: ${safe(diag.alergias)}
- Enfermedades: ${enfermedades}
- Presupuesto quincenal: $${safe(diag.presupuesto_quincenal, 20)} MXN
`;
}
