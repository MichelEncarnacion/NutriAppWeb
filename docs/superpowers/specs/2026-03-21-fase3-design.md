# NutriiApp — Fase 3 Design Spec
## Funcionalidades del Usuario: Panel, Mi Plan, Lecciones, Progreso + Edge Function generar-plan

**Fecha:** 2026-03-21
**Estado:** Aprobado

---

## Contexto

Fases 1 (schema SQL + RLS) y 2 (auth + onboarding) completadas. Las 4 páginas de usuario (Panel, MiPlan, Lecciones, Progreso) y la Edge Function `generar-plan` están scaffoldeadas pero tienen mismatches con el schema real y la Edge Function no existe aún. Esta fase completa el flujo de usuario de punta a punta.

---

## Alcance

1. **Edge Function `generar-plan`** — llama a Gemini, guarda plan en `planes.contenido_json`
2. **Migración SQL** — tabla `registro_comidas` para tracking por comida
3. **Panel.jsx** — KPIs reales con datos del plan y métricas
4. **MiPlan.jsx** — parseo de `contenido_json`, checkboxes persistidos
5. **Lecciones.jsx** — schema correcto, regla 7 días para Demo/Freemium
6. **Progreso.jsx** — columnas correctas, overlay freemium

---

## 1. Nueva tabla: `registro_comidas`

```sql
CREATE TABLE registro_comidas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id     uuid NOT NULL REFERENCES perfiles(id),
  plan_id       uuid NOT NULL REFERENCES planes(id),
  dia_numero    integer NOT NULL,       -- 1 al 15
  comida_index  integer NOT NULL,       -- índice dentro de dias[N].comidas
  fecha         date NOT NULL DEFAULT CURRENT_DATE,
  completada    boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (perfil_id, plan_id, dia_numero, comida_index, fecha)
);

ALTER TABLE registro_comidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios leen sus registros"
  ON registro_comidas FOR SELECT
  USING (auth.uid() = perfil_id);

CREATE POLICY "usuarios insertan sus registros"
  ON registro_comidas FOR INSERT
  WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "usuarios eliminan sus registros"
  ON registro_comidas FOR DELETE
  USING (auth.uid() = perfil_id);
```

---

## 2. Edge Function: `generar-plan`

**Ruta:** `supabase/functions/generar-plan/index.ts`
**Método:** POST
**Auth:** Bearer JWT del usuario (verificado con `supabase.auth.getUser()`)

### Flujo

1. Verificar JWT — extraer `perfil_id`
2. Leer diagnóstico completo de `diagnosticos WHERE perfil_id = $1`
3. Verificar límite freemium con `check_planes_freemium_limit`
4. Crear registro en `planes` con `estado='generando'`, `perfil_id`, `fecha_inicio=hoy`, `fecha_fin=hoy+14`
5. Construir prompt para Gemini con datos del diagnóstico
6. Llamar a `gemini-2.0-flash` con `GEMINI_API_KEY` (secret de Supabase)
7. Parsear respuesta JSON — validar presencia de `meta_diaria` y `dias` (array de 15)
8. Si válido: UPDATE `planes` con `contenido_json`, `estado='listo'`, `prompt_enviado`, `respuesta_ia`
9. Si error: UPDATE `planes` con `estado='error'` → responder HTTP 500

### Prompt a Gemini

```
Eres un nutriólogo profesional. Genera un plan nutricional personalizado de 15 días
en formato JSON estricto (sin texto extra, solo JSON válido) con esta estructura exacta:

{
  "meta_diaria": { "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number, "agua_l": number },
  "dias": [
    {
      "dia": number,  // 1 al 15
      "kcal_total": number,
      "comidas": [
        { "tipo": "desayuno|colacion_am|comida|colacion_pm|cena", "nombre": string, "descripcion": string, "hora_sugerida": "HH:MM", "kcal": number, "proteina_g": number, "carbos_g": number, "grasas_g": number }
      ]
    }
  ]
}

Datos del usuario:
- Peso: {peso} kg, Estatura: {estatura} cm, Edad: {edad} años, Sexo: {sexo}
- Objetivo: {objetivo}
- Nivel de actividad: {nivel_actividad}
- Restricciones médicas: {restricciones_medicas}
- Alergias: {alergias}
- Enfermedades: {enfermedades}
- Presupuesto quincenal: ${presupuesto_quincenal} MXN
- Hábitos alimenticios: {habitos_alimenticios}
```

### Modelo

- `gemini-2.0-flash` vía REST API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`)
- `GEMINI_API_KEY` como Supabase Function Secret (no `VITE_` prefix)

---

## 3. Panel.jsx

### Fuentes de datos

| KPI | Fuente | Notas |
|-----|--------|-------|
| Calorías objetivo | `planes.contenido_json.meta_diaria.kcal` | Plan activo |
| Calorías consumidas | `metricas` de hoy (`calorias_consumidas`) | Puede ser null |
| Comidas completadas | COUNT de `registro_comidas` WHERE fecha=hoy | |
| Comidas totales | `contenido_json.dias[diaActual].comidas.length` | |
| Agua | `metricas` de hoy (`agua_ml / 1000`) | |
| Racha | Calculada contando días consecutivos en `metricas` | |

### Macronutrientes

- **Objetivo**: `meta_diaria.proteina_g`, `carbos_g`, `grasas_g`
- **Consumido**: `metricas` del día (si existe)
- Barras de progreso: consumido vs objetivo

### Adherencia semanal

- Query `registro_comidas` de los últimos 7 días agrupado por fecha
- Porcentaje = comidas completadas / comidas totales del día

### Queries

```js
const uid = session.user.id;
const hoy = new Date().toISOString().split('T')[0];

