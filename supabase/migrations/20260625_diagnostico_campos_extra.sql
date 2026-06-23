-- ============================================================
-- Agrega las columnas faltantes del cuestionario de diagnóstico
-- (actualmente se capturan en el front pero no se guardaban),
-- para poder personalizar el prompt de Gemini y la rutina de
-- ejercicios con todas las respuestas del usuario.
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

alter table public.diagnosticos
  add column if not exists peso_meta numeric,
  add column if not exists meta_personal text,
  add column if not exists ocupacion text,
  add column if not exists dias_ejercicio int,
  add column if not exists tipo_ejercicio text[] not null default '{}',
  add column if not exists comidas_por_dia int,
  add column if not exists horario_primer_comida text,
  add column if not exists horario_ultima_comida text,
  add column if not exists alimentos_no_gustados text[] not null default '{}',
  add column if not exists vasos_agua int,
  add column if not exists horas_sueno int,
  add column if not exists consume_alcohol text,
  add column if not exists nivel_estres text,
  add column if not exists tiempo_cocina int;
