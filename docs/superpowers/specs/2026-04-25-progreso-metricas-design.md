# Métricas de Progreso — Design Spec
**Fecha:** 2026-04-25
**Objetivo:** Agregar 5 métricas funcionales a la página de Progreso para beta testers

---

## Contexto

`Progreso.jsx` ya muestra peso, % grasa y % músculo en una gráfica combinada normalizada. Este spec expande esa página con métricas calculadas más útiles y agrega `peso_meta` al flujo de diagnóstico.

---

## Cambios de Schema

### diagnosticos table — nueva columna
```sql
alter table diagnosticos add column if not exists peso_meta numeric;
```

No es required — usuarios con diagnóstico previo no tendrán el campo. La UI lo maneja con un estado vacío graceful.

---

## 1. Diagnostico.jsx — Nueva Pregunta

Agregar una pregunta en el bloque "Datos básicos", después de la pregunta `peso_kg` (peso actual):

```js
{
  bloque: "Datos básicos",
  emoji: "🎯",
  pregunta: "¿Cuál es tu peso objetivo?",
  campo: "peso_meta",
  tipo: "numero",
  placeholder: "65",
  sufijo: "kg",
  min: 30, max: 300,
}
```

Al guardar el diagnóstico (`guardar()`), incluir `peso_meta` en el objeto `datos`:
```js
peso_meta: Number(respuestas.peso_meta) || null,
```

---

## 2. Progreso.jsx — 5 Métricas

### Data fetching

Fetch adicional a `diagnosticos` para obtener `peso` (inicial), `estatura`, `peso_meta` del diagnóstico más reciente del usuario:

```js
const { data: diag } = await supabase
  .from('diagnosticos')
  .select('peso, estatura, peso_meta')
  .eq('perfil_id', uid)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
```

### Métrica 1 y 2: Peso / % Grasa / % Músculo (existentes)
Sin cambios en los datos. Se mantienen las stat pills y la gráfica combinada normalizada actual.

### Métrica 3: IMC

**Cálculo:** `peso_actual / (estatura_m)²`
- `peso_actual` = `metricas[0].peso` (último registro)
- `estatura_m` = `diag.estatura / 100`

**Clasificación OMS:**
- `< 18.5` → Bajo peso (color: `#58A6FF`)
- `18.5 – 24.9` → Normal (color: `#3DDC84`)
- `25 – 29.9` → Sobrepeso (color: `#F0A500`)
- `≥ 30` → Obesidad (color: `#FF6B6B`)

**UI:** Card con valor del IMC en grande, badge con clasificación y color correspondiente.

**Estado vacío:** Si no hay `diag.estatura` o no hay métricas con peso, no mostrar la card.

### Métrica 4: Progreso hacia Peso Objetivo

**Datos necesarios:** `diag.peso` (peso inicial), `diag.peso_meta`, `metricas[0].peso` (peso actual)

**Cálculo:**
- `delta_total` = `peso_inicial - peso_meta` (cuánto hay que cambiar en total)
- `delta_actual` = `peso_inicial - peso_actual` (cuánto ha cambiado)
- `pct` = `Math.min(Math.max((delta_actual / delta_total) * 100, 0), 100)`

**Manejo de objetivo de subir peso:** Si `peso_meta > peso_inicial`, invertir el cálculo:
- `delta_total` = `peso_meta - peso_inicial`
- `delta_actual` = `peso_actual - peso_inicial`

**UI:** Barra de progreso horizontal con:
- Extremo izquierdo: peso inicial
- Extremo derecho: peso meta
- Marcador: posición del peso actual
- Porcentaje completado encima

**Estado vacío:** Si `diag.peso_meta` es null, mostrar card con mensaje "Actualiza tu diagnóstico para ver tu progreso hacia tu meta" y botón → `/diagnostico`.

### Métrica 5: Tendencia de Peso

**Nota:** La gráfica existente es normalizada (% cambio vs baseline, 3 series mezcladas). La tendencia de peso requiere valores reales en kg — se agrega una **nueva gráfica dedicada de peso** que reemplaza la gráfica combinada, o se agrega debajo. La gráfica combinada existente queda para grasa/músculo.

**Nueva gráfica de peso:** `LineChart` con dos líneas:
- Línea sólida: peso real (`metricas` en kg, valores reales no normalizados)
- Línea punteada: proyección de tendencia (regresión lineal → 15 días adelante)

**Cálculo de regresión lineal (mínimos cuadrados):**
```js
// xs = días desde primer registro (0, 1, 2...), ys = pesos en kg
const n = points.length
const sumX = xs.reduce((a, b) => a + b, 0)
const sumY = ys.reduce((a, b) => a + b, 0)
const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0)
const sumX2 = xs.reduce((s, x) => s + x * x, 0)
const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
const intercept = (sumY - slope * sumX) / n
// proyección: intercept + slope * (x + 15)
```

**Badge de dirección:** "↓ Bajando X kg/semana" / "↑ Subiendo X kg/semana" / "→ Estable"
- Calculado como `slope * 7` (kg por semana)
- "Estable" si `Math.abs(slope * 7) < 0.1`

**Solo visible:** Con ≥ 3 puntos de datos de peso no nulos.

---

## Orden de implementación

1. SQL: agregar columna `peso_meta` a `diagnosticos`
2. `Diagnostico.jsx`: agregar pregunta `peso_meta`
3. `Progreso.jsx`: fetch de `diagnosticos` + calcular IMC
4. `Progreso.jsx`: barra de progreso hacia peso objetivo
5. `Progreso.jsx`: tendencia de peso (regresión lineal + línea punteada en chart)

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `src/pages/Diagnostico.jsx` | Agregar pregunta `peso_meta` al array PASOS y al objeto `datos` en `guardar()` |
| `src/pages/Progreso.jsx` | Fetch adicional + 3 nuevas métricas (IMC, progreso, tendencia) |
| Supabase SQL | `alter table diagnosticos add column peso_meta numeric` |
