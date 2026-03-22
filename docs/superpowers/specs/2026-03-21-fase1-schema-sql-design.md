# Fase 1 — Schema SQL y RLS en Supabase

**Fecha:** 2026-03-21
**Proyecto:** NutriiApp
**Alcance:** Definición completa de tablas, enums, índices, políticas RLS y trigger de sincronización para Supabase. No incluye Edge Functions de admin JWT (fase posterior).

---

## Decisiones clave

| Decisión | Elección |
|---|---|
| `acepto_terminos` | Solo en `diagnosticos`. El `AuthContext.jsx` se actualiza en Fase 1 para leerlo via join/query adicional. |
| Admins | Solo en tabla `administradores`, identificados por JWT claim `role: 'admin'` |
| Restricción freemium en `metricas` | Doble capa: RLS en Supabase (SELECT e INSERT) + control en frontend |
| Restricción freemium en `planes` | RLS bloquea INSERT si el usuario ya tiene un plan en el mes actual |
| Estructura de archivos | 4 archivos separados: enums, tablas, índices, RLS |
| Edge Function para JWT claim admin | Fuera del alcance de Fase 1 |

---

## Archivos a generar

```
docs/
  fase1/
    01_enums.sql
    02_tablas.sql
    03_indices.sql
    04_rls.sql
```

---

## Sección 1 — Enums

```sql
CREATE TYPE tipo_usuario_enum AS ENUM ('freemium', 'demo', 'premium');
CREATE TYPE estado_plan_enum AS ENUM ('generando', 'listo', 'error');
CREATE TYPE fuente_datos_enum AS ENUM ('manual', 'healthkit', 'google_fit', 'nutriipoint_qr');
CREATE TYPE estado_leccion_enum AS ENUM ('bloqueada', 'disponible', 'en_progreso', 'completada');
CREATE TYPE tipo_notificacion_enum AS ENUM ('comida', 'leccion', 'seguimiento', 'masiva', 'sistema');
```

---

## Sección 2 — Tablas

### `perfiles`
- `id` uuid PK (FK → auth.users.id)
- `nombre` text
- `email` text
- `avatar_url` text nullable
- `tipo_usuario` tipo_usuario_enum DEFAULT 'freemium'
- `diagnostico_completado` boolean DEFAULT false
- `fecha_registro` timestamptz DEFAULT now()
- `fecha_expiracion_demo` timestamptz nullable
- `updated_at` timestamptz

> `acepto_terminos` NO está en esta tabla. Vive en `diagnosticos`.
> `diagnostico_completado` sí está aquí para que el `AuthContext` no necesite query adicional al cargar sesión.

**Trigger:** Al hacer INSERT en `auth.users`, crear automáticamente una fila en `perfiles` con `id = NEW.id`, `email = NEW.email`, `fecha_registro = now()`.

**Trigger:** Al hacer INSERT en `diagnosticos` con `acepto_terminos = true`, hacer UPDATE en `perfiles SET diagnostico_completado = true WHERE id = NEW.perfil_id`.

### `administradores`
- `id` uuid PK DEFAULT gen_random_uuid()
- `nombre` text NOT NULL
- `email` text UNIQUE NOT NULL
- `rol` text DEFAULT 'admin'
- `created_at` timestamptz DEFAULT now()

### `diagnosticos`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid FK → perfiles.id ON DELETE CASCADE
- `acepto_terminos` boolean NOT NULL CHECK (acepto_terminos = true)
- `peso` numeric nullable
- `estatura` numeric nullable
- `edad` int nullable
- `sexo` text nullable
- `objetivo` text nullable
- `nivel_actividad` text nullable
- `habitos_alimenticios` text nullable
- `restricciones_medicas` text nullable
- `alergias` text nullable
- `enfermedades` text[] DEFAULT '{}'
- `presupuesto_quincenal` numeric nullable
- `created_at` timestamptz DEFAULT now()

### `planes`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid FK → perfiles.id ON DELETE CASCADE
- `contenido_json` jsonb nullable
- `prompt_enviado` text nullable
- `respuesta_ia` text nullable
- `estado` estado_plan_enum DEFAULT 'generando'
- `fecha_inicio` date nullable
- `fecha_fin` date nullable
- `es_activo` boolean DEFAULT true
- `created_at` timestamptz DEFAULT now()

