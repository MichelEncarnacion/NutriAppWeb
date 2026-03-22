// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(undefined); // undefined = cargando
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Carga el perfil extendido del usuario desde la tabla `perfiles` ──
    const cargarPerfil = async (userId) => {
        const { data: perfilData, error: perfilError } = await supabase
            .from("perfiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (perfilError) {
            console.error("Error cargando perfil:", perfilError.message);
            return null;
        }

        // acepto_terminos vive en diagnosticos, no en perfiles.
        // .maybeSingle() maneja correctamente el caso de usuario nuevo
        // sin diagnóstico (retorna null en lugar de error).
        const { data: diagData } = await supabase
            .from("diagnosticos")
            .select("acepto_terminos")
            .eq("perfil_id", userId)
            .maybeSingle();

        return {
            ...perfilData,
            acepto_terminos: diagData?.acepto_terminos ?? false,
        };
    };

    const recargarPerfil = async () => {
        if (!session?.user) return false;
        const p = await cargarPerfil(session.user.id);
        if (p) {
            setPerfil(p);
            return true;
        }
        return false;
    };

    useEffect(() => {
        // 1. Sesión inicial (cuando el usuario ya tenía sesión guardada)
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                const p = await cargarPerfil(session.user.id);
                setPerfil(p);
            }
            setLoading(false);
        });

        // 2. Escucha cambios: login, logout, token refresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                if (session?.user) {
                    const p = await cargarPerfil(session.user.id);
                    setPerfil(p);
                } else {
                    setPerfil(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // ── Helpers de autenticación ──────────────────────────────────────────

    const loginConEmail = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const loginConGoogle = () =>
        supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

    const loginConFacebook = () =>
        supabase.auth.signInWithOAuth({
            provider: "facebook",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });

    const registrar = (email, password) =>
        supabase.auth.signUp({ email, password });

    const cerrarSesion = () => supabase.auth.signOut();

    const actualizarPerfil = async (datos) => {
        if (!session?.user) return;
        const { data, error } = await supabase
            .from("perfiles")
            .update(datos)
            .eq("id", session.user.id)
            .select()
            .single();
        if (!error) {
            // Preservar acepto_terminos que viene de diagnosticos,
            // no del objeto perfiles retornado por Supabase.
            setPerfil({
                ...data,
                acepto_terminos: perfil?.acepto_terminos ?? false,
            });
        }
        return { data, error };
    };

    // ── Helpers de estado del usuario ────────────────────────────────────

    // ¿El usuario ya aceptó términos y condiciones?
    const aceptoTerminos = perfil?.acepto_terminos ?? false;

    // ¿El usuario ya completó el diagnóstico?
    // Lo guardamos como campo en perfiles para no hacer query extra
    const completoDiagnostico = perfil?.diagnostico_completado ?? false;

    // Rol del usuario: 'demo' | 'freemium' | 'premium' | 'admin'
    const rol = perfil?.tipo_usuario ?? null;

    const esPremium = rol === "premium" || rol === "demo";
    const esAdmin = rol === "admin";

    const value = {
        session,
        perfil,
        loading,
        rol,
        esPremium,
        esAdmin,
        aceptoTerminos,
        completoDiagnostico,
        loginConEmail,
        loginConGoogle,
        loginConFacebook,
        registrar,
        cerrarSesion,
        actualizarPerfil,
        cargarPerfil,
        recargarPerfil,
    };

    // Mientras resuelve la sesión inicial no renderiza nada
    if (loading) return null;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook interno — no exportar directamente, usar useAuth
export { AuthContext };