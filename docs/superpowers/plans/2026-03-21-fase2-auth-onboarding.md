# Fase 2 — Auth y Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir tres bugs críticos en el flujo de onboarding causados por el schema de Fase 1, agregar la pantalla de Bienvenida y un timeout de 60s en GenerandoPlan.

**Architecture:** Todos los cambios son en frontend. No hay nuevas rutas de API. El flujo correcto es: `/` → Bienvenida (no autenticado) → `/registro` o `/login` → `/terminos` (checkbox sin DB write) → `/diagnostico` (insert en `diagnosticos` + `recargarPerfil()` + navigate) → `/generando-plan` (AbortController 60s) → `/panel`. El trigger Postgres `on_diagnostico_created` actualiza `perfiles.diagnostico_completado` automáticamente.

**Tech Stack:** React 19, React Router v7, Supabase JS client, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-21-fase2-auth-onboarding-design.md`

---

## File Map

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/context/AuthContext.jsx` | Modify (lines 38-140) | Agregar `recargarPerfil` function + exponer en `value` |
| `src/pages/TerminosCondiciones.jsx` | Modify | Eliminar `loading`, `actualizarPerfil`; simplificar `handleAceptar`; actualizar JSX botón |
| `src/pages/Diagnostico.jsx` | Modify (lines 319, 364-416) | Destructuring `useAuth`, función `guardar` completa |
| `src/pages/Bienvenida.jsx` | Create | Nueva pantalla de bienvenida |
| `src/App.jsx` | Modify (lines 37, 56-60) | Ruta `/` → Bienvenida; `/diagnostico` + `requireTerminos={false}`; import Bienvenida |
| `src/pages/GenerandoPlan.jsx` | Modify (lines 41-73) | Reemplazar función `generar()` completa con AbortController 60s |

---

## Task 1: AuthContext — agregar `recargarPerfil`

**Files:**
- Modify: `src/context/AuthContext.jsx:38-140`

**Contexto crítico:** `cargarPerfil` es un loader puro — retorna datos pero no llama a `setPerfil`. Si `Diagnostico.jsx` llama `cargarPerfil` y descarta el resultado, el contexto queda desactualizado y `PrivateRoute` sigue viendo `aceptoTerminos=false`. La solución es `recargarPerfil` que llama a ambas.

- [ ] **Step 1: Abrir `src/context/AuthContext.jsx` y ubicar la función `cargarPerfil` (línea 13)**

  La función termina con su `};` en la línea 38. La última línea de datos dentro de la función es la línea 36: `acepto_terminos: diagData?.acepto_terminos ?? false,`. La línea 38 es el `};` de cierre del return object + función.

- [ ] **Step 2: Agregar `recargarPerfil` inmediatamente después del `};` de `cargarPerfil` (línea 38), antes del `useEffect` (línea 40)**

  ```js
  const recargarPerfil = async () => {
      if (!session?.user) return;
      const p = await cargarPerfil(session.user.id);
      if (p) setPerfil(p);
  };
  ```

- [ ] **Step 3: Agregar `recargarPerfil` al objeto `value` (línea ~124)**

  El objeto `value` actual termina con `cargarPerfil,`. Agregar `recargarPerfil` en la siguiente línea:

  ```js
  const value = {
      session,
      perfil,
      loading,
      rol,
      esPremium,
      esAdmin,
      aceptoTerminos,
      completoDiagnostico,
      loginConEmail,
      loginConGoogle,
      loginConFacebook,
      registrar,
      cerrarSesion,
      actualizarPerfil,
      cargarPerfil,
      recargarPerfil,   // ← agregar esta línea
  };
  ```

- [ ] **Step 4: Verificar el archivo con lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores en `AuthContext.jsx`.

- [ ] **Step 5: Commit**

  ```bash
  git add src/context/AuthContext.jsx
  git commit -m "feat: add recargarPerfil to AuthContext — loads profile and updates context state"
  ```

---

## Task 2: Fix TerminosCondiciones.jsx

**Files:**
- Modify: `src/pages/TerminosCondiciones.jsx`

**Problema:** `handleAceptar` llama a `actualizarPerfil({ acepto_terminos: true, ... })` que hace UPDATE en `perfiles`. El campo `acepto_terminos` no existe en `perfiles` (vive en `diagnosticos`). La llamada falla silenciosamente o lanza error de RLS.

