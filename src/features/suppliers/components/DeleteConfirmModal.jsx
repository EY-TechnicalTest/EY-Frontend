import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, supplier, isDeleting }) => {
  if (!isOpen || !supplier) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge modal-icon-badge-danger">
              <AlertTriangle size={22} className="text-danger" />
            </div>
            <div>
              <h2 className="modal-title">Confirmar Eliminación</h2>
              <p className="modal-subtitle">Esta acción removerá permanentemente al proveedor</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body delete-modal-body">
          <p className="delete-warning-text">
            ¿Estás seguro de que deseas eliminar al proveedor{' '}
            <strong>{supplier.legalName}</strong> (RUC/Tax ID: <strong>{supplier.taxId}</strong>)?
          </p>
          <div className="delete-callout">
            <AlertTriangle size={16} />
            <span>
              Se eliminarán también todos los representantes legales y el historial de debida diligencia asociado en SQL Server.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(supplier.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Eliminar Definitivamente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
