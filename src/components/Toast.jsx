import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration !== false) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="toast-icon text-success" size={20} />,
    warning: <AlertTriangle className="toast-icon text-warning" size={20} />,
    error: <AlertCircle className="toast-icon text-danger" size={20} />,
    info: <Info className="toast-icon text-info" size={20} />,
  };

  return (
    <div className={`toast-item toast-${toast.type || 'info'}`} role="alert" aria-live="assertive">
      <div className="toast-content">
        {icons[toast.type || 'info']}
        <div className="toast-text">
          {toast.title && <div className="toast-title">{toast.title}</div>}
          <div className="toast-message">{toast.message}</div>
        </div>
      </div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onClose(toast.id)}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notificaciones del sistema">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
