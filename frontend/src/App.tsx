import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/hooks/useAuthStore';
import MainLayout from './shared/components/layout/MainLayout';
import PageLoader from './shared/components/PageLoader';
import ErrorBoundary from './shared/components/ErrorBoundary';

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

function RoleRoute({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.rol)) return <Navigate to="/" replace />;
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
                <ErrorBoundary>
                  <MainLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            {/* Acceso: todos los roles */}
            <Route path="/" element={<RoleRoute roles={['superadmin', 'admin']}><DashboardPage /></RoleRoute>} />
            <Route path="/alumnos" element={<AlumnosPage />} />
            <Route path="/profesores" element={<ProfesoresPage />} />
            <Route path="/talleres" element={<TalleresPage />} />
            <Route path="/asistencia" element={<AsistenciaPage />} />

            {/* Acceso: admin + superadmin */}
            <Route path="/tesoreria" element={<RoleRoute roles={['superadmin', 'admin']}><TesoreriaPage /></RoleRoute>} />
            <Route path="/becas" element={<RoleRoute roles={['superadmin', 'admin']}><BecasPage /></RoleRoute>} />
            <Route path="/metricas" element={<RoleRoute roles={['superadmin', 'admin']}><MetricasPage /></RoleRoute>} />

            {/* Acceso: solo superadmin */}
            <Route path="/auditoria" element={<RoleRoute roles={['superadmin']}><AuditoriaPage /></RoleRoute>} />
            <Route path="/usuarios" element={<RoleRoute roles={['superadmin']}><UsuariosPage /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