- [ ] **Step 1: Eliminar el estado `loading` (línea 10)**

  Eliminar esta línea:
  ```js
  const [loading, setLoading] = useState(false);
  ```
  El estado `aceptado` en línea 9 se conserva.

- [ ] **Step 2: Eliminar el import de `useAuth` y el destructuring de `actualizarPerfil` (líneas 4 y 7)**

  Eliminar:
  ```js
  import { useAuth } from "../hooks/useAuth";
  ```
  y
  ```js
  const { actualizarPerfil } = useAuth();
  ```

  `useAuth` no se usa en ninguna otra parte de este archivo.

- [ ] **Step 3: Reemplazar la función `handleAceptar` (líneas 12-21)**

  Reemplazar:
  ```js
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
  ```

  Con:
  ```js
  const handleAceptar = () => {
      if (!aceptado) return;
      navigate("/diagnostico", { replace: true });
  };
  ```

- [ ] **Step 4: Actualizar el botón JSX (línea 76 y 83)**

  Cambiar `disabled={!aceptado || loading}` → `disabled={!aceptado}`:
  ```jsx
  <button
      onClick={handleAceptar}
      disabled={!aceptado}
      className={`w-full py-3 rounded-xl font-bold font-display text-sm tracking-wide transition-all
    ${aceptado
                  ? "bg-[#3DDC84] text-black hover:bg-[#5EF0A0] cursor-pointer"
                  : "bg-[#1C2330] text-[#7D8590] cursor-not-allowed border border-[#2D3748]"
              }`}
  >
      Aceptar y continuar →
  </button>
  ```

  (El texto era `{loading ? "Guardando…" : "Aceptar y continuar →"}` — ahora es texto estático.)

- [ ] **Step 5: Verificar lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores. Verificar especialmente que no queden referencias a `loading` o `actualizarPerfil`.

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/TerminosCondiciones.jsx
  git commit -m "fix: remove actualizarPerfil call from TerminosCondiciones — acepto_terminos lives in diagnosticos"
  ```

---

## Task 3: Fix Diagnostico.jsx

**Files:**
- Modify: `src/pages/Diagnostico.jsx:319`, `src/pages/Diagnostico.jsx:364-416`

**Problema:** La función `guardar` usa `usuario_id` (no existe en schema — el campo es `perfil_id`), inserta campos inexistentes en el schema (`meta_personal`, `ocupacion`, `tipo_ejercicio`, `dias_ejercicio`, etc.), y llama `actualizarPerfil({ diagnostico_completado: true })` cuando el trigger Postgres ya lo hace. Además, `cargarPerfil` se llama pero no actualiza el contexto.

**Campos válidos en `diagnosticos`:** `perfil_id`, `acepto_terminos`, `peso`, `estatura`, `edad`, `sexo`, `objetivo`, `nivel_actividad`, `habitos_alimenticios`, `restricciones_medicas`, `alergias` (text[]), `enfermedades` (text[]), `presupuesto_quincenal`.

- [ ] **Step 1: Actualizar el destructuring de `useAuth()` en línea 319**

  Cambiar:
  ```js
  const { session, actualizarPerfil } = useAuth();
  ```

  Por:
  ```js
  const { session, recargarPerfil } = useAuth();
  ```

- [ ] **Step 2: Reemplazar la función `guardar` completa (líneas 364-416)**

  Reemplazar todo el bloque `const guardar = async () => { ... }` (líneas 364-416) con:

  ```js
  const guardar = async () => {
      setGuardando(true);
      const tieneEnfermedad =
          (respuestas.enfermedades ?? []).some((e) => e !== "ninguna");

      // Solo campos que existen en el schema de diagnosticos.
      // Los demás campos del formulario (meta_personal, ocupacion, tipo_ejercicio, etc.)
      // se pasan completos a la Edge Function via navigate state.
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
      // recargarPerfil() llama cargarPerfil() + setPerfil() para que el contexto
      // refleje diagnostico_completado=true y acepto_terminos=true.
      // CRÍTICO: este await debe ir ANTES de navigate().
      // Si se invierte el orden, PrivateRoute de /generando-plan ve
      // aceptoTerminos=false y redirige a /terminos (loop infinito).
      await recargarPerfil();

      navigate("/generando-plan", {
          replace: true,
          state: { respuestas, tieneEnfermedad },
      });
  };
  ```

- [ ] **Step 3: Verificar lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores. Confirmar que no quedan referencias a `actualizarPerfil` o `cargarPerfil` en el archivo.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/Diagnostico.jsx
  git commit -m "fix: Diagnostico.jsx — usuario_id->perfil_id, strip non-schema fields, use recargarPerfil before navigate"
  ```

