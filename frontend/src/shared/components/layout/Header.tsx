import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../hooks/useUIStore';
import { useAuthStore } from '../../../modules/auth/authStore';
import { Menu, Moon, Sun, ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/alumnos': 'Alumnos',
  '/profesores': 'Profesores',
  '/talleres': 'Talleres',
  '/asistencia': 'Asistencia',
  '/tesoreria': 'Tesorería',
  '/becas': 'Becas',
  '/metricas': 'Métricas',
  '/auditoria': 'Auditoría',
  '/usuarios': 'Usuarios',
};

export default function Header() {
  const { toggleMobileSidebar, theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const currentLabel = routeLabels[location.pathname] || 'Página';

  return (
    <header className="sticky top-0 z-20 h-16 bg-card border-b border-card flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: hamburger (mobile only) + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-colors cursor-pointer shrink-0">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-1.5 min-w-0">
          <ChevronRight size={14} className="text-secondary-300 shrink-0 hidden sm:block" />
          <h2 className="text-sm font-semibold text-heading truncate">{currentLabel}</h2>
        </div>
      </div>

      {/* Right: theme toggle + user */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme}
          className="p-2 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-colors cursor-pointer"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-card">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-primary-400 flex items-center justify-center text-[11px] font-bold text-white">
            {user?.nombre?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="text-xs">
            <p className="text-heading font-medium leading-tight">{user?.nombre}</p>
            <p className="text-muted capitalize">{user?.rol}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