### `seguimientos`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid NOT NULL FK → perfiles.id ON DELETE CASCADE
- `peso_actual` numeric nullable
- `porcentaje_grasa` numeric nullable
- `satisfaccion_plan` int CHECK (satisfaccion_plan BETWEEN 1 AND 5)
- `platillos_favoritos` text[] DEFAULT '{}'
- `platillos_no_gustados` text[] DEFAULT '{}'
- `cambios_actividad` text nullable
- `cambios_salud` text nullable
- `fuente_datos` fuente_datos_enum DEFAULT 'manual'
- `created_at` timestamptz DEFAULT now()

### `metricas`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid NOT NULL FK → perfiles.id ON DELETE CASCADE
- `fecha` date NOT NULL
- `peso` numeric nullable
- `porcentaje_grasa` numeric nullable
- `porcentaje_musculo` numeric nullable
- `calorias_consumidas` numeric nullable
- `agua_ml` int nullable
- `comidas_completadas` int DEFAULT 0
- `created_at` timestamptz DEFAULT now()

### `lecciones`
- `id` uuid PK DEFAULT gen_random_uuid()
- `titulo` text NOT NULL
- `contenido` text NOT NULL
- `orden` int NOT NULL
- `activa` boolean DEFAULT true
- `created_at` timestamptz DEFAULT now()

### `lecciones_usuario`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid FK → perfiles.id ON DELETE CASCADE
- `leccion_id` uuid FK → lecciones.id ON DELETE CASCADE
- `estado` estado_leccion_enum DEFAULT 'bloqueada'
- `fecha_completada` timestamptz nullable
- `fecha_disponible` timestamptz nullable
- UNIQUE (`perfil_id`, `leccion_id`)

### `dispositivos`
- `id` uuid PK DEFAULT gen_random_uuid()
- `perfil_id` uuid FK → perfiles.id ON DELETE CASCADE
- `device_id` text NOT NULL
- `token_fcm` text nullable
- `ultima_sesion` timestamptz DEFAULT now()
- `activo` boolean DEFAULT true
- UNIQUE (`perfil_id`, `device_id`)

### `notificaciones`
- `id` uuid PK DEFAULT gen_random_uuid()
- `titulo` text NOT NULL
- `cuerpo` text NOT NULL
- `tipo` tipo_notificacion_enum NOT NULL
- `destinatario_id` uuid FK nullable → perfiles.id
- `segmento` text nullable
- `enviada_at` timestamptz DEFAULT now()
- `leida` boolean DEFAULT false

### `invitaciones_demo`
- `id` uuid PK DEFAULT gen_random_uuid()
- `codigo` text UNIQUE NOT NULL
- `usado_por` uuid FK nullable → perfiles.id
- `creado_por` uuid FK → administradores.id
- `fecha_uso` timestamptz nullable
- `activo` boolean DEFAULT true
- `created_at` timestamptz DEFAULT now()

---

## Sección 3 — Índices

| Tabla | Columna(s) indexadas |
|---|---|
| `perfiles` | `tipo_usuario` |
| `diagnosticos` | `perfil_id` |
| `planes` | `perfil_id`, `es_activo`, `estado` |
| `seguimientos` | `perfil_id`, `created_at` |
| `metricas` | `perfil_id`, `fecha` |
| `lecciones_usuario` | `perfil_id`, `leccion_id`, `estado` |
| `dispositivos` | `perfil_id`, `device_id`, `activo` |
| `notificaciones` | `destinatario_id`, `enviada_at` |
| `invitaciones_demo` | `usado_por` |

---

## Sección 4 — Políticas RLS

### Principio general
- RLS habilitado en **todas** las tablas
- Sin acceso anónimo
- Dos grupos de políticas: usuarios regulares (`auth.uid()`) y admins (JWT claim `role = 'admin'`)

### Usuarios regulares

| Tabla | Operación | Condición USING / WITH CHECK |
|---|---|---|
| `perfiles` | INSERT | WITH CHECK: `id = auth.uid()` |
| `perfiles` | SELECT, UPDATE | `id = auth.uid()` |
| `diagnosticos` | SELECT, INSERT, UPDATE | `perfil_id = auth.uid()` |
| `planes` | SELECT | `perfil_id = auth.uid()` |
| `planes` | INSERT | `perfil_id = auth.uid()` + `check_planes_freemium_limit(auth.uid()) = true` (ver nota abajo) |
| `seguimientos` | SELECT, INSERT | `perfil_id = auth.uid()` |
| `metricas` | SELECT | `perfil_id = auth.uid()` + subquery verifica `tipo_usuario IN ('premium', 'demo')` en `perfiles` |
| `metricas` | INSERT | `perfil_id = auth.uid()` + subquery verifica `tipo_usuario IN ('premium', 'demo')` en `perfiles` |
| `lecciones` | SELECT | `activa = true` |
| `lecciones_usuario` | SELECT, INSERT, UPDATE | `perfil_id = auth.uid()` |
| `dispositivos` | SELECT, INSERT, UPDATE | `perfil_id = auth.uid()` |
| `notificaciones` | SELECT | `destinatario_id = auth.uid()` |
| `notificaciones` | UPDATE | `destinatario_id = auth.uid()` — solo para marcar `leida = true` |
| `invitaciones_demo` | UPDATE | USING: `usado_por IS NULL AND activo = true` / WITH CHECK: `usado_por = auth.uid()` |

