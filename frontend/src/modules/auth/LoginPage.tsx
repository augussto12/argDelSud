import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { Mail, Lock, Eye, EyeOff, ChevronRight, Trophy, Waves, Medal, Shirt } from 'lucide-react';
import escudo from '../../assets/argdelsur.png';

export default function LoginPage() {
  const { login, isLoading, error, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex min-h-screen">

      {/* ═══════════ Left panel — branding (desktop only) ═══════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-500">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 opacity-95" />

        {/* Floating decorative icons */}
        <Trophy className="absolute top-20 left-20 w-32 h-32 text-white/[0.03] rotate-[-15deg]" />
        <Waves className="absolute bottom-40 right-20 w-40 h-40 text-white/[0.03] rotate-[15deg]" />
        <Medal className="absolute top-1/2 left-1/4 w-24 h-24 text-white/[0.03] rotate-[5deg]" />
        <Shirt className="absolute top-1/3 right-1/4 w-28 h-28 text-white/[0.03] rotate-[-8deg]" />

        {/* Ambient glow blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-accent-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-warning-400/8 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white/90">
          {/* Logo */}
          <div className="mb-12 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-warning-400 rounded-3xl blur opacity-20 group-hover:opacity-50 transition duration-1000" />
            <div className="relative bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
              <img src={escudo} alt="Argentinos del Sud" className="w-24 h-24 object-contain" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center tracking-tight text-white">
            Bienvenido
          </h1>
          <p className="text-white/40 text-lg text-center max-w-sm font-light leading-relaxed">
            Sistema integral de gestión del Club Argentinos del Sud
          </p>

          {/* Features dots */}
          <div className="mt-16 flex items-center gap-10">
            {['Fútbol', 'Natación', 'Talleres', 'Gestión'].map((item) => (
              <div key={item} className="flex flex-col items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-400/60" />
                <span className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ Right panel — login form ═══════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-30" />

        <div className="w-full max-w-md animate-slideUp relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white shadow-xl shadow-primary-500/20 mb-5 p-2">
              <img src={escudo} alt="Argentinos del Sud" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Argentinos del Sud
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-semibold uppercase tracking-widest">
              Sistema de Gestión
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] px-8 py-10 sm:px-12 sm:py-12 border border-slate-100">
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
              <p className="text-slate-500 text-sm sm:text-base">Ingresá tus credenciales para continuar</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2.5 animate-slideUp">
                <span className="block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email field */}
              <div className="space-y-2.5">
                <label htmlFor="login-email"
                  className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-accent-500" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@argdelsud.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-accent-400 transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2.5">
                <label htmlFor="login-password"
                  className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 transition-colors group-focus-within:text-accent-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base font-medium placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-accent-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 cursor-pointer bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="opacity-90">Ingresando...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Club Argentinos del Sud © {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-slate-300">
              Versión 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
