import { useState } from 'react';
import { Lock, User, X, ShieldAlert, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      if (onSuccess) onSuccess('Inicio de sesión exitoso.');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error al autenticar. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-auth" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Lock size={20} className="text-ey-yellow" />
            </div>
            <div>
              <h2 className="modal-title">Autenticación de Plataforma</h2>
              <p className="modal-subtitle">Acceso seguro con token JWT para Oficiales de Cumplimiento</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="alert-banner alert-banner-danger">
            <ShieldAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="loginUsername">Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="loginUsername"
                type="text"
                className="input-control"
                placeholder="Ej. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword">Contraseña</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input
                id="loginPassword"
                type="password"
                className="input-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="demo-credentials-box">
            <div className="demo-credentials-header">
              <span>Credenciales de prueba sugeridas:</span>
              <button
                type="button"
                className="btn-link-action"
                onClick={handleUseDemo}
              >
                Autocompletar
              </button>
            </div>
            <code>Usuario: <strong>admin</strong> | Contraseña: <strong>admin123</strong></code>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Ingresar a la Plataforma</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
