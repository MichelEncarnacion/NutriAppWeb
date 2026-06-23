-- ============================================================
-- Agrega número de teléfono (WhatsApp) a los colaboradores
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

alter table public.colaboradores
  add column if not exists telefono text;
