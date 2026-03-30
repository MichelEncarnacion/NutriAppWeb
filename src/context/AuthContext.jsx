// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { identifyUser, resetUser } from "../lib/analytics";

const AuthContext = createContext(null);

// Races a promise against a timeout. AbortErrors se convierten en fallback.
const withTimeout = (promise, ms, fallback = null) =>
    Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
    ]).catch((e) => {
        if (e?.name === "AbortError") return fallback;
        throw e;
    });

// Pausa ms milisegundos.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function AuthProvider({ children }) {
    const [session, setSession] = useState(undefined); // undefined = cargando
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    // true  → ya tenemos perfil válido
    const perfilCargadoRef = useRef(false);
    // true  → hay una carga de perfil en curso (evita llamadas duplicadas)
    const cargandoPerfilRef = useRef(false);

    // ── Carga el perfil extendido del usuario desde la tabla `perfiles` ──
    // Usa fetch directamente con el access_token ya obtenido, evitando que
    // supabase.from() vuelva a adquirir el Web Lock (causa de los timeouts
    // al recargar la página).
    const cargarPerfil = async (userId, session) => {
        // Los admins no tienen fila en perfiles — no consultamos
        if (session?.user?.app_metadata?.role === "admin") return null;

        const token = session?.access_token;
        if (!token) return null;

        const base = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const headers = {
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
            "Content-Type": "application/json",
        };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8_000);

        try {
            const [perfilRes, diagRes] = await Promise.all([
                fetch(`${base}/rest/v1/perfiles?id=eq.${userId}&select=*`, { headers, signal: controller.signal }),
                fetch(`${base}/rest/v1/diagnosticos?perfil_id=eq.${userId}&select=acepto_terminos&limit=1`, { headers, signal: controller.signal }),
            ]);
            clearTimeout(timer);

            if (!perfilRes.ok) {
                console.error("Error cargando perfil:", perfilRes.status);
                return null;
            }

            const [perfiles, diagnosticos] = await Promise.all([
                perfilRes.json(),
                diagRes.json(),
            ]);

            const perfilData = perfiles[0];
            if (!perfilData) return null;

            return {
                ...perfilData,
                acepto_terminos: diagnosticos[0]?.acepto_terminos ?? false,
            };
        } catch (e) {
            clearTimeout(timer);
            if (e?.name !== "AbortError") console.error("Error cargando perfil:", e);
            return null;
        }
    };

    // Carga el perfil evitando llamadas duplicadas concurrentes.
    const cargarPerfilGuardado = async (userId, session) => {
        if (cargandoPerfilRef.current) return null;
        cargandoPerfilRef.current = true;
        try {
            return await cargarPerfil(userId, session);
        } finally {
            cargandoPerfilRef.current = false;
        }
    };

    const recargarPerfil = async () => {
        if (!session?.user) return false;
        try {
            const p = await cargarPerfil(session.user.id, session);
            if (p) {
                setPerfil(p);
                return true;
            }
        } catch {
            // errores transitorios — ignorar
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

        // 1. Sesión inicial — con retry si getSession() falla por AbortError.
        const initSession = async () => {
            try {
                let result = await withTimeout(
                    supabase.auth.getSession(),
                    10_000,
                    { data: { session: null } },
                );
                // Si no hay sesión puede ser AbortError — reintentamos tras 800ms.
                if (!result?.data?.session) {
                    await sleep(800);
                    if (!mounted) return;
                    result = await withTimeout(
                        supabase.auth.getSession(),
                        10_000,
                        { data: { session: null } },
                    );
                }
                if (!mounted) return;
                const { data: { session } } = result;
                setSession(session);
                if (session?.user) {
                    const p = await cargarPerfilGuardado(session.user.id, session);
                    if (mounted && p !== null) {
                        setPerfil(p);
                        perfilCargadoRef.current = true;
                    }
                }
            } catch (e) {
                if (e?.name !== "AbortError")
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
                if (event === 'TOKEN_REFRESHED') {
                    setSession(session);
                    return;
                }
                // INITIAL_SESSION: initSession lo maneja. Solo actuamos aquí
                // si initSession falló y el perfil todavía no está cargado.
                if (event === 'INITIAL_SESSION' && perfilCargadoRef.current) {
                    setSession(session);
                    return;
                }

                const yaTenePerfil = perfilCargadoRef.current;
                if (!yaTenePerfil && mounted) setLoading(true);
                try {
                    setSession(session);
                    if (session?.user) {
                        const p = await cargarPerfilGuardado(session.user.id, session);
                        if (mounted && p !== null) {
                            setPerfil(p);
                            perfilCargadoRef.current = true;
                            identifyUser(session.user.id, { email: session.user.email, rol: p?.tipo_usuario });
                        }
                    } else {
                        setPerfil(null);
                        perfilCargadoRef.current = false;
                        resetUser();
                    }
                } catch (e) {
                    console.error("Error en authStateChange:", e);
                } finally {
                    if (!yaTenePerfil && mounted) setLoading(false);
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
            setPerfil({
                ...data,
                acepto_terminos: perfil?.acepto_terminos ?? false,
            });
        }
        return { data, error };
    };

    // ── Helpers de estado del usuario ────────────────────────────────────

    const aceptoTerminos = perfil?.acepto_terminos ?? false;
    const completoDiagnostico = perfil?.diagnostico_completado ?? false;
    const esAdmin = session?.user?.app_metadata?.role === "admin";
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