// Plan activo
supabase.from('planes')
  .select('id, contenido_json, fecha_inicio, fecha_fin')
  .eq('perfil_id', uid)
  .eq('es_activo', true)
  .eq('estado', 'listo')
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

// Métricas de hoy
supabase.from('metricas')
  .select('calorias_consumidas, agua_ml, comidas_completadas')
  .eq('perfil_id', uid)
  .eq('fecha', hoy)
  .maybeSingle()

// Registro de comidas de hoy
supabase.from('registro_comidas')
  .select('id', { count: 'exact' })
  .eq('perfil_id', uid)
  .eq('fecha', hoy)
```

---

## 4. MiPlan.jsx

### Lógica del día activo

```js
const diaActual = Math.min(
  Math.floor((Date.now() - new Date(plan.fecha_inicio)) / 86400000) + 1,
  15
);
```

### Selector de días

- Días 1–15 con scroll horizontal
- Día activo = día calculado del plan por defecto
- El usuario puede navegar a cualquier día

### Checkboxes

- Al cargar: query `registro_comidas` WHERE `plan_id`, `dia_numero`, `fecha=hoy`
- Al hacer clic: upsert/delete en `registro_comidas`
  - Si estaba sin check → INSERT (completada=true)
  - Si estaba con check → DELETE (des-marcar)

### Bloqueo Freemium

- Si `tipo_usuario === 'freemium'` y ya existe un plan activo este mes: mostrar card con CTA Premium en lugar del plan

---

## 5. Lecciones.jsx

### Schema correcto

| Antes (roto) | Después (correcto) |
|---|---|
| `lecciones_progreso` | `lecciones_usuario` |
| `usuario_id` | `perfil_id` |
| `publicada` | `activa` |
| `numero` | `orden` |
| `completada: boolean` | `estado: 'bloqueada'/'disponible'/'en_progreso'/'completada'` |

### Lógica de desbloqueo

- **Premium**: todas las lecciones en estado `disponible` desde el inicio
- **Demo y Freemium**:
  - Lección 1: siempre `disponible`
  - Lección N+1: `disponible` solo si `lecciones_usuario.fecha_disponible <= now()`
  - Al completar lección N: UPDATE `lecciones_usuario` → `estado='completada'`, `fecha_completada=now()`, INSERT lección N+1 con `fecha_disponible = now() + INTERVAL '7 days'`

### Al marcar completada

```js
// Marcar actual como completada
await supabase.from('lecciones_usuario').upsert({
  perfil_id: uid,
  leccion_id: leccion.id,
  estado: 'completada',
  fecha_completada: new Date().toISOString()
}, { onConflict: 'perfil_id,leccion_id' });

// Desbloquear siguiente (solo si Demo/Freemium)
if (!esPremium && siguiente) {
  const disponibleEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('lecciones_usuario').upsert({
    perfil_id: uid,
    leccion_id: siguiente.id,
    estado: 'disponible',
    fecha_disponible: disponibleEn
  }, { onConflict: 'perfil_id,leccion_id' });
}
// Premium: la siguiente ya estaba disponible desde el inicio
```

---

## 6. Progreso.jsx

### Columnas correctas

| Antes | Después |
|---|---|
| RPC `get_metricas_usuario` | Query directa a `metricas` |
| `peso_kg` | `peso` |
| `pct_grasa` | `porcentaje_grasa` |
| `pct_musculo` | `porcentaje_musculo` |
| `pct_agua` | *(no existe en schema)* |

### Query

```js
supabase.from('metricas')
  .select('fecha, peso, porcentaje_grasa, porcentaje_musculo, calorias_consumidas, agua_ml')
  .eq('perfil_id', uid)
  .order('fecha', { ascending: false })
  .limit(10)
```

### Bloqueo Freemium

- Si `tipo_usuario === 'freemium'`: mostrar overlay semitransparente sobre el contenido con CTA "Hazte Premium"
- Demo y Premium: acceso completo

---

## Decisiones de diseño

| Decisión | Razón |
|---|---|
| `gemini-2.0-flash` | Rápido y económico; el plan no requiere razonamiento complejo |
| JSON en prompt con estructura exacta | Evita parseo frágil; Gemini con instrucción estricta devuelve JSON limpio |
| `registro_comidas` como tabla separada | Permite granularidad por comida, persistencia cross-session, y futura analítica |
| Upsert con unique constraint en `registro_comidas` | Idempotente; evita duplicados aunque el usuario haga doble clic |
| Overlay en lugar de redirect para Freemium en Progreso | UX menos disruptiva; el usuario puede ver qué se perdería |
| Regla 7 días manejada en frontend + fecha en DB | La fecha está en `lecciones_usuario.fecha_disponible`; el frontend solo verifica si ya es pasada |
