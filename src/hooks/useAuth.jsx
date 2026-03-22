// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook principal para acceder a la sesión y el perfil del usuario.
 *
 * Uso:
 *   const { session, perfil, rol, cerrarSesion } = useAuth();
 *
 * Propiedades disponibles:
 *   session              — Sesión de Supabase Auth (null si no hay sesión)
 *   perfil               — Fila de la tabla `perfiles` del usuario actual
 *   loading              — true mientras resuelve la sesión inicial
 *   rol                  — 'demo' | 'freemium' | 'premium' | 'admin' | null
 *   esPremium            — true si es demo o premium
 *   esAdmin              — true si es admin
 *   aceptoTerminos       — true si ya aceptó T&C
 *   completoDiagnostico  — true si ya completó el formulario de diagnóstico
 *
 * Métodos disponibles:
 *   loginConEmail(email, password)
 *   loginConGoogle()
 *   loginConFacebook()
 *   registrar(email, password)
 *   cerrarSesion()
 *   actualizarPerfil(datos)
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return context;
}