import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { ToastContainer } from './components/Toast';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [supplierCount, setSupplierCount] = useState(0);

  // addToast memorizado para evitar re-render loops y duplicación de popups
  const addToast = useCallback((type, message, title = '') => {
    setToasts((prev) => {
      // Evitar spamear el mismo mensaje repetido en pantalla
      const alreadyVisible = prev.some((t) => t.message === message);
      if (alreadyVisible) return prev;

      const id = Date.now() + Math.random().toString(36).substring(2, 7);
      const next = [...prev, { id, type, message, title }];
      // Máximo 3 notificaciones visibles simultáneas
      return next.slice(-3);
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSupplierCountChange = useCallback((count) => {
    setSupplierCount(count);
  }, []);

  // 1. Pantalla propia de Login si el usuario NO está autenticado
  if (!isAuthenticated) {
    return (
      <div className="ey-app-wrapper">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <LoginPage
          onSuccess={(msg) => addToast('success', msg, 'Sesión Iniciada')}
        />
      </div>
    );
  }

  // 2. Pantalla principal (Dashboard y datos de proveedores) una vez autenticado
  return (
    <div className="ey-app-wrapper">
      {/* Notificaciones del Sistema (con límite y deduplicación) */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Encabezado Corporativo EY */}
      <Navbar
        totalSuppliers={supplierCount}
      />

      {/* Cuerpo SPA con datos del inventario y debida diligencia */}
      <main className="ey-main-container">
        <Dashboard
          addToast={addToast}
          onSuppliersCountChange={handleSupplierCountChange}
        />
      </main>

      {/* Footer Corporativo */}
      <footer className="ey-footer">
        <div className="ey-footer-container">
          <div className="footer-left">
            <span className="footer-ey-tag">EY</span>
            <span className="footer-text">
              Ernst & Young Global Limited • Technical Assessment Solution • Risk & Compliance Technology
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-version">Single Page Application (SPA) • .NET Core & React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
