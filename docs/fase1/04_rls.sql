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
