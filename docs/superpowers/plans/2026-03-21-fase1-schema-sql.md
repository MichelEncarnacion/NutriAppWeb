# Fase 1 — Schema SQL y RLS en Supabase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el schema completo de NutriiApp en Supabase: 5 enums, 11 tablas, índices, triggers de sincronización, función SECURITY DEFINER y políticas RLS, más actualizar `AuthContext.jsx` para leer `acepto_terminos` desde `diagnosticos`.

**Architecture:** Se generan 4 archivos SQL independientes que se ejecutan en orden en el SQL Editor de Supabase. Adicionalmente se actualiza `AuthContext.jsx` en el frontend para adaptar la lectura de `acepto_terminos`. Los triggers en Postgres sincronizan estado derivado (`diagnostico_completado`) automáticamente.

**Tech Stack:** Supabase (Postgres 15+, RLS, triggers, SECURITY DEFINER functions), React 19, `@supabase/supabase-js`

---

## Archivos

| Acción | Archivo |
|---|---|
| Crear | `docs/fase1/01_enums.sql` |
| Crear | `docs/fase1/02_tablas.sql` |
| Crear | `docs/fase1/03_indices.sql` |
| Crear | `docs/fase1/04_rls.sql` |
| Modificar | `src/context/AuthContext.jsx` |

---

## Task 1: Crear enums (`01_enums.sql`)

**Files:**
- Create: `docs/fase1/01_enums.sql`

- [ ] **Paso 1: Crear el directorio y el archivo**

```bash
mkdir -p docs/fase1
```

Crear `docs/fase1/01_enums.sql` con el siguiente contenido:

```sql
-- ============================================================
-- NutriiApp — Fase 1 — Tipos ENUM
-- Ejecutar primero. Estos tipos son requeridos por 02_tablas.sql
-- ============================================================

-- Tipo de usuario: controla acceso a features premium
CREATE TYPE tipo_usuario_enum AS ENUM (
  'freemium',
  'demo',
  'premium'
);

-- Estado del plan generado por Gemini
CREATE TYPE estado_plan_enum AS ENUM (
  'generando',
  'listo',
  'error'
);

-- Fuente del dato ingresado en seguimiento quincenal
CREATE TYPE fuente_datos_enum AS ENUM (
  'manual',
  'healthkit',
  'google_fit',
  'nutriipoint_qr'
);

-- Estado de una lección para un usuario específico
CREATE TYPE estado_leccion_enum AS ENUM (
  'bloqueada',
  'disponible',
  'en_progreso',
  'completada'
);

-- Tipo de notificación push
CREATE TYPE tipo_notificacion_enum AS ENUM (
  'comida',
  'leccion',
  'seguimiento',
  'masiva',
  'sistema'
);
```

- [ ] **Paso 2: Ejecutar en Supabase SQL Editor**

Ir a: Supabase Dashboard → proyecto → SQL Editor → New Query.
Pegar el contenido de `01_enums.sql` y hacer clic en **Run**.

Verificar que no hay errores. Si aparece `ERROR: type "tipo_usuario_enum" already exists`, significa que ya se ejecutó antes. En ese caso agregar `DROP TYPE IF EXISTS ... CASCADE;` antes de cada `CREATE TYPE` y re-ejecutar.

- [ ] **Paso 3: Verificar tipos creados**

En el SQL Editor ejecutar:

```sql
SELECT typname FROM pg_type
WHERE typname IN (
  'tipo_usuario_enum',
  'estado_plan_enum',
  'fuente_datos_enum',
  'estado_leccion_enum',
  'tipo_notificacion_enum'
);
```

Resultado esperado: 5 filas, una por cada tipo.

---

## Task 2: Crear tablas y triggers (`02_tablas.sql`)

**Files:**
- Create: `docs/fase1/02_tablas.sql`

- [ ] **Paso 1: Crear `docs/fase1/02_tablas.sql`**

