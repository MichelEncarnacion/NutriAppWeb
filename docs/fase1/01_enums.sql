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
