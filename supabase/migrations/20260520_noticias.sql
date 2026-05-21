-- ============================================================
-- Tabla: noticias
-- Gestión de artículos y noticias de la landing B2B
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

create table if not exists public.noticias (
  id            uuid        primary key default gen_random_uuid(),
  titulo        text        not null,
  extracto      text        not null,
  categoria     text        not null default 'Empresa'
                            check (categoria in ('Empresa', 'Investigación', 'Salud Corporativa')),
  fecha_display text        not null,          -- e.g. "Mayo 2025"
  imagen_url    text,                          -- URL de imagen (opcional)
  contenido     text,                          -- cuerpo completo del artículo (opcional)
  publicado     boolean     not null default false,
  orden         integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índices
create index if not exists noticias_publicado_orden_idx
  on public.noticias (publicado, orden asc);

-- Trigger para updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists noticias_updated_at on public.noticias;
create trigger noticias_updated_at
  before update on public.noticias
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.noticias enable row level security;

-- Cualquier visitante puede leer noticias publicadas
create policy "noticias_public_select"
  on public.noticias for select
  using (publicado = true);

-- Usuarios autenticados (admin) pueden gestionar todo
create policy "noticias_auth_all"
  on public.noticias for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Datos de ejemplo ──────────────────────────────────────────
insert into public.noticias (titulo, extracto, categoria, fecha_display, publicado, orden)
values
  (
    'NutriiApp obtiene reconocimiento COPARMEX Puebla por innovación en salud corporativa',
    'La plataforma fue distinguida entre más de 40 proyectos por su impacto en bienestar empresarial y su modelo de negocio sostenible.',
    'Empresa', 'Mayo 2025', true, 1
  ),
  (
    'El costo oculto de no gestionar la salud de tus colaboradores',
    'Un análisis de los datos de ausentismo y productividad en empresas mexicanas de 50 a 500 colaboradores durante 2024.',
    'Investigación', 'Abril 2025', true, 2
  ),
  (
    'NOM-030 y NOM-035: qué necesitan hacer las empresas en 2025',
    'Guía práctica para directores de RR.HH. sobre las obligaciones legales de bienestar y cómo cumplirlas sin esfuerzo adicional.',
    'Salud Corporativa', 'Marzo 2025', true, 3
  );
