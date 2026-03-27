# Prompt para Claude Code — NutriiApp

> Copia y pega esto en Claude Code. Puedes enviarlo completo o por fases (usa los bloques `## FASE X` como cortes naturales).

---

Eres el desarrollador principal de **NutriiApp**, una aplicación de nutrición personalizada con IA. El stack es:

- **Frontend:** React (Vite) con React Router v6
- **Backend/Auth/DB:** Supabase (Auth, Postgres, RLS, Edge Functions, Realtime)
- **IA:** Google Gemini API para generación de planes nutricionales
- **Notificaciones:** Firebase Cloud Messaging (FCM)
- **Estilo:** Tailwind CSS (mobile-first, responsive)

---

## CONTEXTO DE NEGOCIO

NutriiApp genera planes nutricionales personalizados con IA. El usuario responde un formulario diagnóstico de 24 preguntas, la IA genera un plan de 15 días, y cada quincena el usuario llena un seguimiento para que la IA regenere su plan adaptado.

---

## FASE 1 — Modelo de datos y roles en Supabase

Configura el schema SQL en Supabase con estas tablas y reglas:

### Tablas principales:

1. **`perfiles`** — Datos del usuario final. Incluye campo `tipo_usuario` con valores posibles: `'demo'`, `'freemium'`, `'premium'`. También: `nombre`, `email`, `avatar_url`, `acepto_terminos` (boolean), `fecha_registro`, `fecha_expiracion_demo` (nullable).
2. **`administradores`** — Tabla separada para admins. Los admins NO aparecen en `perfiles`. Campos: `id`, `nombre`, `email`, `rol` (text), `created_at`.
3. **`diagnosticos`** — Respuestas del formulario inicial de 24 preguntas. Campos clave: datos biométricos (peso, estatura, edad, sexo), objetivo nutricional, nivel de actividad, hábitos alimenticios, restricciones médicas, alergias, enfermedades[] (array de texto), presupuesto quincenal, acepto_terminos (boolean). FK a `perfiles.id`.
4. **`planes`** — Planes nutricionales generados por Gemini. Campos: `id`, `perfil_id` (FK), `contenido_json` (jsonb con el plan estructurado), `prompt_enviado` (text), `respuesta_ia` (text), `estado` (enum: 'generando', 'listo', 'error'), `fecha_inicio`, `fecha_fin`, `es_activo` (boolean), `created_at`.
5. **`seguimientos`** — Formulario quincenal. Campos: `perfil_id` (FK), `peso_actual`, `porcentaje_grasa` (nullable), `satisfaccion_plan` (1-5), `platillos_favoritos` (text[]), `platillos_no_gustados` (text[]), `cambios_actividad` (text), `cambios_salud` (text), `fuente_datos` (enum: 'manual', 'healthkit', 'google_fit', 'nutriipoint_qr'), `created_at`.
6. **`metricas`** — Registro histórico para el panel Progreso. Campos: `perfil_id`, `fecha`, `peso`, `porcentaje_grasa`, `porcentaje_musculo`, `calorias_consumidas`, `agua_ml`, `comidas_completadas` (int).
7. **`lecciones`** — Contenido educativo. Campos: `id`, `titulo`, `contenido` (markdown/HTML), `orden` (int), `activa` (boolean), `created_at`.
8. **`lecciones_usuario`** — Progreso del usuario en lecciones. Campos: `perfil_id`, `leccion_id`, `estado` (enum: 'bloqueada', 'disponible', 'en_progreso', 'completada'), `fecha_completada`, `fecha_disponible`.
9. **`dispositivos`** — Control de sesiones. Campos: `perfil_id`, `device_id`, `token_fcm`, `ultima_sesion`, `activo` (boolean).
10. **`notificaciones`** — Log de notificaciones enviadas. Campos: `id`, `titulo`, `cuerpo`, `tipo` (enum: 'comida', 'leccion', 'seguimiento', 'masiva', 'sistema'), `destinatario_id` (nullable, null = masiva), `segmento` (nullable), `enviada_at`, `leida` (boolean).
11. **`invitaciones_demo`** — Links de invitación para los 100 usuarios demo. Campos: `id`, `codigo` (unique), `usado_por` (FK nullable a perfiles), `creado_por` (FK a administradores), `fecha_uso`, `activo` (boolean), `created_at`.

### Roles y RLS:

