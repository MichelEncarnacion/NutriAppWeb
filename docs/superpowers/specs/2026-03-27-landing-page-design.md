# Landing Page — NutriiApp Design Spec

**Date:** 2026-03-27
**Scope:** Replace `Bienvenida.jsx` with a full marketing landing page at `/`

---

## Context

The current `Bienvenida.jsx` is a minimal splash screen (logo + 2 buttons). This spec replaces it with a conversion-focused landing page that sells NutriiApp to all user segments, emphasizing time savings, expert-backed quality, and AI personalization.

The app interior (Panel, MiPlan, Lecciones, Progreso, etc.) is **not touched** — it stays on Tailwind CSS. The landing is self-contained.

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| `@mui/material` v6 + `@emotion/react` + `@emotion/styled` | UI components (Box, Typography, Button, Accordion, Grid, Container) |
| `framer-motion` | Scroll-triggered fade-in animations |
| Unsplash static URLs | Real photos — no API key required |
| React Router `useNavigate` | CTA navigation to `/registro` and `/login` |

Tailwind is **not used** in `Landing.jsx`. All styling via MUI `sx` props.

---

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Add `@mui/material`, `@emotion/react`, `@emotion/styled`, `framer-motion` |
| `src/pages/Landing.jsx` | New file — full landing page |
| `src/App.jsx` | Replace `<Bienvenida>` import with `<Landing>` on route `/` |
| `src/pages/Bienvenida.jsx` | Delete |

No DB changes. No auth changes. No new routes.

---

## Color Tokens

| Token | Value | Use |
|-------|-------|-----|
| `bgMain` | `#0D1117` | Primary background |
| `bgCard` | `#161B22` | Card backgrounds |
| `bgFooter` | `#060a0f` | Footer background |
| `bgSection2` | `#0a0f16` | Benefits section background |
| `green` | `#3DDC84` | Brand accent, CTAs |
| `teal` | `#58A6FF` | Gradient secondary color |
| `textPrimary` | `#E6EDF3` | Headlines |
| `textMuted` | `#7D8590` | Body text, descriptions |
| `borderSubtle` | `rgba(61,220,132,0.15)` | Card borders |
| `greenGlow` | `rgba(61,220,132,0.3)` | Blob / glow effects |

---

## Section 1 — Navbar

Fixed top bar. Transparent background, `backdrop-filter: blur(12px)` on scroll.

- Left: `NutriiApp` logo (green + white, font-weight 900)
- Right: text link `"Iniciar sesión"` → `/login` + filled button `"Comenzar gratis"` → `/registro`

---

## Section 2 — Hero

Full viewport height (`minHeight: "100vh"`). Two columns on desktop (`md`+), stacked on mobile.

### Background
- Base: `#0D1117`
- Radial gradient blob top-right: `radial-gradient(ellipse at 80% 20%, rgba(61,220,132,0.12), transparent 60%)`

### Left column
- **Credibility chip** (small pill, green border): `"✦ IA + Expertos en Nutrición Certificados"`
- **Headline** (`fontSize: { xs: "2.2rem", md: "3.5rem" }`, `fontWeight: 900`, white):
  > *"Tu plan nutricional personalizado, listo en minutos"*
- **Subheadline** (`fontSize: "1.1rem"`, color `#7D8590`):
  > *"Planes creados por nutriólogos certificados y potenciados por IA. Adaptados a tu cuerpo, objetivos y presupuesto. Sin esperas."*
- **CTAs** (row, gap 12px):
  - Primary: MUI `Button` variant `contained`, bgcolor `#3DDC84`, color black, `"Comenzar gratis →"` → `/registro`
  - Secondary: MUI `Button` variant `outlined`, border/color `#3DDC84`, `"Ya tengo cuenta"` → `/login`
- **Micro-stats** (row of 3, separated by `·`):
  `"Plan de 15 días"` · `"24 preguntas"` · `"100% personalizado"`

