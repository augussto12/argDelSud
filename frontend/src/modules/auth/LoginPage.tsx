import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/hooks/useAuthStore';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
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
    <div className="login-scene">
      {/* ── Animated gradient background ── */}
      <div className="login-bg" />

      {/* ── Floating orbs ── */}
      <div className="login-orb login-orb--1" />
      <div className="login-orb login-orb--2" />
      <div className="login-orb login-orb--3" />
      <div className="login-orb login-orb--4" />

      {/* ── Content ── */}
      <div className="login-container">
        {/* Logo + Branding */}
        <div className="login-branding">
          <div className="login-logo-box">
            <img src={escudo} alt="Argentinos del Sud" className="login-logo-img" />
          </div>
          <h1 className="login-club-name">Argentinos del Sud</h1>
          <p className="login-club-sub">Sistema de Gestión</p>
        </div>

        {/* Form card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Iniciar Sesión</h2>
            <p className="login-card-desc">Ingresá tus credenciales para continuar</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Email</label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@argdelsud.com"
                  required
                  className="login-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Contraseña</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input login-input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye-btn"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="login-submit-wrap">
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="login-btn"
              >
                {isLoading ? (
                  <>
                    <svg className="login-spinner" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Ingresando...</span>
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
        <p className="login-footer">
          Club Argentinos del Sud © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