```sql
-- ============================================================
-- NutriiApp — Fase 1 — Tablas
-- Requiere: 01_enums.sql ejecutado previamente
-- ============================================================

-- ── perfiles ─────────────────────────────────────────────────
-- Un registro por usuario de Supabase Auth.
-- id coincide con auth.users.id (no es auto-generado).
CREATE TABLE perfiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre                text,
  email                 text,
  avatar_url            text,
  tipo_usuario          tipo_usuario_enum NOT NULL DEFAULT 'freemium',
  diagnostico_completado boolean NOT NULL DEFAULT false,
  fecha_registro        timestamptz NOT NULL DEFAULT now(),
  fecha_expiracion_demo timestamptz,
  updated_at            timestamptz
);

-- ── administradores ───────────────────────────────────────────
-- Tabla separada para admins. Los admins NO aparecen en perfiles.
-- Su rol se identifica por JWT claim, no por tipo_usuario.
CREATE TABLE administradores (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  email      text UNIQUE NOT NULL,
  rol        text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── diagnosticos ──────────────────────────────────────────────
-- Respuestas del formulario inicial de 24 preguntas.
-- acepto_terminos tiene CHECK para garantizar que solo se inserta
-- con valor true; esto hace que el trigger de sincronización sea
-- correcto sin necesidad de un trigger adicional de UPDATE.
CREATE TABLE diagnosticos (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id             uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  acepto_terminos       boolean NOT NULL CHECK (acepto_terminos = true),
  peso                  numeric,
  estatura              numeric,
  edad                  int,
  sexo                  text,
  objetivo              text,
  nivel_actividad       text,
  habitos_alimenticios  text,
  restricciones_medicas text,
  alergias              text,
  enfermedades          text[] NOT NULL DEFAULT '{}',
  presupuesto_quincenal numeric,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ── planes ────────────────────────────────────────────────────
-- Planes nutricionales generados por Gemini.
CREATE TABLE planes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id      uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido_json jsonb,
  prompt_enviado text,
  respuesta_ia   text,
  estado         estado_plan_enum NOT NULL DEFAULT 'generando',
  fecha_inicio   date,
  fecha_fin      date,
  es_activo      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── seguimientos ──────────────────────────────────────────────
-- Formulario quincenal de seguimiento del usuario.
CREATE TABLE seguimientos (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id            uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  peso_actual          numeric,
  porcentaje_grasa     numeric,
  satisfaccion_plan    int CHECK (satisfaccion_plan BETWEEN 1 AND 5),
  platillos_favoritos  text[] NOT NULL DEFAULT '{}',
  platillos_no_gustados text[] NOT NULL DEFAULT '{}',
  cambios_actividad    text,
  cambios_salud        text,
  fuente_datos         fuente_datos_enum NOT NULL DEFAULT 'manual',
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ── metricas ─────────────────────────────────────────────────
-- Registro histórico para el panel Progreso (solo demo/premium).
CREATE TABLE metricas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id           uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  fecha               date NOT NULL,
  peso                numeric,
  porcentaje_grasa    numeric,
  porcentaje_musculo  numeric,
  calorias_consumidas numeric,
  agua_ml             int,
  comidas_completadas int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── lecciones ─────────────────────────────────────────────────
-- Contenido educativo. Administrado por admins.
CREATE TABLE lecciones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     text NOT NULL,
  contenido  text NOT NULL,
  orden      int NOT NULL,
  activa     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── lecciones_usuario ─────────────────────────────────────────
-- Progreso individual por usuario y lección.
-- UNIQUE garantiza un solo estado por par (usuario, lección).
CREATE TABLE lecciones_usuario (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id        uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  leccion_id       uuid NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
  estado           estado_leccion_enum NOT NULL DEFAULT 'bloqueada',
  fecha_completada timestamptz,
  fecha_disponible timestamptz,
  UNIQUE (perfil_id, leccion_id)
);

-- ── dispositivos ──────────────────────────────────────────────
-- Control de sesiones activas por dispositivo.
-- UNIQUE evita registrar el mismo dispositivo dos veces.
CREATE TABLE dispositivos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id    uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  device_id    text NOT NULL,
  token_fcm    text,
  ultima_sesion timestamptz NOT NULL DEFAULT now(),
  activo       boolean NOT NULL DEFAULT true,
  UNIQUE (perfil_id, device_id)
);

-- ── notificaciones ────────────────────────────────────────────
-- Log de notificaciones enviadas.
-- destinatario_id NULL = notificación masiva.
CREATE TABLE notificaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          text NOT NULL,
  cuerpo          text NOT NULL,
  tipo            tipo_notificacion_enum NOT NULL,
  destinatario_id uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  segmento        text,
  enviada_at      timestamptz NOT NULL DEFAULT now(),
  leida           boolean NOT NULL DEFAULT false
);

-- ── invitaciones_demo ─────────────────────────────────────────
-- 100 links de invitación para usuarios demo.
-- creado_por referencia a administradores (no a auth.users).
CREATE TABLE invitaciones_demo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text UNIQUE NOT NULL,
  usado_por   uuid REFERENCES perfiles(id) ON DELETE SET NULL,
  creado_por  uuid NOT NULL REFERENCES administradores(id),
  fecha_uso   timestamptz,
  activo      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Crear perfil automáticamente al registrar usuario
-- Se dispara AFTER INSERT en auth.users.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO perfiles (id, email, fecha_registro)
  VALUES (NEW.id, NEW.email, now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger 2: Marcar diagnóstico como completado en perfiles
-- Se dispara AFTER INSERT en diagnosticos.
-- El CHECK (acepto_terminos = true) garantiza que este trigger
-- solo corre cuando el usuario realmente aceptó los términos.
CREATE OR REPLACE FUNCTION handle_diagnostico_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE perfiles
  SET diagnostico_completado = true,
      updated_at = now()
  WHERE id = NEW.perfil_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_diagnostico_created
  AFTER INSERT ON diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION handle_diagnostico_insert();
```