---

## Task 4: Crear Bienvenida.jsx

**Files:**
- Create: `src/pages/Bienvenida.jsx`

**Contexto:** Pantalla de entrada para usuarios no autenticados. Componente puro sin lógica de auth — la redirección la maneja `PublicOnlyRoute` en `App.jsx`. Estilo: dark theme consistente con el resto de la app.

- [ ] **Step 1: Crear `src/pages/Bienvenida.jsx`**

  ```jsx
  // src/pages/Bienvenida.jsx
  import { useNavigate } from "react-router-dom";

  export default function Bienvenida() {
      const navigate = useNavigate();

      return (
          <div className="min-h-screen bg-[#0D1117] flex flex-col items-center justify-center px-4 font-sans">
              <div className="w-full max-w-sm flex flex-col items-center gap-8 text-center">

                  {/* Logo */}
                  <div className="flex flex-col items-center gap-2">
                      <span className="text-[#3DDC84] font-black text-4xl font-display tracking-tight">
                          NutriiApp
                      </span>
                      <p className="text-white text-lg font-semibold font-display leading-snug">
                          Tu plan nutricional personalizado con IA
                      </p>
                  </div>

                  {/* Subtexto */}
                  <p className="text-[#7D8590] text-sm leading-relaxed">
                      Responde 24 preguntas, obtén un plan de 15 días diseñado
                      específicamente para ti. Sin dietas genéricas.
                  </p>

                  {/* Botones */}
                  <div className="w-full flex flex-col gap-3">
                      <button
                          onClick={() => navigate("/registro")}
                          className="w-full py-3.5 bg-[#3DDC84] text-black font-bold font-display rounded-xl hover:bg-[#5EF0A0] transition-all text-sm tracking-wide"
                      >
                          Registrarme
                      </button>
                      <button
                          onClick={() => navigate("/login")}
                          className="w-full py-3.5 border border-[#2D3748] text-[#E6EDF3] font-semibold font-display rounded-xl hover:border-[#3DDC84] hover:text-white transition-all text-sm"
                      >
                          Ya tengo cuenta
                      </button>
                  </div>

              </div>
          </div>
      );
  }
  ```

