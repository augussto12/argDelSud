import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './modules/auth/authStore';
import MainLayout from './shared/components/layout/MainLayout';
import LoginPage from './modules/auth/LoginPage';
import DashboardPage from './modules/dashboard/DashboardPage';
import AlumnosPage from './modules/alumnos/AlumnosPage';
import ProfesoresPage from './modules/profesores/ProfesoresPage';
import TalleresPage from './modules/talleres/TalleresPage';
import AsistenciaPage from './modules/asistencia/AsistenciaPage';
import TesoreriaPage from './modules/tesoreria/TesoreriaPage';
import BecasPage from './modules/becas/BecasPage';
import UsuariosPage from './modules/usuarios/UsuariosPage';
import AuditoriaPage from './modules/auditoria/AuditoriaPage';
import MetricasPage from './modules/metricas/MetricasPage';

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
    </BrowserRouter>
  );
}