- **Admin:** Se identifica por un custom claim en el JWT: `auth.jwt() ->> 'role' = 'admin'`. Crea una **Supabase Edge Function** que al crear una cuenta admin setee el claim `{ role: 'admin' }` en el JWT.
- **Políticas RLS por perfil:**
  - Todos los usuarios pueden leer/escribir sus propios datos en `perfiles`, `diagnosticos`, `seguimientos`, `metricas`.
  - **Freemium:** RLS bloquea consultas a `metricas` (verificar `tipo_usuario IN ('premium', 'demo')`). Limita planes a 1 por mes (verificar con count en `planes` del mes actual).
  - **Premium:** Sin restricciones sobre sus propios datos.
  - **Demo:** Acceso completo temporalmente. Cuando expira, el admin cambia `tipo_usuario` a `'freemium'`.
  - **Admin:** Las políticas RLS usan `auth.jwt() ->> 'role' = 'admin'` para dar acceso total de lectura a todas las tablas. No puede modificar planes activos de usuarios sin que se registre en un log de auditoría.

Genera el archivo SQL completo con CREATE TABLE, tipos enum, foreign keys, índices, y todas las políticas RLS.

---

## FASE 2 — Autenticación y Onboarding

Implementa el flujo completo de registro y primera vez:

### Pantallas en orden:

1. **Pantalla de Bienvenida** — Logo + tagline + dos botones: "Registrarme" / "Ya tengo cuenta".
2. **Registro** — Email + contraseña, o OAuth con Google/Facebook. Verificación de email con Supabase Auth.
3. **Términos y Condiciones** — Pantalla obligatoria. El usuario DEBE aceptar para continuar. Guardar `acepto_terminos = true` en `diagnosticos`.
4. **Formulario de Diagnóstico** — 24 preguntas divididas en secciones: biométricos, objetivo, actividad, hábitos, restricciones médicas, presupuesto quincenal. UX tipo wizard (paso a paso con barra de progreso).
5. **Aviso Médico (condicional)** — Si el array `enfermedades[]` no está vacío, mostrar una pantalla informativa recomendando acudir a un profesional de salud. Botón "Entendido" para continuar. No bloquea el flujo.
6. **Pantalla de carga "Generando tu plan..."** — Llamar al endpoint de Gemini. Timeout máximo 60 segundos. Si falla: mostrar error con botón "Reintentar".
7. **Panel General (Home)** — El usuario llega a su home. Iniciar contadores: 7 días para primera lección disponible, 15 días para primer seguimiento.

### Control de sesiones:

- Máximo 1 sesión activa por cuenta (excepto admin: 2 sesiones).
- Al hacer login en un nuevo dispositivo, cerrar la sesión anterior automáticamente usando la tabla `dispositivos`.

### Rutas protegidas:

- Usa `<PrivateRoute>` con React Router.
- Ruta `/admin` protegida verificando el custom claim `role: 'admin'` del JWT.
- Usuarios no autenticados → redirect a `/login`.
- Usuarios sin diagnóstico completado → redirect a `/onboarding`.

---

## FASE 3 — Funcionalidades del Usuario (Panel General, Mi Plan, Lecciones, Progreso)

### Panel General (Home):

- KPIs del día: calorías consumidas, comidas completadas, agua bebida, racha activa (días consecutivos).
- Card de lección activa con acceso directo.
- Métricas recientes (peso, tendencia).
- Nota: Freemium NO ve métricas completas — mostrar versión limitada con CTA a Premium.

### Mi Plan:

- Muestra las comidas del día actual del plan activo.
- El usuario puede marcar comidas como completadas (checkbox que actualiza `metricas`).
- **Bloqueo de captura de pantalla:** Implementar con flags nativos si es React Native/Flutter. En web, aplicar CSS `user-select: none`, deshabilitar clic derecho, y técnicas de detección de DevTools (ofuscación en producción).
- **Freemium:** Solo puede ver 1 plan por mes. Si ya tiene uno activo, mostrar mensaje con CTA Premium.
- **Premium:** Planes ilimitados (nuevo plan cada 15 días con seguimiento).

### Lecciones:

- Lista de lecciones con estado visual: completada ✅, en progreso 🔵, bloqueada 🔒.
- Solo una lección disponible a la vez. Las siguientes se desbloquean 7 días después de completar la anterior.
- Al completar una lección, registrar en `lecciones_usuario`.
- Contenido en formato markdown renderizado.

### Panel de Progreso (solo Demo y Premium):

- Gráficas con Recharts o Chart.js: peso histórico, % grasa, % músculo.
- Historial de registros de `metricas`.
- **Freemium:** Pantalla bloqueada con overlay y CTA "Hazte Premium para ver tu progreso".

---

## FASE 4 — Seguimiento Quincenal y Regeneración con IA

### Flujo:

1. A los 15 días de generar el último plan, activar el formulario de seguimiento.
2. Enviar notificación push via FCM: "Es momento de actualizar tu plan".
3. **Formulario de seguimiento:** peso actual, % grasa (opcional), satisfacción con plan (1-5), platillos favoritos, platillos no gustados, cambios en actividad/salud.
4. Fuentes de datos: entrada manual, HealthKit (iOS), Google Fit (Android), escáner QR de Nutriipoint.
5. **Regeneración del plan:** Enviar a Gemini el diagnóstico original + respuestas de seguimiento + métricas del panel Progreso. Generar nuevo plan de 15 días.
6. El plan anterior pasa a la bitácora (campo `es_activo = false`).
7. Reiniciar el contador de 15 días.