- [ ] **Paso 2: Ejecutar en Supabase SQL Editor**

Pegar el contenido completo de `02_tablas.sql` y ejecutar.

Si aparece algún error de tipo `relation already exists`, ejecutar primero:
```sql
DROP TABLE IF EXISTS invitaciones_demo, notificaciones, dispositivos,
  lecciones_usuario, lecciones, metricas, seguimientos,
  planes, diagnosticos, administradores, perfiles CASCADE;
```
Luego re-ejecutar `02_tablas.sql`.

- [ ] **Paso 3: Verificar tablas creadas**

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Resultado esperado: 11 tablas — `administradores`, `diagnosticos`, `dispositivos`, `invitaciones_demo`, `lecciones`, `lecciones_usuario`, `metricas`, `notificaciones`, `perfiles`, `planes`, `seguimientos`.

- [ ] **Paso 4: Verificar triggers creados**

```sql
SELECT tgname, relname AS tabla
FROM pg_trigger
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE tgname IN ('on_auth_user_created', 'on_diagnostico_created');
```

Resultado esperado: 2 filas — `on_auth_user_created` en `users` y `on_diagnostico_created` en `diagnosticos`.

> Nota: No usar `information_schema.triggers` para este check porque el trigger `on_auth_user_created` está en el schema `auth`, que puede no ser visible desde esa vista en todos los proyectos de Supabase.

---

## Task 3: Crear índices (`03_indices.sql`)

**Files:**
- Create: `docs/fase1/03_indices.sql`

- [ ] **Paso 1: Crear `docs/fase1/03_indices.sql`**

```sql
-- ============================================================
-- NutriiApp — Fase 1 — Índices
-- Requiere: 02_tablas.sql ejecutado previamente
-- ============================================================

-- perfiles: filtros admin por segmento de usuario
CREATE INDEX idx_perfiles_tipo_usuario
  ON perfiles(tipo_usuario);

-- diagnosticos: join desde perfil
CREATE INDEX idx_diagnosticos_perfil_id
  ON diagnosticos(perfil_id);

-- planes: queries del panel Mi Plan y filtros admin
CREATE INDEX idx_planes_perfil_id
  ON planes(perfil_id);
CREATE INDEX idx_planes_es_activo
  ON planes(es_activo);
CREATE INDEX idx_planes_estado
  ON planes(estado);

-- seguimientos: historial cronológico por usuario
CREATE INDEX idx_seguimientos_perfil_id
  ON seguimientos(perfil_id);
CREATE INDEX idx_seguimientos_created_at
  ON seguimientos(created_at);

-- metricas: queries del panel Progreso (fecha + usuario)
CREATE INDEX idx_metricas_perfil_id
  ON metricas(perfil_id);
CREATE INDEX idx_metricas_fecha
  ON metricas(fecha);

-- lecciones_usuario: estado de lecciones por usuario
CREATE INDEX idx_lecciones_usuario_perfil_id
  ON lecciones_usuario(perfil_id);
CREATE INDEX idx_lecciones_usuario_leccion_id
  ON lecciones_usuario(leccion_id);
CREATE INDEX idx_lecciones_usuario_estado
  ON lecciones_usuario(estado);

-- dispositivos: lookup por device_id para control de sesión
CREATE INDEX idx_dispositivos_perfil_id
  ON dispositivos(perfil_id);
CREATE INDEX idx_dispositivos_device_id
  ON dispositivos(device_id);
CREATE INDEX idx_dispositivos_activo
  ON dispositivos(activo);

-- notificaciones: bandeja de entrada por usuario
CREATE INDEX idx_notificaciones_destinatario_id
  ON notificaciones(destinatario_id);
CREATE INDEX idx_notificaciones_enviada_at
  ON notificaciones(enviada_at);

-- invitaciones_demo: lookup de invitación usada
CREATE INDEX idx_invitaciones_demo_usado_por
  ON invitaciones_demo(usado_por);
```

