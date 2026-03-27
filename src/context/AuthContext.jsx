// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

// Races a promise against a timeout; resolves to fallback if it times out.
const withTimeout = (promise, ms, fallback = null) =>
    Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
    ]);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(undefined); // undefined = cargando
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Carga el perfil extendido del usuario desde la tabla `perfiles` ──
    const cargarPerfil = async (userId, session) => {
        // Los admins no tienen fila en perfiles — no consultamos
        if (session?.user?.app_metadata?.role === "admin") return null;

        // Ambas queries en paralelo, con timeout de 8s para evitar cuelgues
        const result = await withTimeout(
            Promise.all([
                supabase.from("perfiles").select("*").eq("id", userId).single(),
                supabase.from("diagnosticos").select("acepto_terminos").eq("perfil_id", userId).maybeSingle(),
            ]),
            8_000,
            null, // fallback si hay timeout
        );

        if (!result) {
            console.warn("cargarPerfil: timeout o sin respuesta");
            return null;
        }

        const [{ data: perfilData, error: perfilError }, { data: diagData }] = result;

        if (perfilError) {
            console.error("Error cargando perfil:", perfilError.message);
            return null;
        }

        return {
            ...perfilData,
            acepto_terminos: diagData?.acepto_terminos ?? false,
        };
    };

    const recargarPerfil = async () => {
        if (!session?.user) return false;
        const p = await cargarPerfil(session.user.id, session);
        if (p) {
            setPerfil(p);
            return true;
        }
        return false;
    };

    // Marca el diagnóstico como completado en el estado local sin ir a la DB.
    // Usado por Diagnostico.jsx para navegar inmediatamente sin esperar el trigger.
    const marcarDiagnosticoCompletado = () => {
        setPerfil((prev) => prev ? {
            ...prev,
            diagnostico_completado: true,
            acepto_terminos: true,
        } : prev);
    };

    useEffect(() => {
        let mounted = true;

        // 1. Sesión inicial — race contra timeout de 10s para evitar cuelgue en token refresh
        const initSession = async () => {
            try {
                const result = await withTimeout(
                    supabase.auth.getSession(),
                    10_000,
                    { data: { session: null } },
                );
                if (!mounted) return;
                const { data: { session } } = result;
                setSession(session);
                if (session?.user) {
                    const p = await cargarPerfil(session.user.id, session);
                    if (mounted) setPerfil(p);
                }
            } catch (e) {
                console.error("Error cargando sesión inicial:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        initSession();

        // 2. Escucha cambios: login, logout, token refresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                // TOKEN_REFRESHED solo renueva el JWT — el perfil no cambia.
                // Re-cargar el perfil aquí causa redirects falsos si la query
                // tarda más de 8s (tab inactiva → browser throttling → timeout → perfil=null).
                if (event === 'TOKEN_REFRESHED') {
                    setSession(session);
                    return;
                }

                // Mostrar spinner mientras se carga el perfil para evitar
                // que PrivateRoute redirija con perfil = null (race condition)
                if (mounted) setLoading(true);
                try {
                    setSession(session);
                    if (session?.user) {
                        const p = await cargarPerfil(session.user.id, session);
                        if (mounted) setPerfil(p);
                    } else {
                        setPerfil(null);
                    }
                } catch (e) {
                    console.error("Error en authStateChange:", e);
                } finally {
                    if (mounted) setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
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

    // Admin se detecta desde el JWT (app_metadata), no desde perfiles
    const esAdmin = session?.user?.app_metadata?.role === "admin";

    // Rol del usuario: 'demo' | 'freemium' | 'premium' (solo usuarios normales)
    const rol = perfil?.tipo_usuario ?? null;

    const esPremium = rol === "premium" || rol === "demo";

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
        marcarDiagnosticoCompletado,
    };

    // Mientras resuelve la sesión inicial muestra pantalla de carga
    if (loading) return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#3DDC84] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook interno — no exportar directamente, usar useAuth
export { AuthContext };