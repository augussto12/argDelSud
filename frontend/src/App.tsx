import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/hooks/useAuthStore';
import MainLayout from './shared/components/layout/MainLayout';
import PageLoader from './shared/components/PageLoader';

// Lazy-loaded page modules (code-split per route)
const LoginPage = lazy(() => import('./modules/auth/LoginPage'));
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage'));
const AlumnosPage = lazy(() => import('./modules/alumnos/AlumnosPage'));
const ProfesoresPage = lazy(() => import('./modules/profesores/ProfesoresPage'));
const TalleresPage = lazy(() => import('./modules/talleres/TalleresPage'));
const AsistenciaPage = lazy(() => import('./modules/asistencia/AsistenciaPage'));
const TesoreriaPage = lazy(() => import('./modules/tesoreria/TesoreriaPage'));
const BecasPage = lazy(() => import('./modules/becas/BecasPage'));
const UsuariosPage = lazy(() => import('./modules/usuarios/UsuariosPage'));
const AuditoriaPage = lazy(() => import('./modules/auditoria/AuditoriaPage'));
const MetricasPage = lazy(() => import('./modules/metricas/MetricasPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/alumnos" element={<AlumnosPage />} />
            <Route path="/profesores" element={<ProfesoresPage />} />
            <Route path="/talleres" element={<TalleresPage />} />
            <Route path="/asistencia" element={<AsistenciaPage />} />
            <Route path="/tesoreria" element={<TesoreriaPage />} />
            <Route path="/becas" element={<BecasPage />} />
            <Route path="/metricas" element={<MetricasPage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
