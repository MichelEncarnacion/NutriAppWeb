// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protege rutas verificando:
 *  1. Que haya sesión activa
 *  2. Que el usuario haya aceptado T&C (si requireTerminos=true)
 *  3. Que el usuario haya completado el diagnóstico (si requireDiagnostico=true)
 *  4. Que el rol del usuario esté en la lista `roles` permitidos
 *
 * Uso:
 *
 *   // Solo requiere sesión
 *   <PrivateRoute><MiPlan /></PrivateRoute>
 *
 *   // Solo para premium y demo
 *   <PrivateRoute roles={["premium", "demo"]}><Progreso /></PrivateRoute>
 *
 *   // Solo para admins
 *   <PrivateRoute roles={["admin"]}><DashboardAdmin /></PrivateRoute>
 */
export default function PrivateRoute({
    children,
    roles = [],               // [] = cualquier usuario autenticado
    requireTerminos = true,   // Redirige a /terminos si no aceptó
    requireDiagnostico = true, // Redirige a /diagnostico si no completó
}) {
    const {
        session,
        rol,
        aceptoTerminos,
        completoDiagnostico,
    } = useAuth();

    const location = useLocation();

    // 1. Sin sesión → Login
    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Sin T&C aceptados → Términos
    //    (excepto si ya estamos en /terminos para evitar loop)
    if (requireTerminos && !aceptoTerminos && location.pathname !== "/terminos") {
        return <Navigate to="/terminos" replace />;
    }

    // 3. Sin diagnóstico → Diagnóstico
    //    (solo si ya aceptó T&C para no saltarse ese paso)
    if (
        requireDiagnostico &&
        aceptoTerminos &&
        !completoDiagnostico &&
        location.pathname !== "/diagnostico"
    ) {
        return <Navigate to="/diagnostico" replace />;
    }

    // 4. Rol no permitido → Página de acceso denegado o redirige al home
    if (roles.length > 0 && !roles.includes(rol)) {
        // Si es freemium intentando entrar a Progreso → redirige al panel
        // con un query param para mostrar el modal de upgrade
        if (rol === "freemium" && roles.includes("premium")) {
            return <Navigate to="/panel?upgrade=true" replace />;
        }
        // Para cualquier otro caso sin permiso
        return <Navigate to="/panel" replace />;
    }

    return children;
}

/**
 * Variante para rutas de admin — más estricta, no verifica T&C ni diagnóstico
 * porque el admin tiene un flujo completamente separado.
 */
export function AdminRoute({ children }) {
    const { session, esAdmin } = useAuth();
    const location = useLocation();

    if (!session) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!esAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

/**
 * Ruta pública — redirige al panel si el usuario YA tiene sesión.
 * Útil para /login y /registro: si ya estás logueado, no tiene sentido verlos.
 */
export function PublicOnlyRoute({ children }) {
    const { session, aceptoTerminos, completoDiagnostico } = useAuth();

    if (session) {
        if (!aceptoTerminos) return <Navigate to="/terminos" replace />;
        if (!completoDiagnostico) return <Navigate to="/diagnostico" replace />;
        return <Navigate to="/panel" replace />;
    }

    return children;
}