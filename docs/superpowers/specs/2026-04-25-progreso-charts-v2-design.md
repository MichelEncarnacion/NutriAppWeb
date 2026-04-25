# Progreso — Charts V2 Design Spec
**Fecha:** 2026-04-25
**Objetivo:** Reemplazar gráficos básicos por visualizaciones más ricas e impactantes en la página de Progreso

---

## Contexto

`Progreso.jsx` actualmente muestra:
- Stat pills (peso, % grasa, % músculo)
- Card de IMC (número + badge texto)
- LineChart normalizado (3 series % cambio desde baseline) — confuso
- Barra de progreso hacia meta
- LineChart de tendencia de peso con proyección punteada
- Historial de registros

Este spec reemplaza/mejora los elementos visuales con gráficos de mayor impacto usando Recharts (ya instalado).

---

## Cambios

### 1. IMC Card → IMC Gauge (RadialBarChart)

**Reemplaza:** card simple con número grande + badge texto  
**Por:** gauge circular con zonas de color OMS

**Implementación:** `RadialBarChart` de Recharts con un único `RadialBar`. El arco va de -210° a 30° (semicírculo inferior abierto). Se mapea el rango IMC 15–40 al arco completo.

**Zonas de color en el track (SVG estático debajo del RadialBar):**
- `< 18.5` → `#58A6FF` (Bajo peso)
- `18.5–24.9` → `#3DDC84` (Normal)
- `25–29.9` → `#F0A500` (Sobrepeso)
- `≥ 30` → `#FF6B6B` (Obesidad)

**Centro del gauge:** valor numérico del IMC en grande + label de clasificación con color correspondiente.

**Layout:** IMC gauge y Radar chart colocados **lado a lado** (flex row, cada uno `flex:1`), ambos en cards de la misma altura.

---

### 2. Radar Chart (nuevo)

**Título:** SALUD GLOBAL  
**Componente Recharts:** `RadarChart` + `Radar` + `PolarGrid` + `PolarAngleAxis`

**4 dimensiones** (valores normalizados 0–100 para que el radar sea equitativo):

| Dimensión | Cálculo | Dirección |
|---|---|---|
| IMC | `Math.max(0, Math.min(100, (1 - Math.abs(imc - 22) / 15) * 100))` — máximo en 22 (centro normal) | Mayor = mejor |
| Músculo | `Math.min(100, (porcentaje_musculo / 50) * 100)` — 50% músculo = 100 pts | Mayor = mejor |
| Grasa | `Math.max(0, 100 - (porcentaje_grasa / 35) * 100)` — 0% grasa = 100, 35% = 0 | Mayor = mejor (grasa baja) |
| Meta | `pesoProgreso?.pct ?? 0` — % completado hacia peso objetivo | Mayor = mejor |

**Estado vacío:** si `imc === null` Y no hay datos de composición, no renderizar el radar.  
**Datos parciales:** dimensiones sin datos usan valor 0.

**Colores:** fill `rgba(61,220,132,0.2)`, stroke `#3DDC84`, stroke-width 2.

---

### 3. LineChart normalizado → BarChart apilado de composición

**Reemplaza:** `LineChart` con 3 líneas normalizadas (% cambio desde baseline)  
**Por:** `BarChart` apilado mostrando `porcentaje_grasa` y `porcentaje_musculo` reales por fecha

**Componentes Recharts:** `BarChart` + `Bar` (2x, stacked) + `XAxis` + `Tooltip` + `ResponsiveContainer`

**Datos:** `metricas` en orden cronológico (oldest first), solo registros con al menos `porcentaje_grasa` o `porcentaje_musculo` no nulo.

**Condición de visibilidad:** ≥ 2 registros con datos de composición.

**Colores:**
- `porcentaje_grasa` → `#FF6B6B`
- `porcentaje_musculo` → `#58A6FF`

**Stackid:** `"composicion"` en ambas barras para que se apilen.

**Tooltip:** muestra fecha, grasa (%), músculo (%).

**Último registro:** borde superior verde `#3DDC84` de 2px para indicar "actual" (via `Cell` en Recharts o un `ReferenceLine`).

**Leyenda:** fila de dots con color + label encima del chart (igual que la leyenda actual del LineChart).

---

### 4. LineChart de peso → AreaChart con gradiente

**Reemplaza:** `LineChart` actual para tendencia de peso  
**Por:** `AreaChart` con área rellena con gradiente verde

**Componentes Recharts:** `AreaChart` + `Area` + `XAxis` + `Tooltip` + `ResponsiveContainer`

**Gradiente:**
```jsx
<defs>
  <linearGradient id="gradientPeso" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#3DDC84" stopOpacity={0.35} />
    <stop offset="95%" stopColor="#3DDC84" stopOpacity={0.02} />
  </linearGradient>
</defs>
```

**Area de peso real:** `fill="url(#gradientPeso)"`, `stroke="#3DDC84"`, `strokeWidth={2}`, `dot={false}`

**Línea de proyección:** mantener como `Line` separado (punteado, `strokeDasharray="5 5"`) — no puede ser Area porque solo tiene 2 puntos (último real + futuro).

**Condición de visibilidad:** ≥ 3 registros con peso (sin cambio respecto al actual).

**Badge de tendencia:** se mantiene igual ("↓ Bajando X kg/semana", etc.).

---

## Nuevos imports de Recharts

```js
import {
    ResponsiveContainer,
    AreaChart, Area,
    BarChart, Bar,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis,
    Tooltip,
    Cell,
} from "recharts";
```

`RadialBarChart` / `RadialBar` **NO** se usa — el gauge de IMC se implementa con SVG puro (más control sobre zonas de color y aguja).

---

## Orden visual en la página

1. Header
2. Loading skeleton / empty state
3. *(Con datos)*
   1. Stat pills (sin cambio)
   2. **[NUEVO]** Fila: IMC Gauge SVG + Radar chart (lado a lado)
   3. **[NUEVO]** BarChart apilado composición (reemplaza LineChart normalizado)
   4. Barra de progreso hacia meta / CTA diagnóstico (sin cambio)
   5. **[UPGRADE]** AreaChart tendencia de peso (reemplaza LineChart)
4. Historial (sin cambio)

---

## Archivos afectados

| Archivo | Acción |
|---|---|
| `src/pages/Progreso.jsx` | Reemplazar IMC card + LineChart normalizado + LineChart peso. Agregar Radar. Nuevos imports Recharts. |

---

## Estado vacío por componente

| Componente | Condición de render |
|---|---|
| Stat pills | `ultima !== null` |
| IMC Gauge | `imc !== null` |
| Radar | `imc !== null` O hay datos de composición |
| BarChart composición | ≥ 2 registros con grasa o músculo |
| AreaChart peso | ≥ 3 registros con peso |
| Barra de progreso | `diag.peso_meta` existe |
