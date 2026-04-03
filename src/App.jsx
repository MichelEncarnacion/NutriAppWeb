// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute, { AdminRoute, PublicOnlyRoute } from "./components/privateRoute";

// ── Páginas de auth ──────────────────────────────────────────────────────
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import AuthCallback from "./pages/AuthCallback";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import OlvideContrasena from "./pages/OlvideContrasena";
import ResetContrasena from "./pages/ResetContrasena";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";

// ── Páginas de onboarding ────────────────────────────────────────────────
import Diagnostico from "./pages/Diagnostico";
import GenerandoPlan from "./pages/GenerandoPlan";
import Landing from "./pages/Landing";

// ── Páginas principales (usuario) ───────────────────────────────────────
import Panel from "./pages/Panel";
import MiPlan from "./pages/MiPlan";
import Lecciones from "./pages/Lecciones";
import Progreso from "./pages/Progreso";
import Seguimiento from "./pages/Seguimiento";
import ListaCompras from "./pages/ListaCompras";
import Perfil from "./pages/Perfil";

import NotFound from "./pages/NotFound";

// ── Panel admin ──────────────────────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminPlanes from "./pages/admin/AdminPlanes";
import AdminLecciones from "./pages/admin/AdminLecciones";

function AppRoutes() {
  return (
    <Routes>

          {/* ── Raíz ─────────────────────────────────────── */}
          <Route path="/" element={<Landing />} />

          {/* ── Auth (solo si NO hay sesión) ──────────────── */}
          <Route path="/login" element={
            <PublicOnlyRoute><Login /></PublicOnlyRoute>
          } />
          <Route path="/registro" element={
            <PublicOnlyRoute><Registro /></PublicOnlyRoute>
          } />

          {/* Documentos legales (acceso público) */}
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />

          {/* Callback de OAuth (Google / Facebook) y recovery de contraseña */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/olvide-contrasena" element={
            <PublicOnlyRoute><OlvideContrasena /></PublicOnlyRoute>
          } />
          <Route path="/reset-contrasena" element={<ResetContrasena />} />

          {/* ── Onboarding (requiere sesión, NO diagnóstico aún) ── */}
          <Route path="/terminos" element={
            <PrivateRoute requireTerminos={false} requireDiagnostico={false}>
              <TerminosCondiciones />
            </PrivateRoute>
          } />
          <Route path="/diagnostico" element={
            <PrivateRoute requireTerminos={false} requireDiagnostico={false}>
              <Diagnostico />
            </PrivateRoute>
          } />
          <Route path="/generando-plan" element={
            <PrivateRoute requireDiagnostico={false}>
              <GenerandoPlan />
            </PrivateRoute>
          } />

          {/* ── App principal ─────────────────────────────── */}
          <Route path="/panel" element={
            <PrivateRoute>
              <Panel />
            </PrivateRoute>
          } />
          <Route path="/mi-plan" element={
            <PrivateRoute>
              <MiPlan />
            </PrivateRoute>
          } />
          <Route path="/lecciones" element={
            <PrivateRoute>
              <Lecciones />
            </PrivateRoute>
          } />

          {/* Solo Demo y Premium pueden ver Progreso */}
          <Route path="/progreso" element={
            <PrivateRoute roles={["demo", "premium"]}>
              <Progreso />
            </PrivateRoute>
          } />

          <Route path="/seguimiento" element={
            <PrivateRoute>
              <Seguimiento />
            </PrivateRoute>
          } />
          <Route path="/lista-compras" element={
            <PrivateRoute>
              <ListaCompras />
            </PrivateRoute>
          } />
          <Route path="/perfil" element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          } />

          {/* ── Admin (flujo separado) ────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/usuarios" element={
            <AdminRoute><AdminUsuarios /></AdminRoute>
          } />
          <Route path="/admin/planes" element={
            <AdminRoute><AdminPlanes /></AdminRoute>
          } />
          <Route path="/admin/lecciones" element={
            <AdminRoute><AdminLecciones /></AdminRoute>
          } />

          {/* ── 404 ──────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}