- [ ] **Step 2: Verificar lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/Bienvenida.jsx
  git commit -m "feat: add Bienvenida.jsx — welcome screen for unauthenticated users"
  ```

---

## Task 5: Fix + Feature App.jsx

**Files:**
- Modify: `src/App.jsx:2-14` (imports), `src/App.jsx:37`, `src/App.jsx:56-60`

**Dos cambios:**
1. **Fix:** Ruta `/diagnostico` no pasa `requireTerminos={false}` → loop circular
2. **Feature:** Ruta `/` ahora sirve `Bienvenida` envuelta en `PublicOnlyRoute`

- [ ] **Step 1: Agregar import de `Bienvenida` en el bloque de imports de onboarding (línea 13)**

  Después de la línea `import Diagnostico from "./pages/Diagnostico";`, agregar:

  ```js
  import Bienvenida from "./pages/Bienvenida";
  ```

  El bloque de onboarding queda:
  ```js
  // ── Páginas de onboarding ────────────────────────────────────────────────
  import Diagnostico from "./pages/Diagnostico";
  import GenerandoPlan from "./pages/GenerandoPlan";
  import Bienvenida from "./pages/Bienvenida";
  ```

- [ ] **Step 2: Cambiar la ruta raíz `/` (línea 37)**

  Cambiar:
  ```jsx
  <Route path="/" element={<Navigate to="/panel" replace />} />
  ```

  Por:
  ```jsx
  <Route path="/" element={
    <PublicOnlyRoute><Bienvenida /></PublicOnlyRoute>
  } />
  ```

  `PublicOnlyRoute` ya maneja redirección para usuarios autenticados (terminos → diagnostico → panel). No requiere cambios en `privateRoute.jsx`.

- [ ] **Step 3: Agregar `requireTerminos={false}` en la ruta `/diagnostico` (líneas 56-60)**

  Cambiar:
  ```jsx
  <Route path="/diagnostico" element={
    <PrivateRoute requireDiagnostico={false}>
      <Diagnostico />
    </PrivateRoute>
  } />
  ```

  Por:
  ```jsx
  <Route path="/diagnostico" element={
    <PrivateRoute requireTerminos={false} requireDiagnostico={false}>
      <Diagnostico />
    </PrivateRoute>
  } />
  ```

  **Por qué:** Sin este prop, `PrivateRoute` toma `requireTerminos=true` por defecto. Como `aceptoTerminos=false` en el contexto hasta que se inserta el diagnóstico, el usuario queda atrapado en `/terminos` → `/diagnostico` → `/terminos` (loop infinito).

- [ ] **Step 4: Verificar lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores. Verificar que `Navigate` siga importado (aún lo usa el catch-all `path="*"`).

- [ ] **Step 5: Commit**

  ```bash
  git add src/App.jsx
  git commit -m "fix+feat: App.jsx — requireTerminos=false on /diagnostico, / → Bienvenida with PublicOnlyRoute"
  ```

---

## Task 6: Feature GenerandoPlan.jsx — timeout 60s

**Files:**
- Modify: `src/pages/GenerandoPlan.jsx:41-73`

**Cambio:** La función `generar` completa (líneas 41-71, más la llamada en línea 73) se reemplaza. Solo el `useEffect` wrapper y sus dependencias se conservan. El nuevo código agrega `AbortController` con timeout de 60s.

- [ ] **Step 1: Localizar la función `generar` en `src/pages/GenerandoPlan.jsx`**

  Encontrar estas líneas (41-73 aproximadamente):
  ```js
  const generar = async () => {
      try {
          // Obtiene el token JWT del usuario...
          ...
      } catch (err) {
          setError("No pudimos generar tu plan. Por favor intenta de nuevo.");
      }
  };

  generar();
  ```

  La función entera (desde `const generar` hasta el `};` de cierre, más la línea `generar();`) es lo que se reemplaza. El `useEffect(() => {`, el `if (!respuestas) { ... }` anterior, y el `}, []);` de cierre NO se tocan.

- [ ] **Step 2: Reemplazar la función `generar` completa (líneas 41-73) con:**

  ```js
  const generar = async () => {
      // Obtiene el token JWT del usuario para autenticar la llamada
      const { data: { session: s } } = await supabase.auth.getSession();
      const token = s?.access_token;

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
  };

  generar();
  ```

- [ ] **Step 2: Verificar lint**

  ```bash
  npm run lint
  ```

  Expected: sin errores.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/GenerandoPlan.jsx
  git commit -m "feat: add 60s AbortController timeout to GenerandoPlan fetch"
  ```

---

## Verificación manual del flujo completo

Después de los 6 tasks, ejecutar el servidor de desarrollo y verificar el flujo end-to-end:

```bash
npm run dev
```

**Checklist de verificación:**

- [ ] `http://localhost:5173/` → muestra pantalla Bienvenida (no redirige a `/panel`)
- [ ] Click "Ya tengo cuenta" → navega a `/login`
- [ ] Login con usuario que NO ha completado diagnóstico → redirige a `/terminos`
- [ ] En `/terminos`: checkbox deshabilitado al inicio, habilitado al marcar → click "Aceptar y continuar →" navega a `/diagnostico` sin error de red
- [ ] En `/diagnostico`: completar 24 preguntas → click "Generar mi plan nutricional" → navega a `/generando-plan`
- [ ] `/generando-plan` muestra spinner → si la Edge Function no existe, muestra error "No pudimos generar tu plan" (no loop)
- [ ] Usuario con sesión activa visitando `/` → redirige correctamente según su estado (terminos/diagnostico/panel)

---

## Notas para el implementador

**Sobre el schema de `diagnosticos`:** Los campos `alergias` y `enfermedades` son `text[]` en Postgres. Siempre enviar arrays (nunca `null`). El campo `alergias` en el schema es `text nullable` según el spec original, pero el código lo trata como array — verificar en Supabase si hay discrepancia.

**Sobre `recargarPerfil`:** La función usa `session` del closure en `AuthContext`. Si `session` es `null` al momento de llamarla, retorna sin hacer nada. Esto es safe — no debería ocurrir en el flujo normal (el usuario tiene sesión activa).

**Sobre la Edge Function `generar-plan`:** No existe aún (Fase posterior). El error `res.ok = false` o el AbortError serán el comportamiento esperado durante desarrollo. El mensaje de error "No pudimos generar tu plan" es correcto en este contexto.