- [ ] **Paso 2: Ejecutar en Supabase SQL Editor**

Pegar el contenido de `03_indices.sql` y ejecutar.

- [ ] **Paso 3: Verificar índices creados**

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Resultado esperado: al menos 19 índices listados.

---

## Task 4: Crear RLS y función SECURITY DEFINER (`04_rls.sql`)

**Files:**
- Create: `docs/fase1/04_rls.sql`

- [ ] **Paso 1: Crear `docs/fase1/04_rls.sql`**

```sql
-- ============================================================
-- NutriiApp — Fase 1 — Row Level Security
-- Requiere: 02_tablas.sql ejecutado previamente
-- ============================================================

-- ── Habilitar RLS en todas las tablas ────────────────────────
ALTER TABLE perfiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones_usuario     ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones_demo     ENABLE ROW LEVEL SECURITY;

-- ── Función auxiliar: límite mensual de planes para freemium ─
-- SECURITY DEFINER permite que la función consulte `planes`
-- sin activar RLS recursivamente.
CREATE OR REPLACE FUNCTION check_planes_freemium_limit(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tipo  tipo_usuario_enum;
  plan_count int;
BEGIN
  SELECT tipo_usuario INTO user_tipo
  FROM perfiles WHERE id = uid;

  -- Premium y demo no tienen límite
  IF user_tipo IN ('premium', 'demo') THEN
    RETURN true;
  END IF;

  -- Freemium: máximo 1 plan por mes calendario
  SELECT COUNT(*) INTO plan_count
  FROM planes
  WHERE perfil_id = uid
    AND date_trunc('month', created_at) = date_trunc('month', now());

  RETURN plan_count = 0;
END;
$$;

-- ============================================================
-- POLÍTICAS — USUARIOS REGULARES
-- ============================================================

-- ── perfiles ─────────────────────────────────────────────────
CREATE POLICY "usuarios: insertar propio perfil"
  ON perfiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "usuarios: ver y editar propio perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "usuarios: actualizar propio perfil"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── diagnosticos ─────────────────────────────────────────────
CREATE POLICY "usuarios: gestionar propio diagnostico"
  ON diagnosticos FOR ALL
  TO authenticated
  USING (perfil_id = auth.uid())
  WITH CHECK (perfil_id = auth.uid());

-- ── planes ───────────────────────────────────────────────────
CREATE POLICY "usuarios: ver propios planes"
  ON planes FOR SELECT
  TO authenticated
  USING (perfil_id = auth.uid());

CREATE POLICY "usuarios: insertar plan (respeta limite freemium)"
  ON planes FOR INSERT
  TO authenticated
  WITH CHECK (
    perfil_id = auth.uid()
    AND check_planes_freemium_limit(auth.uid()) = true
  );

-- ── seguimientos ─────────────────────────────────────────────
CREATE POLICY "usuarios: gestionar propios seguimientos"
  ON seguimientos FOR ALL
  TO authenticated
  USING (perfil_id = auth.uid())
  WITH CHECK (perfil_id = auth.uid());

-- ── metricas ─────────────────────────────────────────────────
-- Solo demo/premium pueden acceder a métricas (SELECT e INSERT)
CREATE POLICY "usuarios premium/demo: ver metricas"
  ON metricas FOR SELECT
  TO authenticated
  USING (
    perfil_id = auth.uid()
    AND (
      SELECT tipo_usuario FROM perfiles WHERE id = auth.uid()
    ) IN ('premium', 'demo')
  );

CREATE POLICY "usuarios premium/demo: insertar metricas"
  ON metricas FOR INSERT
  TO authenticated
  WITH CHECK (
    perfil_id = auth.uid()
    AND (
      SELECT tipo_usuario FROM perfiles WHERE id = auth.uid()
    ) IN ('premium', 'demo')
  );

-- ── lecciones ────────────────────────────────────────────────
CREATE POLICY "usuarios: ver lecciones activas"
  ON lecciones FOR SELECT
  TO authenticated
  USING (activa = true);

-- ── lecciones_usuario ────────────────────────────────────────
CREATE POLICY "usuarios: gestionar progreso en lecciones"
  ON lecciones_usuario FOR ALL
  TO authenticated
  USING (perfil_id = auth.uid())
  WITH CHECK (perfil_id = auth.uid());

-- ── dispositivos ─────────────────────────────────────────────
CREATE POLICY "usuarios: gestionar propios dispositivos"
  ON dispositivos FOR ALL
  TO authenticated
  USING (perfil_id = auth.uid())
  WITH CHECK (perfil_id = auth.uid());

-- ── notificaciones ───────────────────────────────────────────
CREATE POLICY "usuarios: ver propias notificaciones"
  ON notificaciones FOR SELECT
  TO authenticated
  USING (destinatario_id = auth.uid());

-- Solo pueden hacer UPDATE (para marcar leida = true)
CREATE POLICY "usuarios: marcar notificacion como leida"
  ON notificaciones FOR UPDATE
  TO authenticated
  USING (destinatario_id = auth.uid())
  WITH CHECK (destinatario_id = auth.uid());

-- ── invitaciones_demo ────────────────────────────────────────
-- Un usuario puede canjear una invitación (UPDATE) solo si
-- el código no ha sido usado (usado_por IS NULL) y está activo.
-- WITH CHECK garantiza que solo puede asignarse a sí mismo.
CREATE POLICY "usuarios: canjear invitacion demo"
  ON invitaciones_demo FOR UPDATE
  TO authenticated
  USING (usado_por IS NULL AND activo = true)
  WITH CHECK (usado_por = auth.uid());

-- ============================================================
-- POLÍTICAS — ADMINISTRADORES (JWT claim role = 'admin')
-- ============================================================

-- Helper para verificar el claim de admin
-- Se usa inline en cada política para legibilidad
-- (auth.jwt() ->> 'role') = 'admin'

-- perfiles: admins ven y modifican todos los perfiles
CREATE POLICY "admin: ver todos los perfiles"
  ON perfiles FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: actualizar tipo_usuario en perfiles"
  ON perfiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- administradores: solo admins gestionan otros admins
CREATE POLICY "admin: ver administradores"
  ON administradores FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: gestionar administradores"
  ON administradores FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- diagnosticos, seguimientos, metricas: admins solo lectura
CREATE POLICY "admin: ver diagnosticos"
  ON diagnosticos FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: ver seguimientos"
  ON seguimientos FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: ver metricas"
  ON metricas FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- planes: admins ven todos y pueden actualizar (regenerar)
CREATE POLICY "admin: ver todos los planes"
  ON planes FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: actualizar planes"
  ON planes FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- lecciones: admins hacen CRUD completo
CREATE POLICY "admin: ver lecciones"
  ON lecciones FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: gestionar lecciones"
  ON lecciones FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- lecciones_usuario: admins solo lectura
CREATE POLICY "admin: ver lecciones_usuario"
  ON lecciones_usuario FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- dispositivos: admins solo lectura
CREATE POLICY "admin: ver dispositivos"
  ON dispositivos FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- notificaciones: admins crean y ven todas
CREATE POLICY "admin: ver notificaciones"
  ON notificaciones FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: crear notificaciones"
  ON notificaciones FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- invitaciones_demo: admins crean y gestionan
CREATE POLICY "admin: ver invitaciones_demo"
  ON invitaciones_demo FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "admin: gestionar invitaciones_demo"
  ON invitaciones_demo FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
```