### Prompt a Gemini:

Crea un endpoint backend (puede ser Supabase Edge Function o un servicio Node.js/FastAPI) que:

- Arme el prompt con: datos del diagnóstico + seguimiento más reciente + historial de métricas + plan anterior.
- Envíe a la API de Gemini.
- Parsee la respuesta y la guarde en `planes` como JSON estructurado.
- Maneje errores (timeout, respuesta inválida) con estado `'error'` y opción de regenerar desde admin.

---

## FASE 5 — Notificaciones Push (FCM)

Implementa 4 tipos de notificaciones automáticas:

1. **Comida:** Recordatorio en el horario de cada comida del plan del usuario.
2. **Lección:** A los 7 días de completar la lección actual, notificar que hay nueva lección disponible.
3. **Seguimiento:** A los 15 días, notificar que debe llenar el formulario de seguimiento.
4. **Masiva (admin):** El admin puede enviar notificaciones a: todos, por segmento (freemium/premium), o a un usuario específico. Máximo 1 envío masivo por día.

Usa Firebase Cloud Messaging. Almacena el `token_fcm` en la tabla `dispositivos`. Registra cada envío en la tabla `notificaciones`.

---

## FASE 6 — Panel de Administración

Ruta: `/admin` — protegida con verificación del custom claim `role: 'admin'`.

### 8 secciones del panel admin:

1. **Dashboard principal** — Métricas globales en tiempo real (usar Supabase Realtime): usuarios activos, planes generados hoy, tasa de adherencia promedio, errores de IA, lecciones completadas.
2. **Gestión de usuarios** — Tabla con búsqueda y filtros (demo/freemium/premium). Acciones: cambiar tipo de usuario, desactivar cuentas. No puede eliminar usuarios con planes activos.
3. **Gestión de planes** — Lista de todos los planes generados. Ver prompt enviado a Gemini y respuesta completa. Estado (generando/listo/error). Regenerar plan si hubo error (con log de auditoría).
4. **Gestión de lecciones** — CRUD completo: crear, editar, publicar, reordenar (drag & drop). Activar/desactivar. Estadística: cuántos usuarios han completado cada lección.
5. **Notificaciones masivas** — Formulario para redactar y enviar push por segmento o a usuario específico. Límite: 1 masiva por día.
6. **Métricas de adherencia** — Gráficas de adherencia promedio por semana. Lista de usuarios con adherencia < 50% para intervención.
7. **Reportes de IA** — Ver todos los prompts enviados y respuestas de Gemini. Detectar errores o contenido inapropiado. Opción de ajustar el prompt base.
8. **Invitaciones Demo** — Generar los 100 links de invitación. Ver cuáles se han usado. Extender o revocar acceso demo.

---

## FASE 7 — Seguridad

Implementa estas reglas de seguridad:

- **1 sesión por dispositivo:** Al login en nuevo dispositivo, cerrar la anterior. Controlar con tabla `dispositivos`.
- **Sin captura de pantalla en "Mi Plan":** Flags nativos en mobile. En web: `user-select: none`, no right-click, detección de DevTools, ofuscación del build de producción.
- **Aviso médico automático:** Si `enfermedades[]` no está vacío → mostrar aviso antes del plan.
- **Términos obligatorios:** `acepto_terminos = true` en `diagnosticos` es requisito para que el backend genere el plan.
- **Freemium sin Progreso:** RLS verifica `tipo_usuario IN ('premium', 'demo')` para acceder a `metricas`.
- **Protección de consola en web:** En producción, ofuscar código con Vite y deshabilitar DevTools con técnicas de detección en el cliente.
- **Log de auditoría para admin:** Cualquier acción del admin sobre datos de usuarios debe quedar registrada.

---

## CONVENCIONES DE CÓDIGO

- Componentes React funcionales con hooks.
- Organización de carpetas: `src/pages/`, `src/components/`, `src/hooks/`, `src/lib/` (Supabase client, helpers), `src/context/` (AuthContext, UserContext).
- Supabase client inicializado en `src/lib/supabase.js`.
- Todas las consultas a Supabase deben pasar por RLS (nunca usar service_role key en el frontend).
- Variables de entorno en `.env` para: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, `VITE_FIREBASE_CONFIG`.
- Manejo de errores con try/catch y feedback visual al usuario (toasts o alerts).
- Mobile-first con Tailwind. Breakpoints: mobile default, `md:` para tablet, `lg:` para desktop.

---

Comienza por la **FASE 1** (schema SQL y RLS en Supabase). Genera el archivo SQL completo listo para ejecutar en el SQL Editor de Supabase. Después continuamos fase por fase.
