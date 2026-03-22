# Fase 2 — Auth y Onboarding

**Fecha:** 2026-03-21
**Proyecto:** NutriiApp
**Alcance:** Corregir tres bugs críticos introducidos por el schema de Fase 1, agregar pantalla de Bienvenida y timeout de 60s en GenerandoPlan. Control de sesiones (tabla `dispositivos`) queda fuera de esta fase.

---

## Contexto del código existente

La mayoría de las pantallas de Fase 2 ya existen. El problema es que varios archivos asumen que `acepto_terminos` vive en `perfiles`, pero el schema de Fase 1 lo movió a `diagnosticos`. Esto rompió el flujo de onboarding.

**Estado actual de los archivos relevantes:**

| Archivo | Estado |
|---|---|
| `src/pages/Login.jsx` | ✅ Funciona sin cambios |
| `src/pages/Registro.jsx` | ✅ Funciona sin cambios |
| `src/pages/AuthCallback.jsx` | ✅ Funciona sin cambios |
| `src/pages/TerminosCondiciones.jsx` | ❌ Guarda `acepto_terminos` en `perfiles` — campo inexistente |
| `src/pages/Diagnostico.jsx` | ❌ Usa `usuario_id` en lugar de `perfil_id` en el insert |
| `src/pages/GenerandoPlan.jsx` | ⚠️ Funciona pero sin timeout de 60s |
| `src/App.jsx` | ❌ Ruta `/diagnostico` requiere `aceptoTerminos=true` — loop circular |
| `src/components/privateRoute.jsx` | ✅ Funciona sin cambios |

---

## Bloque 1 — Fixes críticos

### Fix 1: `src/pages/TerminosCondiciones.jsx`

**Problema:** La función `handleAceptar` llama a `actualizarPerfil({ acepto_terminos: true, acepto_terminos_at: ... })`, que intenta hacer un UPDATE en la tabla `perfiles`. El campo `acepto_terminos` no existe en `perfiles` (Fase 1 lo movió a `diagnosticos`). El RLS de `perfiles` además no permite campos arbitrarios.

**Solución:** Eliminar completamente la llamada a `actualizarPerfil`. El checkbox sigue siendo obligatorio (UX gate), pero el guardado real de `acepto_terminos` sucede cuando el diagnóstico se inserta en la tabla `diagnosticos` con `acepto_terminos: true` (ya implementado en `Diagnostico.jsx`).

**Cambio específico:**
```js
// ANTES
const handleAceptar = async () => {
    if (!aceptado) return;
    setLoading(true);
    await actualizarPerfil({
        acepto_terminos: true,
        acepto_terminos_at: new Date().toISOString(),
    });
    setLoading(false);
    navigate("/diagnostico", { replace: true });
};

// DESPUÉS
const handleAceptar = () => {
    if (!aceptado) return;
    navigate("/diagnostico", { replace: true });
};
```

**Imports, estado y JSX a modificar:**
- Eliminar `const [loading, setLoading] = useState(false)` — ya no se usa. El `useState` para `aceptado` (checkbox) debe conservarse.
- Eliminar `actualizarPerfil` del destructuring de `useAuth()`. `useAuth` era el único uso, así que eliminar también ese import.
- En el botón (línea 74-84): cambiar `disabled={!aceptado || loading}` → `disabled={!aceptado}` y el texto `{loading ? "Guardando…" : "Aceptar y continuar →"}` → `"Aceptar y continuar →"` (texto estático).

---

### Fix 2: `src/pages/Diagnostico.jsx`

**Problema:** El objeto `datos` que se inserta en `diagnosticos` usa `usuario_id: session.user.id`. El schema define esa columna como `perfil_id`. Además, varios campos del objeto no existen en el schema (`meta_personal`, `ocupacion`, `tipo_ejercicio`, `dias_ejercicio`, `comidas_por_dia`, `horario_primer_comida`, `horario_ultima_comida`, `preferencias_comida`, `alimentos_no_gustados`, `medicamentos`, `tiene_condicion_medica`, `respuestas_raw`). Insertarlos causará un error de Postgres.

**Solución:** Reestructurar el objeto `datos` para incluir solo los campos que existen en el schema, y mover los campos extra a `respuestas_raw` (jsonb). También eliminar la llamada `actualizarPerfil({ diagnostico_completado: true })` — el trigger `on_diagnostico_created` ya hace ese UPDATE automáticamente en Postgres.

**Campos válidos en `diagnosticos` (del schema de Fase 1):**
- `perfil_id`, `acepto_terminos`, `peso`, `estatura`, `edad`, `sexo`
- `objetivo`, `nivel_actividad`, `habitos_alimenticios`, `restricciones_medicas`
- `alergias` (text[]), `enfermedades` (text[]), `presupuesto_quincenal`

**Campos que van a `respuestas_raw` (jsonb):**
Todos los demás campos del formulario que no tienen columna en el schema.