- [ ] **Paso 2: Ejecutar en Supabase SQL Editor**

Pegar el contenido completo de `04_rls.sql` y ejecutar.

Si la ejecución falla a la mitad (ejecución parcial de políticas), ejecutar el siguiente bloque de limpieza antes de reintentar:

```sql
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;
DROP FUNCTION IF EXISTS check_planes_freemium_limit(uuid);
```

Luego re-ejecutar `04_rls.sql` completo.

- [ ] **Paso 3: Verificar RLS habilitado en todas las tablas**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Resultado esperado: todas las tablas con `rowsecurity = true`.

- [ ] **Paso 4: Verificar que se crearon las políticas**

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Resultado esperado: ~30 políticas distribuidas entre las 11 tablas.

- [ ] **Paso 5: Verificar la función SECURITY DEFINER**

```sql
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'check_planes_freemium_limit';
```

Resultado esperado: 1 fila con `prosecdef = true`.

---

## Task 5: Actualizar `AuthContext.jsx` para leer `acepto_terminos` desde `diagnosticos`

**Context:** El `AuthContext.jsx` actual lee `acepto_terminos` desde `perfil?.acepto_terminos`, pero ese campo ya no existe en la tabla `perfiles`. Hay que agregar una query adicional a `diagnosticos`.