### Right column
- Real Unsplash photo of healthy food (bowl/meal prep) inside a CSS device frame (rounded corners, subtle shadow, border `1px solid rgba(255,255,255,0.08)`)
- Green-teal radial glow behind the image: `radial-gradient(ellipse, rgba(61,220,132,0.25), rgba(88,166,255,0.1), transparent)`
- Image: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80` (colorful healthy meal)

---

## Section 3 — Credibility Band

Full-width band between Hero and "Cómo funciona". Background `#161B22`, `borderTop/borderBottom: 1px solid rgba(61,220,132,0.1)`.

3 stats centered in a row (stacked on mobile):

| Stat | Label |
|------|-------|
| `"Nutriólogos certificados"` | Equipo especializado |
| `"15 días"` | Por plan generado |
| `"IA + Expertos"` | Respaldado por ciencia |

---

## Section 4 — Cómo funciona

Background `#0D1117`. Centered title: *"Así de simple"*, subtitle: *"De cero a tu plan personalizado en menos de 10 minutos"*.

3 step cards in a row on desktop (`md`), stacked on mobile. Connected by a dashed green line between them (desktop only, `borderTop: 2px dashed rgba(61,220,132,0.2)`).

Each card:
- `background: #161B22`, `border: 1px solid rgba(61,220,132,0.15)`, `borderRadius: 16px`, `padding: 32px 24px`
- Step number watermark: large `"01"/"02"/"03"` in green `opacity: 0.1`, `fontSize: "4rem"`, `fontWeight: 900`
- Circular image (120px × 120px, `borderRadius: "50%"`, `objectFit: "cover"`) from Unsplash
- Title (white, bold), description (muted gray)
- Framer Motion: `fadeInUp` with `staggerChildren: 0.2` on viewport entry

| Step | Image URL | Title | Description |
|------|-----------|-------|-------------|
| 01 | `https://images.unsplash.com/photo-1551076805-e1869033e561?w=200&q=80` (person with phone) | *Cuéntanos sobre ti* | Responde 24 preguntas sobre tu cuerpo, objetivos, hábitos y presupuesto |
| 02 | `https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=200&q=80` (AI/tech abstract) | *La IA y nuestros expertos diseñan tu plan* | Nuestro equipo de nutriólogos y algoritmo de IA generan un plan de 15 días específico para ti en segundos |
| 03 | `https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80` (healthy meal prep) | *Sigue tu plan día a día* | Marca comidas completadas, monitorea tu progreso y recibe un nuevo plan adaptado cada quincena |

---

## Section 5 — Beneficios

Background `#0a0f16`. Centered title: *"Todo lo que necesitas para comer mejor"*.

2×2 grid on desktop (`md`), 1 column on mobile. Each card:
- Image top half (200px height, `objectFit: "cover"`, `borderRadius: "16px 16px 0 0"`)
- Text bottom half: background `#161B22`, `border: 1px solid rgba(61,220,132,0.15)`, `borderRadius: "0 0 16px 16px"`
- Hover: `transform: translateY(-4px)`, `borderColor: rgba(61,220,132,0.4)`, `transition: all 0.25s`

| Card | Image URL | Title | Description |
|------|-----------|-------|-------------|
| 1 | `https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&q=80` (cooking healthy) | *Ahorra horas de investigación* | Olvídate de buscar recetas y calcular macros. Tu plan ya viene con todo: comidas, horarios, calorías y macronutrientes — respaldado por nutriólogos |
| 2 | `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80` (person active/gym) | *Adaptado a tu ritmo de vida* | Actividad física, presupuesto, alergias y restricciones médicas — tu plan lo considera todo desde el primer día |
| 3 | `https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80` (varied colorful meals) | *15 días sin repetirte* | Cada día trae comidas diferentes para que no te aburras ni abandones tu plan. Variedad garantizada |
| 4 | `https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&q=80` (person checking phone/metrics) | *Evoluciona cada quincena* | Cada 15 días la IA ajusta tu plan según tu progreso real. No más planes estáticos que dejan de funcionar |

