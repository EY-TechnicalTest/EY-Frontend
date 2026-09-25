import { ShieldCheck, User, LogIn, LogOut, Activity, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ totalSuppliers, onOpenLoginModal }) => {
  const { user, isAuthenticated, logout, handleQuickDemoLogin } = useAuth();

  return (
    <header className="ey-navbar">
      <div className="ey-navbar-container">
        {/* Branding & Logo */}
        <div className="ey-brand-section">
          <div className="ey-logo-badge">
            <span className="ey-logo-text">EY</span>
            <div className="ey-yellow-tag"></div>
          </div>
          <div className="ey-title-group">
            <h1 className="ey-app-title">Supplier Due Diligence & Risk Screening</h1>
            <span className="ey-app-subtitle">
              Plataforma de Verificación de Proveedores en Listas de Alto Riesgo (SMV • SECOP • INTERPOL)
            </span>
          </div>
        </div>

        <div className="ey-navbar-actions">

          {isAuthenticated ? (
            <div className="user-profile-badge">
              <div className="user-avatar" title="Oficial de Cumplimiento">
                <User size={16} />
              </div>
              <div className="user-info-text">
                <span className="user-name">{user?.username || 'Oficial de Cumplimiento'}</span>
                <span className="user-role">Compliance Officer</span>
              </div>
              <button
                type="button"
                className="btn-navbar-logout"
                onClick={logout}
                title="Cerrar Sesión de la Plataforma"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} />
                <span className="logout-label">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleQuickDemoLogin}
                title="Iniciar sesión en 1 clic con credenciales demo"
              >
                <ShieldCheck size={14} className="text-ey-yellow" />
                <span>Demo 1-Click</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenLoginModal}
              >
                <LogIn size={14} />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
