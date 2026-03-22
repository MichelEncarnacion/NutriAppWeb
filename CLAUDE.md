# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev        # Start dev server (Vite)

# Build & Preview
npm run build      # Production build
npm run preview    # Preview production build

# Linting
npm run lint       # Run ESLint
```

No test framework is configured in this project.

## Tech Stack

- **React 19** + **React Router v7** (SPA)
- **Vite 7** (build tool)
- **Supabase** (auth + database via `@supabase/supabase-js`)
- **TanStack React Query v5** (server state/caching)
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js` classes needed)
- **Lucide React** (icons)

## Architecture

### Route Structure (`src/App.jsx`)

Three distinct route trees with separate auth guards:

1. **Public routes** (`/login`, `/registro`, `/auth/callback`, `/terminos-condiciones`) — wrapped in `PublicOnlyRoute` to redirect logged-in users
2. **User routes** — wrapped in `PrivateRoute`, which enforces: session → T&C accepted → diagnostics completed → role-based feature access
3. **Admin routes** (`/admin/*`) — wrapped in `AdminRoute`, separate auth flow from regular users

### Auth & State (`src/context/AuthContext.jsx`)

Central `AuthContext` drives the entire app's access logic:
- Manages Supabase session + user profile from `perfiles` table
- Tracks onboarding state (`acepto_terminos`, `diagnostico_completado`)
- Exposes user tier (`tipo_usuario`: `freemium` | `demo` | `premium`)
- Admin uses a separate JWT-based role validation, not the same context

Access the context via `useAuth()` hook (`src/hooks/useAuth.jsx`).

### Supabase Client (`src/lib/supabase.js`)

Single client instance with localStorage session persistence and auto token refresh. Environment variables required: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Key Database Tables

- `perfiles` — user profile + onboarding flags
- `resumen_diario` — daily metrics (calories, meals, water)
- `metricas` — historical health metrics

### Styling

Tailwind v4 uses CSS-first configuration in `src/index.css`. Theme tokens are defined there (not in `tailwind.config.js`).

**Color palette:**
- Background: `#0D1117` (dark)
- Text: `#E6EDF3`
- Brand: Green `#3DDC84`, Blue `#58A6FF`, Orange `#F0A500`, Red `#FF6B6B`, Purple `#A855F7`

**Fonts:** Syne (display/headings), DM Sans (body)

### User Tier Access

`PrivateRoute` gates features by `tipo_usuario`. Premium-only features (e.g., Progreso) show upgrade modals to freemium users. Admin panel is entirely separate from the user-facing app.
