// src/lib/sentry.js
import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
    if (!DSN) return; // Deshabilitado si no hay DSN configurado

    Sentry.init({
        dsn: DSN,
        environment: import.meta.env.MODE, // "development" | "production"
        release: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
        // Captura el 100% de errores, 10% de trazas de performance
        tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 0,
        // No enviar errores en desarrollo local
        enabled: import.meta.env.MODE === "production",
        // Ignorar errores irrelevantes
        ignoreErrors: [
            "ResizeObserver loop limit exceeded",
            "Non-Error promise rejection captured",
            "Load failed",
            "NetworkError",
            "AbortError",
        ],
        beforeSend(event) {
            // No capturar errores de cancelación de fetch (AbortController)
            if (event.exception?.values?.[0]?.value?.includes("aborted")) return null;
            return event;
        },
    });
}

export { Sentry };
