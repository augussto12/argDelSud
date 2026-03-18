import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../hooks/useUIStore';
import { useAuthStore } from '../../hooks/useAuthStore';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  DollarSign,
  Award,
  Shield,
  LogOut,
  ChevronLeft,
  X,
  ScrollText,
  BarChart3,
} from 'lucide-react';
import escudo from '../../../assets/argdelsur.png';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alumnos', label: 'Alumnos', icon: Users },
  { to: '/profesores', label: 'Profesores', icon: GraduationCap },
  { to: '/talleres', label: 'Talleres', icon: Building2 },
  { to: '/asistencia', label: 'Asistencia', icon: ClipboardCheck },
  { to: '/tesoreria', label: 'Tesorería', icon: DollarSign },
  { to: '/becas', label: 'Becas', icon: Award },
  { to: '/metricas', label: 'Métricas', icon: BarChart3 },
  { to: '/auditoria', label: 'Auditoría', icon: ScrollText },
  { to: '/usuarios', label: 'Usuarios', icon: Shield },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Desktop sidebar width: open=256px, collapsed=72px
  // Mobile: full overlay drawer

  return (
    <>
      {/* ── Mobile overlay ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fadeIn" onClick={closeMobileSidebar} />
      )}

      {/* ── Mobile drawer (only on small screens) ── */}
      <aside className={`
        lg:hidden fixed top-0 left-0 h-screen z-50 w-72 flex flex-col bg-sidebar
        transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
              <img src={escudo} alt="ADS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white text-sm font-bold tracking-wide leading-tight">ARGENTINOS</p>
              <p className="text-accent-400/50 text-[10px] font-semibold tracking-[0.2em]">DEL SUD</p>
            </div>
          </div>
          <button onClick={closeMobileSidebar} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <NavList onNavClick={closeMobileSidebar} expanded location={location} />
        <UserSection expanded user={user} logout={logout} />
      </aside>

      {/* ── Desktop sidebar (only on lg+) ── */}
      <aside className={`
        hidden lg:flex fixed top-0 left-0 h-screen z-30 flex-col bg-sidebar
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-[72px]'}
      `}>
        {/* Desktop header */}
        <div className="flex items-center h-16 px-5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
              <img src={escudo} alt="ADS" className="w-full h-full object-contain" />
            </div>
            {sidebarOpen && (
              <div className="whitespace-nowrap">
                <p className="text-white text-sm font-bold tracking-wide leading-tight">ARGENTINOS</p>
                <p className="text-accent-400/50 text-[10px] font-semibold tracking-[0.2em]">DEL SUD</p>
              </div>
            )}
          </div>
          <button onClick={toggleSidebar}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer">
            <ChevronLeft size={16} className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <NavList expanded={sidebarOpen} location={location} />
        <UserSection expanded={sidebarOpen} user={user} logout={logout} />
      </aside>
    </>
  );
}

/* ─── Shared Nav List ─── */
function NavList({ expanded, location, onNavClick }: { expanded: boolean; location: ReturnType<typeof useLocation>; onNavClick?: () => void }) {
  return (
    <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
      {expanded && (
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 px-3 mb-3">Menú</p>
      )}
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
        return (
          <NavLink key={to} to={to} onClick={onNavClick}
            className={`
              relative flex items-center gap-3 rounded-xl transition-all duration-200
              ${expanded ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}
              ${isActive
                ? 'bg-accent-400/15 text-white font-semibold'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }
            `}>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-accent-400" />
            )}
            <Icon size={20} className={`shrink-0 ${isActive ? 'text-accent-400' : ''}`} />
            {expanded && <span className="text-sm truncate">{label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

/* ─── Shared User Section ─── */
function UserSection({ expanded, user, logout }: { expanded: boolean; user: any; logout: () => void }) {
  return (
    <div className="p-3 border-t border-white/[0.08] shrink-0">
      {expanded && user && (
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-warning-400 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {user.nombre?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user.nombre}</p>
            <p className="text-white/30 text-xs truncate capitalize">{user.rol}</p>
          </div>
        </div>
      )}
      <button onClick={logout}
        className={`w-full flex items-center gap-2 rounded-xl py-2 text-danger-400/60 hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer text-sm ${expanded ? 'px-3' : 'justify-center'}`}>
        <LogOut size={16} />
        {expanded && <span className="font-medium">Cerrar Sesión</span>}
      </button>
    </div>
  );
}
