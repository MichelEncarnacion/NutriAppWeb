-- ============================================================
-- Tabla: colaboradores
-- Profesionales de salud mental (psicólogos) que se muestran
-- en una sección de la landing.
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

create table if not exists public.colaboradores (
  id            uuid        primary key default gen_random_uuid(),
  nombre        text        not null,
  foto_url      text,
  ubicacion     text,
  enfoque       text,
  cedula        text,
  tipo_terapias text,
  descuento     numeric(4,2) not null default 0,  -- ej. 0.20 = 20%
  publicado     boolean     not null default true,
  orden         integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists colaboradores_publicado_orden_idx
  on public.colaboradores (publicado, orden asc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists colaboradores_updated_at on public.colaboradores;
create trigger colaboradores_updated_at
  before update on public.colaboradores
  for each row execute function public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.colaboradores enable row level security;

-- Cualquier visitante puede leer colaboradores publicados
create policy "colaboradores_public_select"
  on public.colaboradores for select
  using (publicado = true);

-- Usuarios autenticados (admin) pueden gestionar todo
create policy "colaboradores_auth_all"
  on public.colaboradores for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
