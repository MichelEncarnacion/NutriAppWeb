# Landing Page Redesign — Spec

**Fecha:** 2026-05-22  
**Proyecto:** NutriAppWeb  
**Enfoque:** Mejora progresiva (sin reescribir, capas visuales encima del código existente)

---

## Decisiones de diseño

| Dimensión | Decisión |
|---|---|
| Dirección visual | Light Elevated — base blanca/crema, verdes ricos, sombras suaves |
| Animaciones | Dinámicas — parallax, contadores animados, partículas, stagger |
| Imágenes/Visuales | Product Mockups 3D — dashboard en perspectiva con animación de flotación |
| Secciones | Todas: Hero, Beneficios, Cómo Funciona, Testimonios (nueva), CTA |

---

## Dependencias nuevas a instalar

- `react-countup` — contadores animados en KPIs

Framer Motion v12.3.0 ya está instalado e incluye `useInView` nativo — no se necesita `react-intersection-observer`. No se necesita librería de partículas adicional — se implementan con Framer Motion keyframes.

---

## 1. Hero (`LandingHero.jsx`)

**Cambios:**
- Fondo: agregar orbes de luz animadas con `motion.div` + `animate={{ scale, opacity }}` en loop keyframe. Dos orbes: top-right y bottom-left.
- Dashboard mockup: aplicar `transform: perspective(600px) rotateX(4deg) rotateY(-4deg)` + animación de flotación (`y: [0, -8, 0]` en loop de 4s).
- KPIs: reemplazar valores estáticos por `<CountUp>` con trigger al entrar al viewport via `useInView`.
- Badge flotante: nuevo elemento `"+ N empresas activas"` con punto verde pulsante (`animate={{ scale: [1, 1.3, 1] }}`), posicionado `absolute` sobre el mockup.
- Headline: segunda línea (`Tu empresa más productiva`) con `background-size: 200%` y `keyframe backgroundPosition` para efecto shimmer en el gradiente de texto.

**No cambia:** estructura del grid, copy, botones, trust badges.

---

## 2. Beneficios (`LandingBenefits.jsx`)

**Cambios:**
- Eyebrow label: agregar chip "POR QUÉ NUTRIIAPP" encima del heading con estilo `bgcolor: #E8F5E9, border: 1px solid #C8E6C9, borderRadius: 20px`.
- Íconos: añadir `boxShadow` verde suave y `whileHover: { scale: 1.1, rotate: 5 }` en Framer Motion.
- Barra de progreso: debajo de cada `metric`, agregar barra animada que va de 0% a N% al entrar al viewport.
- Hover de fila: agregar `whileHover: { backgroundColor: "rgba(27,94,32,0.03)" }` en el contenedor de cada pilar.
- Animación de entrada: aumentar `staggerChildren` de 0.12 a 0.18 para que el stagger sea más notorio.

**No cambia:** estructura grid, copy, colores base, lógica condicional del metric.

---

## 3. Cómo Funciona (`LandingHowItWorks.jsx`)

**Cambios:**
- Línea conectora: reemplazar el `Box` estático por un `<svg>` con `<line>` y animación `pathLength` de 0 a 1 via Framer Motion al entrar al viewport.
- Íconos: añadir ring de foco (`boxShadow: 0 0 0 6px bgAlt, 0 0 0 8px #C8E6C9`) y animación de entrada en secuencia (delay por índice).
- Mini screenshots: debajo del texto de cada paso, agregar un `Box` pequeño (altura ~56px) con fondo de color que simule una captura de pantalla del producto con label de texto. Colores diferenciados: NutriiPoint (verde), IA (azul), App (violeta), Dashboard (verde oscuro).
- Número de paso: envolver en chip `bgcolor: #E8F5E9` en lugar de texto plano.
- Activación en cascada: usar `useInView` + `animate` para que cada paso se ilumine con un delay de `i * 0.2s`.

**No cambia:** copy, grid layout, versión móvil en filas.

---

## 4. Testimonios (`LandingTestimonials.jsx`) — NUEVO COMPONENTE

**Estructura:**
```
LandingTestimonials
├── Eyebrow label "LO QUE DICEN NUESTROS CLIENTES"
├── Heading centrado (2 líneas)
├── LogoBand — banda con logos de empresas (auto-scroll CSS)
└── TestimonialGrid
    ├── TestimonialCard × 3 (grid desktop, carrusel móvil)
    └── Dots de navegación (móvil)
```

**Datos:** array `TESTIMONIALS` con `{ quote, name, role, company, rating, avatar, featured }`. Usar 3 testimonios ficticios pero plausibles para B2B (Director RR.HH., Gerente de Operaciones, etc.).

**LogoBand:** fila de 4-5 logos placeholder (rectángulos grises con opacidad 0.5), con animación CSS `@keyframes scroll` para desplazamiento horizontal continuo.

**TestimonialCard:**
- Border `1px solid #E2E8F0`, `borderRadius: 16px`, `boxShadow` suave.
- Estrellas animadas con `whileInView: { scale: [0, 1.2, 1] }` en secuencia por estrella.
- Avatar: `Box` circular con iniciales si no hay foto.
- `featured: true` → fondo verde oscuro, texto blanco, badge "DESTACADO" amarillo.

**Carrusel móvil:** estado `activeIndex` + `useEffect` auto-play cada 4s. Swipe con `drag: "x"` de Framer Motion.

**Posición en `Landing.jsx`:** entre `<LandingHowItWorks />` y `<LandingFAQ />`.

---

## 5. CTA (`LandingCTA.jsx`)

**Cambios:**
- Fondo: mismo tratamiento de orbes que el Hero para cohesión visual. Fondo base más oscuro: `linear-gradient(135deg, #0D2818, #1B5E20, #2E7D32)`.
- Badge de actividad: chip `"+ N empresas activas"` con punto pulsante (igual al del Hero).
- Botón: agregar efecto shimmer con `::after` pseudo-elemento o `motion.div` absoluto que atraviesa el botón en loop.
- Animación de headline: usar `motion.span` por palabra con `staggerChildren` para entrada individual.

**No cambia:** copy, highlights de checkmarks, navigate al demo.

---

## Archivos a modificar / crear

| Archivo | Acción |
|---|---|
| `src/components/landing/LandingHero.jsx` | Modificar |
| `src/components/landing/LandingBenefits.jsx` | Modificar |
| `src/components/landing/LandingHowItWorks.jsx` | Modificar |
| `src/components/landing/LandingCTA.jsx` | Modificar |
| `src/components/landing/LandingTestimonials.jsx` | Crear nuevo |
| `src/pages/Landing.jsx` | Agregar `<LandingTestimonials />` |
| `src/components/landing/landingTokens.js` | Agregar tokens de animación nuevos si necesario |
| `package.json` | Agregar `react-countup` |

---

## Restricciones

- No romper la estructura de rutas ni el sistema de auth.
- Mantener responsividad existente (xs/md breakpoints de MUI).
- No agregar librerías pesadas (no Three.js, no GSAP). Solo Framer Motion (ya instalado) + react-countup.
- Los testimonios son ficticios — no afirmar que son clientes reales en producción sin validar con el equipo.
