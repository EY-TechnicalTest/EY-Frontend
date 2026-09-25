import { useState } from 'react';
import {
  User,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      if (onSuccess) onSuccess('Bienvenido al sistema.');
    } catch (err) {
      setErrorMessage(
        err.message || 'Credenciales inválidas o backend no disponible.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  const handleDirectDemoLogin = async () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
    setLoading(true);
    try {
      await login('admin', 'admin123');
      if (onSuccess) onSuccess('Sesión iniciada con credenciales demo.');
    } catch (err) {
      setErrorMessage(
        err.message || 'No se pudo conectar con el servidor backend .NET.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-minimal-wrapper">
      <div className="login-minimal-card">
        {/* Brand & Title */}
        <div className="login-minimal-header">
          <div className="ey-logo-badge large">
            <span className="ey-logo-text">EY</span>
            <div className="ey-yellow-tag"></div>
          </div>
          <h1 className="login-minimal-title">Supplier Due Diligence</h1>
          <p className="login-minimal-subtitle">Inicia sesión con tu cuenta de Compliance</p>
        </div>

        {errorMessage && (
          <div className="alert-banner alert-banner-danger login-alert">
            <ShieldAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-minimal-form">
          <div className="form-group">
            <label htmlFor="loginUser">Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="loginUser"
                type="text"
                className="input-control"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="loginPass">Contraseña</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input
                id="loginPass"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>


          <div className="login-actions-group">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </div>
        </form>

        <div className="login-minimal-footer">
          <span>Ernst & Young Global Limited • Acceso Restringido</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
