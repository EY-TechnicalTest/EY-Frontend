import {
  Eye,
  Edit2,
  Trash2,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Building,
  Calendar,
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
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
};

export const SupplierTable = ({
  suppliers,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onScreen,
  loading,
}) => {
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="sort-icon-inactive" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  return (
    <div className="table-responsive-wrapper">
      <table className="ey-data-table" aria-label="Tabla de inventario de proveedores">
        <thead>
          <tr>
            <th
              onClick={() => onSort('legalName')}
              className="sortable-th"
              title="Ordenar por Razón Social"
            >
              <div className="th-content">
                <span>Razón Social / Comercial</span>
                {renderSortIcon('legalName')}
              </div>
            </th>

            <th
              onClick={() => onSort('taxId')}
              className="sortable-th"
              title="Ordenar por Identificación Tributaria (11 dígitos)"
            >
              <div className="th-content">
                <span>Identificación Tributaria</span>
                {renderSortIcon('taxId')}
              </div>
            </th>

            <th>Contacto Directo</th>

            <th>Sitio Web</th>

            <th>Ubicación</th>

            <th
              onClick={() => onSort('annualRevenue')}
              className="sortable-th text-right"
              title="Ordenar por Facturación Anual"
            >
              <div className="th-content justify-end">
                <span>Facturación Anual ($)</span>
                {renderSortIcon('annualRevenue')}
              </div>
            </th>

            <th
              onClick={() => onSort('lastEditedAt')}
              className="sortable-th"
              title="Ordenar por Fecha de Última Edición"
            >
              <div className="th-content">
                <span>Última Edición</span>
                {renderSortIcon('lastEditedAt')}
              </div>
            </th>

            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="table-loading-cell">
                <div className="table-spinner-wrap">
                  <div className="spinner"></div>
                  <span>Cargando inventario de proveedores...</span>
                </div>
              </td>
            </tr>
          ) : suppliers.length === 0 ? (
            <tr>
              <td colSpan="8" className="table-empty-cell">
                <div className="table-empty-state">
                  <Building size={40} className="empty-icon text-muted" />
                  <h4>No se encontraron proveedores</h4>
                  <p>Intenta ajustar los filtros de búsqueda o agrega un nuevo proveedor a la base de datos.</p>
                </div>
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr key={supplier.id} className="table-row-hover">
                {/* Razón Social y Nombre Comercial */}
                <td className="cell-names">
                  <div className="legal-name" title={supplier.legalName}>
                    {supplier.legalName}
                  </div>
                  {supplier.tradeName && supplier.tradeName !== supplier.legalName && (
                    <div className="trade-name" title={supplier.tradeName}>
                      {supplier.tradeName}
                    </div>
                  )}
                  {supplier.representatives && supplier.representatives.length > 0 && (
                    <div className="rep-hint">
                      Rep: {supplier.representatives[0].fullName || `${supplier.representatives[0].forename} ${supplier.representatives[0].familyName}`}
                    </div>
                  )}
                </td>

                <td className="cell-tax-id">
                  <span className="tax-id-badge" title="Identificación Tributaria de 11 dígitos">
                    {supplier.taxId}
                  </span>
                </td>

                <td className="cell-contact">
                  <div className="contact-item">
                    <Phone size={13} className="contact-icon" />
                    <span>{supplier.phoneNumber}</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={13} className="contact-icon" />
                    <a href={`mailto:${supplier.email}`} className="email-link" title={supplier.email}>
                      {supplier.email}
                    </a>
                  </div>
                </td>

                <td className="cell-website">
                  {supplier.website ? (
                    <a
                      href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                      title={`Ir a ${supplier.website}`}
                    >
                      <Globe size={13} />
                      <span className="truncate-text">{supplier.website.replace(/^https?:\/\//i, '')}</span>
                      <ExternalLink size={12} className="link-arrow" />
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>

                <td className="cell-location">
                  <div className="country-badge">{supplier.country}</div>
                  <div className="physical-address" title={supplier.physicalAddress}>
                    {supplier.physicalAddress}
                  </div>
                </td>

                <td className="cell-revenue text-right">
                  <span className="revenue-amount">
                    {formatCurrency(supplier.annualRevenue)}
                  </span>
                </td>

                <td className="cell-date">
                  <div className="date-display">
                    <Calendar size={13} className="date-icon" />
                    <span>{formatDateTime(supplier.lastEditedAt)}</span>
                  </div>
                </td>

                <td className="cell-actions text-center">
                  <div className="actions-cluster">
                    <button
                      type="button"
                      className="btn-screening"
                      onClick={() => onScreen(supplier)}
                      title="Realizar Cruce con Listas de Alto Riesgo (Screening SMV / SECOP / INTERPOL)"
                      aria-label="Screening de listas de riesgo"
                    >
                      <ShieldAlert size={14} />
                      <span>Screening</span>
                    </button>

                    {/* Ver */}
                    <button
                      type="button"
                      className="btn-action btn-view"
                      onClick={() => onView(supplier)}
                      title="Ver Ficha Técnica del Proveedor"
                      aria-label="Ver detalles"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Editar */}
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit(supplier)}
                      title="Editar Datos del Proveedor"
                      aria-label="Editar proveedor"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => onDelete(supplier)}
                      title="Eliminar Proveedor"
                      aria-label="Eliminar proveedor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;