> Nota: el schema no tiene columna `respuestas_raw`. Estos campos adicionales simplemente se omiten del insert directo. El objeto `respuestas` completo (incluyendo los campos extra como `tipo_ejercicio`, `dias_ejercicio`, `preferencias_comida`, etc.) se pasa sin cambios a la Edge Function via `navigate("/generando-plan", { state: { respuestas, tieneEnfermedad } })` — ese flujo ya existe y no cambia. Los mapeos `habitos_alimenticios: respuestas.preferencias_comida?.join(", ")` y `restricciones_medicas: respuestas.medicamentos` son intencionales: estas columnas en el schema son texto libre que sirve como resumen para el trigger/plan.

**Cambio específico — función `guardar`:**
```js
const guardar = async () => {
    setGuardando(true);
    const tieneEnfermedad =
        (respuestas.enfermedades ?? []).some((e) => e !== "ninguna");

    // Solo campos que existen en el schema de diagnosticos
    const datos = {
        perfil_id: session.user.id,          // era usuario_id — corregido
        acepto_terminos: true,
        peso: Number(respuestas.peso_kg) || null,
        estatura: Number(respuestas.estatura_cm) || null,
        edad: Number(respuestas.edad) || null,
        sexo: respuestas.sexo ?? null,
        objetivo: respuestas.objetivo ?? null,
        nivel_actividad: respuestas.nivel_actividad ?? null,
        habitos_alimenticios: respuestas.preferencias_comida?.join(", ") ?? null,
        restricciones_medicas: respuestas.medicamentos ?? null,
        alergias: respuestas.alergias ?? [],
        enfermedades: respuestas.enfermedades ?? [],
        presupuesto_quincenal: Number(respuestas.presupuesto_quincenal) || null,
    };

    const { error: dbError } = await supabase
        .from("diagnosticos")
        .insert(datos);

    if (dbError) {
        setError("Error al guardar. Intenta de nuevo.");
        setGuardando(false);
        return;
    }

    // NO llamar actualizarPerfil({ diagnostico_completado: true })
    // El trigger on_diagnostico_created lo hace automáticamente en Postgres.
    //
    // Sí necesitamos recargar el perfil para que el contexto refleje
    // diagnostico_completado=true y acepto_terminos=true ANTES de navegar.
    // IMPORTANTE: este await debe ir ANTES de navigate().
    // Si se invierte el orden, el PrivateRoute de /generando-plan puede
    // encontrar aceptoTerminos=false y redirigir a /terminos, rompiendo el flujo.
    //
    // recargarPerfil() llama cargarPerfil() internamente Y actualiza setPerfil()
    // para que el contexto refleje el nuevo estado sin logout/login.
    await recargarPerfil();

    navigate("/generando-plan", {
        replace: true,
        state: { respuestas, tieneEnfermedad },
    });
};
```

**Destructuring de `useAuth()` a actualizar en `Diagnostico.jsx`:**
El archivo actual tiene `const { session, actualizarPerfil } = useAuth()`. Cambiar a:
```js
const { session, recargarPerfil } = useAuth();
```
`actualizarPerfil` deja de usarse en este archivo — eliminarlo del destructuring.

---

### Fix 3: `src/App.jsx`

**Problema:** La ruta `/diagnostico` actualmente es:
```jsx
<PrivateRoute requireDiagnostico={false}>
  <Diagnostico />
</PrivateRoute>
```
`requireTerminos` no se pasa, por lo que toma su valor por defecto `true` en `PrivateRoute`. Con el nuevo schema, `aceptoTerminos` en el contexto es `false` hasta que se inserta el diagnóstico. Resultado: el usuario llega a `/terminos` → hace clic en "Aceptar" → navega a `/diagnostico` → `PrivateRoute` ve `aceptoTerminos=false` → redirige a `/terminos` → loop infinito.

> Este bug existe en el código actual. El código de "ANTES" de abajo es la versión viva en `App.jsx`.

**Solución:** Cambiar la ruta `/diagnostico` para pasar `requireTerminos={false}`:

```jsx
// ANTES
<Route path="/diagnostico" element={
  <PrivateRoute requireDiagnostico={false}>
    <Diagnostico />
  </PrivateRoute>
} />

// DESPUÉS
<Route path="/diagnostico" element={
  <PrivateRoute requireTerminos={false} requireDiagnostico={false}>
    <Diagnostico />
  </PrivateRoute>
} />
```

---

## Bloque 2 — Nuevas features

### Feature 1: `src/pages/Bienvenida.jsx` (nuevo archivo)

Pantalla de entrada para usuarios no autenticados. Componente puro, sin lógica de auth — la redirección la maneja `PublicOnlyRoute` en `App.jsx`.

**Contenido:**
- Logo "NutriiApp" (fuente Syne, verde `#3DDC84`)
- Tagline: "Tu plan nutricional personalizado con IA"
- Subtexto breve sobre el producto
- Botón primario: "Registrarme" → `/registro`
- Botón secundario: "Ya tengo cuenta" → `/login`

