// src/lib/analytics.js
// Wrapper delgado sobre PostHog. Si VITE_POSTHOG_KEY no está configurado,
// todas las funciones son no-ops silenciosos.

import posthog from "posthog-js";

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

let initialized = false;

export function initAnalytics() {
    if (!KEY) return;
    posthog.init(KEY, {
        api_host: HOST,
        person_profiles: "identified_only",
        capture_pageview: false,      // lo manejamos manualmente con React Router
        capture_pageleave: true,
        autocapture: false,           // solo eventos explícitos
        persistence: "localStorage",
        loaded(ph) {
            if (import.meta.env.MODE !== "production") ph.opt_out_capturing();
        },
    });
    initialized = true;
}

/** Identifica al usuario autenticado */
export function identifyUser(userId, properties = {}) {
    if (!initialized) return;
    posthog.identify(userId, properties);
}

/** Desvincula al usuario (al cerrar sesión) */
export function resetUser() {
    if (!initialized) return;
    posthog.reset();
}

/** Registra un page view manualmente (llamar en cada cambio de ruta) */
export function trackPageView(path) {
    if (!initialized) return;
    posthog.capture("$pageview", { $current_url: path });
}

/** Registra un evento personalizado */
export function track(event, properties = {}) {
    if (!initialized) return;
    posthog.capture(event, properties);
}

// ── Eventos nombrados de NutriiApp ───────────────────────────────────────

export const Events = {
    // Auth
    LOGIN:              "user_login",
    REGISTER:           "user_register",
    LOGOUT:             "user_logout",
    PASSWORD_RESET:     "password_reset_requested",

    // Onboarding
    TERMINOS_ACEPTADOS: "terminos_aceptados",
    DIAGNOSTICO_COMPLETADO: "diagnostico_completado",

    // Plan
    PLAN_GENERADO:      "plan_generado",
    PLAN_REGENERADO:    "plan_regenerado",
    PLAN_VENCIDO_VISTO: "plan_vencido_visto",

    // Lecciones
    LECCION_ABIERTA:    "leccion_abierta",
    LECCION_COMPLETADA: "leccion_completada",

    // Perfil
    PERFIL_ACTUALIZADO: "perfil_actualizado",

    // Seguimiento
    SEGUIMIENTO_GUARDADO: "seguimiento_guardado",
};
