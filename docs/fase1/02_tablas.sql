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