**Estilo:** Tailwind CSS (igual que `Diagnostico.jsx` y `TerminosCondiciones.jsx`). Dark theme consistente: `bg-[#0D1117]`, texto `text-white`/`text-[#7D8590]`, verde `#3DDC84`, fuente display `font-display` (Syne), body DM Sans.

---

### Feature 2: `src/App.jsx` — ruta `/`

**Cambio:**
```jsx
// ANTES
<Route path="/" element={<Navigate to="/panel" replace />} />

// DESPUÉS
<Route path="/" element={
  <PublicOnlyRoute><Bienvenida /></PublicOnlyRoute>
} />
```

`PublicOnlyRoute` ya maneja la redirección para usuarios con sesión activa (terminos → diagnostico → panel).

**Cambios explícitos en `App.jsx`:**
1. Agregar al bloque de imports: `import Bienvenida from "./pages/Bienvenida";`
2. Cambiar la ruta `/` como se muestra en el bloque ANTES/DESPUÉS de arriba.

---

### Feature 3: `src/pages/GenerandoPlan.jsx` — timeout de 60s

**Cambio en el fetch:**

El archivo actual tiene un `try/catch` externo que envuelve toda la función `generar` (líneas 42-71). El timeout reemplaza el `fetch` inline y el `catch` existente — no crea un try/catch anidado adicional. El nuevo `catch` reemplaza al actual `catch (err) { setError(...) }`.

```js
// ANTES (dentro del try existente, líneas 48-58)
const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-plan`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ respuestas, usuario_id: session.user.id }),
    }
);

if (!res.ok) throw new Error("Error al generar el plan");

// DESPUÉS — reemplaza el try/catch completo de generar() (líneas 42-71)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60_000);

try {
    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generar-plan`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ respuestas, usuario_id: session.user.id }),
            signal: controller.signal,
        }
    );
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Error al generar el plan");

    // Si el usuario tiene condición médica, mostrar aviso antes de redirigir
    if (tieneEnfermedad) {
        setMostrarAviso(true);
    } else {
        navigate("/panel", { replace: true });
    }
} catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
        setError("El plan tardó demasiado en generarse. Por favor intenta de nuevo.");
    } else {
        setError("No pudimos generar tu plan. Por favor intenta de nuevo.");
    }
}
```

---

## Fix menor: `recargarPerfil` en AuthContext

`cargarPerfil` es un loader puro — ejecuta queries y retorna datos pero no llama a `setPerfil`. Si `Diagnostico.jsx` llama `await cargarPerfil(session.user.id)` y descarta el valor de retorno, el estado del contexto no se actualiza, y `PrivateRoute` seguirá viendo `aceptoTerminos=false` y `completoDiagnostico=false`.

**Solución:** Agregar `recargarPerfil` en `AuthContext` que internamente llame a `cargarPerfil` + `setPerfil`:

```js
// Agregar dentro de AuthProvider, después de cargarPerfil
const recargarPerfil = async () => {
    if (!session?.user) return;
    const p = await cargarPerfil(session.user.id);
    if (p) setPerfil(p);
};
```

**Agregar al objeto `value`:**
```js
const value = {
    // ... existentes ...
    recargarPerfil,  // agregar esta línea
};
```

`Diagnostico.jsx` usará `recargarPerfil` en lugar de `cargarPerfil`:
```js
// En el destructuring de useAuth():
const { session, recargarPerfil } = useAuth();

// En la función guardar(), antes de navigate():
await recargarPerfil();
```

Nota: `session.user.id` ya no es necesario como argumento — `recargarPerfil` lo lee internamente desde `session`.

---

## Flujo resultante (post-fixes)

```
/ (no sesión) → Bienvenida
  → /registro → email confirmation o sesión inmediata
  → /login → sesión
    → /terminos (checkbox, sin DB write)
      → /diagnostico (requireTerminos=false, requireDiagnostico=false)
        → insert en diagnosticos (perfil_id, acepto_terminos=true, ...)
        → trigger Postgres: perfiles.diagnostico_completado = true
        → recargarPerfil() recarga el contexto (cargarPerfil + setPerfil)
        → /generando-plan (60s timeout)
          → si enfermedades: aviso médico → /panel
          → si no: /panel
```

---

## Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `src/pages/TerminosCondiciones.jsx` | Fix: eliminar `actualizarPerfil`, simplificar `handleAceptar` |
| `src/pages/Diagnostico.jsx` | Fix: `usuario_id` → `perfil_id`, remover campos extra, remover `actualizarPerfil`, agregar `recargarPerfil` |
| `src/App.jsx` | Fix + feature: `requireTerminos={false}` en `/diagnostico`, ruta `/` → Bienvenida |
| `src/pages/GenerandoPlan.jsx` | Feature: timeout de 60s con AbortController |
| `src/pages/Bienvenida.jsx` | Feature: nueva página (crear) |
| `src/context/AuthContext.jsx` | Fix: agregar `recargarPerfil` (loader + setState) y exponerlo en `value` |
