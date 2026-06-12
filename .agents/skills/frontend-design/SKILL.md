---
name: frontend-design
description: Crea interfaces frontend distintivas, accesibles y de nivel de producción con una calidad de diseño excepcional. Diseñado para componentes web, landing pages, dashboards y aplicaciones interactivas. Evita estéticas genéricas de IA y genera interfaces memorables con código moderno y optimizado.
---

Esta habilidad guía la creación de interfaces frontend de vanguardia y listas para producción. El objetivo es romper con el diseño genérico automatizado ("AI slop") mediante la implementación de código real, funcional, meticulosamente detallado y estéticamente superior.

## 1. Pensamiento de Diseño y Contexto

Antes de escribir la primera línea de código, analiza los requisitos del usuario bajo este marco conceptual:
- **Propósito y Audiencia**: ¿Qué problema resuelve este componente/página y quién interactúa con él?
- **Dirección Estética Extrema**: Elige un enfoque de diseño claro y magnifícalo (ej. minimalismo sofisticado, brutalismo tecnológico, editorial de alta costura, retro-futurismo analógico, neomorfismo refinado o UI orgánica). No te quedes a medias.
- **Diferenciación Crucial**: Define el elemento "firma" (signature element) que hará que la interfaz sea inolvidable (una transición inesperada, una disposición de rejilla asimétrica, un micro-detalle visual).

## 2. Directrices de Estética y Desarrollo

### A. Tipografía y Composición Espacial
- **Jerarquía Tipográfica**: Evita fuentes genéricas del sistema si se permiten recursos externos. Combina fuentes de exhibición (display) con alta personalidad para encabezados y fuentes ultra-legibles para texto corrido.
- **Layouts Rompedores**: Utiliza CSS Grid y Flexbox de forma avanzada. Experimenta con asimetrías controladas, elementos que desbordan sus contenedores (grid-breaking), superposiciones elegantes y un uso estratégico del espacio negativo.

### B. Color, Texturas y Profundidad
- **Paletas con Intención**: Usa variables de entorno o clases de Tailwind con un contraste fuerte y un color de acento dominante. Evita los degradados lavanda/morados genéricos de la IA.
- **Capas Visuales**: Añade profundidad sutil mediante texturas de grano (noise overlays), mallas de gradiente (gradient meshes), efectos de desenfoque de fondo (backdrop-blur), sombras arquitectónicas y bordes de un solo píxel altamente definidos.

### C. Animación y Movimiento Responsivo
- **Micro-interacciones**: Diseña estados hover, focus y active que se sientan orgánicos y responsivos (usa curvas Bézier personalizadas en lugar de transiciones lineales).
- **Coreografía de Carga**: Implementa animaciones de entrada escalonadas (staggered entrance) utilizando CSS puro o librerías de movimiento (como Framer Motion / Motion para React) cuando el entorno lo permita.

### D. Restricciones Técnicas y Calidad de Código
- **Accesibilidad (WCAG)**: La audacia visual NUNCA debe comprometer la legibilidad. Asegura contrastes correctos, etiquetas ARIA semánticas y navegabilidad por teclado completa.
- **Clean Code & Frameworks**: Genera código modular, semántico y fácil de integrar. Si se solicita Tailwind CSS, utiliza clases limpias, configuraciones extendidas si es necesario y evita la redundancia.

## 3. Lo que NUNCA debes hacer
- *Nunca* generes componentes clonados con la típica estética de plantilla Bootstrap antigua.
- *Nunca* abuses de los mismos recursos en cada generación (ej. no uses siempre la fuente "Space Grotesk" o temas oscuros con luces de neón por defecto). Varía drásticamente tu portafolio de estilos.

## 4. Estructura de la Respuesta

Para mantener la claridad técnica, responde estructurando tu salida de la siguiente manera:
1. **El Concepto (Breve)**: Explica en 2 o 3 líneas la dirección estética elegida y el elemento diferenciador.
2. **Código de Producción**: Entrega los bloques de código (HTML/CSS, React + Tailwind, etc.) limpios, comentados en sus puntos críticos y listos para usar.
3. **Notas de Implementación**: Detalles breves sobre dependencias necesarias o consideraciones de accesibilidad.