> **Nota `invitaciones_demo`:** Al momento del canje, `usado_por` es NULL. La política USING permite la operación solo si el código aún no está usado (`usado_por IS NULL`) y está activo. WITH CHECK garantiza que el UPDATE solo puede asignar `usado_por = auth.uid()`.

### Admins (JWT claim `(auth.jwt() ->> 'role') = 'admin'`)

| Tabla | Operación |
|---|---|
| Todas las tablas | SELECT |
| `administradores` | INSERT, UPDATE, DELETE |
| `lecciones` | INSERT, UPDATE, DELETE |
| `invitaciones_demo` | INSERT, UPDATE |
| `notificaciones` | INSERT |
| `perfiles` | UPDATE (para cambiar `tipo_usuario`) |
| `planes` | UPDATE (regeneración con log — implementado en fase posterior) |

---

## Notas de implementación

- **Trigger de perfiles:** Crear función `handle_new_user()` + trigger `on_auth_user_created` AFTER INSERT ON `auth.users` que inserte en `perfiles` con `id = NEW.id`, `email = NEW.email`.

- **Trigger de diagnóstico:** Crear función `handle_diagnostico_insert()` + trigger `on_diagnostico_created` AFTER INSERT ON `diagnosticos` que haga `UPDATE perfiles SET diagnostico_completado = true WHERE id = NEW.perfil_id`. El constraint `CHECK (acepto_terminos = true)` garantiza que el trigger solo dispara cuando el usuario realmente aceptó los términos; no se necesita trigger de UPDATE.

- **AuthContext.jsx — lectura de `acepto_terminos`:** Actualizar en Fase 1. Estrategia: en `cargarPerfil`, después de obtener el perfil, hacer una segunda query: `supabase.from('diagnosticos').select('acepto_terminos').eq('perfil_id', userId).limit(1).single()`. Si no existe fila en `diagnosticos`, el valor es `false`. Exponer como `aceptoTerminos` en el contexto igual que antes. No usar join (`.select("*, diagnosticos(...)")`) porque requeriría cambiar el shape del objeto `perfil` que usa el resto de la app.

- **RLS admin:** Las políticas usan `(auth.jwt() ->> 'role') = 'admin'`. El claim se seteará via Edge Function en fase posterior. Hasta entonces, las políticas estarán definidas pero el claim no existirá en JWTs de usuarios normales.

- **`lecciones_usuario`:** El constraint UNIQUE `(perfil_id, leccion_id)` evita duplicados de estado por lección.

- **`dispositivos`:** El constraint UNIQUE `(perfil_id, device_id)` permite hacer UPSERT al registrar un dispositivo, evitando filas duplicadas.

- **`notificaciones` UPDATE para usuarios:** La política permite UPDATE solo donde `destinatario_id = auth.uid()`, únicamente para el campo `leida`. La aplicación debe asegurarse de no enviar otros campos en el UPDATE.

- **Límite mensual de planes (freemium) — función SECURITY DEFINER:** La política INSERT de `planes` no puede usar un subquery que consulte la misma tabla `planes` (causaría recursión infinita en RLS). La solución es crear una función `check_planes_freemium_limit(uid uuid)` con `SECURITY DEFINER` que bypasea RLS internamente:
  ```sql
  CREATE OR REPLACE FUNCTION check_planes_freemium_limit(uid uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  DECLARE
    user_tipo tipo_usuario_enum;
    plan_count int;
  BEGIN
    SELECT tipo_usuario INTO user_tipo FROM perfiles WHERE id = uid;
    IF user_tipo IN ('premium', 'demo') THEN
      RETURN true;
    END IF;
    SELECT COUNT(*) INTO plan_count
      FROM planes
      WHERE perfil_id = uid
        AND date_trunc('month', created_at) = date_trunc('month', now());
    RETURN plan_count = 0;
  END;
  $$;
  ```
  Esta función se incluye en `04_rls.sql` antes de las políticas de `planes`.
