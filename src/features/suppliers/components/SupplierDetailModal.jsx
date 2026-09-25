import {
  X,
  Globe,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  ExternalLink,
  Users,
  Edit2,
  FileText,
} from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$ 0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
};

export const SupplierDetailModal = ({ isOpen, onClose, supplier, onEdit, onScreen }) => {
  if (!isOpen || !supplier) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <FileText size={22} className="text-ey-yellow" />
            </div>
            <div>
              <h2 className="modal-title">{supplier.legalName}</h2>
              <p className="modal-subtitle">Ficha Técnica y Debida Diligencia del Proveedor (ID #{supplier.id})</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body detail-modal-body">
          {/* Top highlight card */}
          <div className="detail-hero-card">
            <div className="detail-hero-main">
              <div className="hero-tax-badge">
                <span>RUC / Tax ID:</span>
                <strong>{supplier.taxId}</strong>
              </div>
              <h3 className="hero-trade-name">
                {supplier.tradeName || supplier.legalName}
              </h3>
              <div className="hero-location">
                <MapPin size={15} />
                <span>{supplier.physicalAddress}, {supplier.country}</span>
              </div>
            </div>

            <div className="detail-hero-actions">
              <button
                type="button"
                className="btn btn-screening-large"
                onClick={() => {
                  onClose();
                  onScreen(supplier);
                }}
                title="Ejecutar Cruce con Listas de Alto Riesgo"
              >
                <ShieldAlert size={18} />
                <span>Ejecutar Screening</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(supplier);
                }}
              >
                <Edit2 size={14} />
                <span>Editar Datos</span>
              </button>
            </div>
          </div>

          {/* Grid information */}
          <div className="detail-grid">
            <div className="detail-info-block">
              <span className="detail-label">Nombre Comercial</span>
              <span className="detail-value">{supplier.tradeName || '-'}</span>
            </div>

            <div className="detail-info-block">
              <span className="detail-label">País de Operación</span>
              <span className="detail-value country-badge-inline">{supplier.country}</span>
            </div>

            <div className="detail-info-block">
              <span className="detail-label">Facturación Anual Declarada (USD)</span>
              <span className="detail-value text-accent-amount">
                {formatCurrency(supplier.annualRevenue)}
              </span>
            </div>

            <div className="detail-info-block">
              <span className="detail-label">Última Actualización</span>
              <span className="detail-value text-muted">
                {formatDateTime(supplier.lastEditedAt)}
              </span>
            </div>

            <div className="detail-info-block">
              <span className="detail-label">Teléfono de Contacto</span>
              <div className="detail-contact-row">
                <Phone size={14} className="text-muted" />
                <a href={`tel:${supplier.phoneNumber}`} className="detail-link">
                  {supplier.phoneNumber}
                </a>
              </div>
            </div>

            <div className="detail-info-block">
              <span className="detail-label">Correo Electrónico</span>
              <div className="detail-contact-row">
                <Mail size={14} className="text-muted" />
                <a href={`mailto:${supplier.email}`} className="detail-link">
                  {supplier.email}
                </a>
              </div>
            </div>

            <div className="detail-info-block detail-info-wide">
              <span className="detail-label">Sitio Web Oficial</span>
              <div className="detail-contact-row">
                <Globe size={14} className="text-muted" />
                <a
                  href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-link-inline"
                >
                  <span>{supplier.website}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Representantes Legales */}
          <div className="detail-representatives-section">
            <div className="section-header-compact">
              <Users size={16} className="text-ey-yellow" />
              <h4>Representantes Legales Registrados</h4>
            </div>

            {supplier.representatives && supplier.representatives.length > 0 ? (
              <div className="representatives-list-grid">
                {supplier.representatives.map((rep, idx) => (
                  <div key={idx} className="rep-card-view">
                    <div className="rep-avatar">
                      {rep.forename ? rep.forename.charAt(0) : 'R'}
                      {rep.familyName ? rep.familyName.charAt(0) : ''}
                    </div>
                    <div className="rep-meta">
                      <div className="rep-fullname">
                        {rep.fullName || `${rep.forename} ${rep.familyName}`}
                      </div>
                      {rep.documentNumber && (
                        <div className="rep-doc">Doc: {rep.documentNumber}</div>
                      )}
                      {rep.email && (
                        <div className="rep-email">
                          <Mail size={12} />
                          <a href={`mailto:${rep.email}`}>{rep.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-rep-text text-muted">
                No se registraron representantes legales individuales para esta entidad.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn-screening"
            onClick={() => {
              onClose();
              onScreen(supplier);
            }}
          >
            <ShieldAlert size={16} />
            <span>Realizar Cruce de Listas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;