**Files:**
- Modify: `src/context/AuthContext.jsx`

- [ ] **Paso 1: Leer el archivo actual**

Leer `src/context/AuthContext.jsx` para entender el shape de `cargarPerfil` antes de modificar.

- [ ] **Paso 2: Modificar `cargarPerfil` para incluir `acepto_terminos`**

Localizar la función `cargarPerfil` (aprox. línea 13). Cambiar de:

```js
const cargarPerfil = async (userId) => {
    const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error cargando perfil:", error.message);
        return null;
    }
    return data;
};
```

A:

```js
const cargarPerfil = async (userId) => {
    const { data: perfilData, error: perfilError } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (perfilError) {
        console.error("Error cargando perfil:", perfilError.message);
        return null;
    }

    // acepto_terminos vive en diagnosticos, no en perfiles.
    // .maybeSingle() maneja correctamente el caso de usuario nuevo
    // sin diagnóstico (retorna null en lugar de error).
    const { data: diagData } = await supabase
        .from("diagnosticos")
        .select("acepto_terminos")
        .eq("perfil_id", userId)
        .maybeSingle();

    return {
        ...perfilData,
        acepto_terminos: diagData?.acepto_terminos ?? false,
    };
};
```

- [ ] **Paso 3: Modificar `actualizarPerfil` para preservar `acepto_terminos`**

La función `actualizarPerfil` hace `setPerfil(data)` con el objeto crudo de `perfiles`, lo que sobreescribiría `acepto_terminos` (que viene de `diagnosticos`) y lo resetearía a `undefined`. Cambiar de:

```js
const actualizarPerfil = async (datos) => {
    if (!session?.user) return;
    const { data, error } = await supabase
        .from("perfiles")
        .update(datos)
        .eq("id", session.user.id)
        .select()
        .single();
    if (!error) setPerfil(data);
    return { data, error };
};
```

A:

```js
const actualizarPerfil = async (datos) => {
    if (!session?.user) return;
    const { data, error } = await supabase
        .from("perfiles")
        .update(datos)
        .eq("id", session.user.id)
        .select()
        .single();
    if (!error) {
        // Preservar acepto_terminos que viene de diagnosticos,
        // no del objeto perfiles retornado por Supabase.
        setPerfil({
            ...data,
            acepto_terminos: perfil?.acepto_terminos ?? false,
        });
    }
    return { data, error };
};
```

- [ ] **Paso 4: Verificar que `aceptoTerminos` sigue funcionando sin cambios**

Confirmar que la línea:
```js
const aceptoTerminos = perfil?.acepto_terminos ?? false;
```
sigue funcionando sin modificación, ya que `acepto_terminos` ahora viene mezclado en el objeto retornado por `cargarPerfil` y preservado por `actualizarPerfil`.

- [ ] **Paso 5: Probar manualmente en el navegador**

1. Iniciar el servidor de desarrollo: `npm run dev`
2. Registrar un usuario nuevo.
3. Verificar que la app redirige a `/terminos-condiciones` (porque `acepto_terminos` es `false`).
4. Aceptar los términos y completar el diagnóstico.
5. Verificar que la app redirige al home (porque `diagnostico_completado` es `true` en `perfiles` y `acepto_terminos` es `true` desde `diagnosticos`).

- [ ] **Paso 6: Verificar el trigger de sincronización**

En Supabase SQL Editor, verificar que `diagnostico_completado` se actualizó en `perfiles` después del paso 4:

```sql
SELECT id, diagnostico_completado
FROM perfiles
WHERE email = 'tu-email-de-prueba@ejemplo.com';
```

Resultado esperado: `diagnostico_completado = true`.

---

## Orden de ejecución

1. Ejecutar `01_enums.sql` en Supabase SQL Editor
2. Ejecutar `02_tablas.sql` en Supabase SQL Editor
3. Ejecutar `03_indices.sql` en Supabase SQL Editor
4. Ejecutar `04_rls.sql` en Supabase SQL Editor
5. Modificar `src/context/AuthContext.jsx`
6. Probar el flujo completo con `npm run dev`