---

## Section 6 — FAQ

Background `#0D1117`. Centered title: *"Preguntas frecuentes"*. Max width 720px, centered.

MUI `Accordion` styling:
- Background: `#161B22`
- Border: `1px solid rgba(61,220,132,0.15)`
- Border radius: `12px` (each item, `disableGutters`)
- Expand icon: `+`/`−` in green `#3DDC84`
- No default MUI shadow/elevation

6 items:

1. **¿Necesito saber de nutrición para usar NutriiApp?**
   No. Solo responde las preguntas del diagnóstico y nuestro equipo de nutriólogos junto con la IA hacen todo el trabajo por ti.

2. **¿Qué tan personalizado es el plan?**
   Totalmente. Cada plan es diseñado por nutriólogos certificados y personalizado por IA según tu peso, estatura, edad, objetivo, nivel de actividad, alergias, enfermedades y presupuesto quincenal.

3. **¿Cada cuánto se actualiza mi plan?**
   Cada 15 días. Completas un formulario de seguimiento y la IA, con supervisión de nuestros especialistas, genera un nuevo plan adaptado a tu progreso.

4. **¿Funciona si tengo restricciones alimenticias?**
   Sí. El diagnóstico incluye campos para alergias, intolerancias y condiciones médicas. Tu plan las respeta completamente.

5. **¿Es gratis?**
   Hay un plan Freemium gratuito con funciones básicas. El plan Premium desbloquea seguimiento completo de progreso, lecciones nutricionales y planes ilimitados.

6. **¿Mis datos están seguros?**
   Toda tu información se almacena de forma segura y nunca se comparte con terceros. Tu privacidad es nuestra prioridad.

---

## Section 7 — Footer

Background `#060a0f`. `borderTop: 1px solid rgba(61,220,132,0.1)`.

### Top area — 3 columns on desktop, stacked on mobile

**Column 1 — Brand:**
- Logo `NutriiApp` (green + white, large)
- Tagline: *"Nutrición personalizada con IA y expertos certificados"* (muted gray)
- Social icons row: Instagram, Facebook (MUI `IconButton`, color `#7D8590`, hover green)

**Column 2 — Links:**
- Cómo funciona (anchor scroll `#como-funciona`)
- Preguntas frecuentes (anchor scroll `#faq`)
- Términos y condiciones → `/terminos-condiciones`
- Iniciar sesión → `/login`

**Column 3 — CTA:**
- Text: *"¿Listo para empezar?"* (white, bold)
- Subtext: *"Únete gratis hoy"* (muted)
- Button: `"Crear cuenta gratis"` → `/registro`, bgcolor `#3DDC84`, color black, full width

### Bottom bar
`© 2026 NutriiApp · Todos los derechos reservados`  (centered, `fontSize: "0.75rem"`, color `#7D8590`)

---

## Animations (Framer Motion)

All animated sections use a shared `fadeInUp` variant:

```js
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
```

Triggered by `whileInView` with `viewport={{ once: true, amount: 0.2 }}`. Sections with multiple children use `staggerChildren: 0.15`.

---

## Navbar Scroll Behavior

Track scroll position with `useEffect` + `window.addEventListener("scroll")`. At `scrollY > 50`:
- Add `background: rgba(13,17,23,0.9)` + `backdropFilter: blur(12px)`
- Otherwise: fully transparent

---

## Verification

1. `npm run build` — zero errors
2. `/` loads landing page (not old Bienvenida)
3. "Comenzar gratis" → `/registro`, "Ya tengo cuenta" → `/login`
4. All 6 sections render with real images
5. FAQ accordions open/close correctly
6. Scroll animations trigger on viewport entry
7. Mobile layout stacks correctly (tested at 375px)
8. Navbar becomes opaque on scroll
