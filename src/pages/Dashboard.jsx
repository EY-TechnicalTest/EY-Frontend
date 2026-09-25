import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building,
  ShieldCheck,
  DollarSign,
  Globe,
  AlertTriangle,
  X,
} from 'lucide-react';
import supplierService from '../features/suppliers/services/supplierService';
import SupplierTable from '../features/suppliers/components/SupplierTable';
import SupplierModal from '../features/suppliers/components/SupplierModal';
import SupplierDetailModal from '../features/suppliers/components/SupplierDetailModal';
import DeleteConfirmModal from '../features/suppliers/components/DeleteConfirmModal';
import ScreeningModal from '../features/compliance/components/ScreeningModal';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ addToast, onSuppliersCountChange }) => {
  const { isAuthenticated, rateLimitMessage, clearRateLimitMessage } = useAuth();

  // Estado del inventario
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Filtros y ordenamiento
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  // Requisito del enunciado: Ordenados por fecha de última edición descendente
  const [sortField, setSortField] = useState('lastEditedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [detailSupplier, setDetailSupplier] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [screeningSupplier, setScreeningSupplier] = useState(null);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);

  const loadSuppliers = useCallback(async () => {
    // Si no está autenticado, no consumir el endpoint para evitar errores 401 innecesarios
    if (!isAuthenticated) {
      setSuppliers([]);
      setLoading(false);
      if (onSuppliersCountChange) onSuppliersCountChange(0);
      return;
    }

    setLoading(true);
    setConnectionError(null);

    try {
      const data = await supplierService.getAllSuppliers();
      const list = Array.isArray(data) ? data : [];
      setSuppliers(list);
      if (onSuppliersCountChange) {
        onSuppliersCountChange(list.length);
      }
    } catch (err) {
      if (err.status === 401) {
        // La sesión no es válida o expiró; se limpia el listado silenciosamente
        setSuppliers([]);
        if (onSuppliersCountChange) onSuppliersCountChange(0);
      } else if (err.status === 429) {
        // Rate limit capturado (el banner de rate limit ya lo muestra)
        console.warn('Límite de 20 llamadas por minuto alcanzado.');
      } else {
        setConnectionError(err.message || 'Error de conexión con el backend .NET');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, onSuppliersCountChange]);

  // Cargar inventario SOLO cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadSuppliers();
    } else {
      setSuppliers([]);
      setLoading(false);
      if (onSuppliersCountChange) onSuppliersCountChange(0);
    }
  }, [isAuthenticated, loadSuppliers, onSuppliersCountChange]);

  // Crear o actualizar proveedor
  const handleSaveSupplier = async (payload) => {
    setIsSaving(true);
    try {
      if (selectedSupplier) {
        // Actualizar
        await supplierService.updateSupplier(selectedSupplier.id, payload);
        addToast('success', `Proveedor '${payload.legalName}' actualizado exitosamente.`, 'Operación Exitosa');
      } else {
        // Crear
        const created = await supplierService.createSupplier(payload);
        addToast('success', `Proveedor '${payload.legalName}' registrado exitosamente con ID #${created.id}.`, 'Proveedor Registrado');
      }
      setIsModalOpen(false);
      setSelectedSupplier(null);
      await loadSuppliers();
    } catch (err) {
      addToast('error', err.message || 'Ocurrió un error al guardar los datos del proveedor.', 'Error en Guardado');
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar proveedor
  const handleConfirmDelete = async (id) => {
    setIsDeleting(true);
    try {
      await supplierService.deleteSupplier(id);
      addToast('success', 'El proveedor ha sido eliminado correctamente.', 'Eliminación Confirmada');
      setIsDeleting(false);
      setDeletingSupplier(null);
      await loadSuppliers();
    } catch (err) {
      setIsDeleting(false);
      addToast('error', err.message || 'No se pudo eliminar al proveedor.', 'Error');
    }
  };

  // Manejadores de modales
  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setSelectedSupplier(sup);
    setIsModalOpen(true);
  };

  const handleOpenView = (sup) => {
    setDetailSupplier(sup);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (sup) => {
    setDeletingSupplier(sup);
  };

  const handleOpenScreening = (sup) => {
    setScreeningSupplier(sup);
    setIsScreeningOpen(true);
  };

  // Ordenamiento interactivo por columnas
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Lista de países únicos para el filtro
  const uniqueCountries = useMemo(() => {
    const countries = new Set(suppliers.map((s) => s.country).filter(Boolean));
    return Array.from(countries).sort();
  }, [suppliers]);

  // Filtrado y ordenamiento de proveedores en memoria
  const filteredAndSortedSuppliers = useMemo(() => {
    let result = [...suppliers];

    // Filtro por término de búsqueda (Razón Social, Nombre Comercial, TaxId)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.legalName && s.legalName.toLowerCase().includes(term)) ||
          (s.tradeName && s.tradeName.toLowerCase().includes(term)) ||
          (s.taxId && s.taxId.includes(term)) ||
          (s.physicalAddress && s.physicalAddress.toLowerCase().includes(term)) ||
          (s.representatives &&
            s.representatives.some(
              (r) =>
                (r.forename && r.forename.toLowerCase().includes(term)) ||
                (r.familyName && r.familyName.toLowerCase().includes(term))
            ))
      );
    }

    // Filtro por país
    if (countryFilter !== 'ALL') {
      result = result.filter((s) => s.country === countryFilter);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'lastEditedAt') {
        const timeA = new Date(valA || 0).getTime();
        const timeB = new Date(valB || 0).getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (sortField === 'annualRevenue') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [suppliers, searchTerm, countryFilter, sortField, sortDirection]);

  // Paginación
  const totalItems = filteredAndSortedSuppliers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedSuppliers.slice(start, start + pageSize);
  }, [filteredAndSortedSuppliers, currentPage, pageSize]);

  // Cálculos para tarjetas métricas
  const totalAnnualVolume = useMemo(() => {
    return suppliers.reduce((acc, curr) => acc + (Number(curr.annualRevenue) || 0), 0);
  }, [suppliers]);

  const formattedTotalVolume = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(totalAnnualVolume);

  return (
    <div className="ey-dashboard-layout">
      {/* Banner de Rate Limit si se excede el límite de 20 llamadas/min */}
      {rateLimitMessage && (
        <div className="rate-limit-banner">
          <div className="rate-limit-banner-content">
            <AlertTriangle size={20} className="text-warning-bright" />
            <div>
              <strong>Límite de Consultas Excedido (HTTP 429):</strong>
              <span> {rateLimitMessage}</span>
            </div>
          </div>
          <button
            type="button"
            className="rate-limit-close"
            onClick={clearRateLimitMessage}
            aria-label="Cerrar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Banner de Error de Conexión si el backend está inaccesible */}
      {connectionError && (
        <div className="alert-banner alert-banner-danger">
          <AlertTriangle size={20} />
          <div>
            <strong>Error de Comunicación con el Backend:</strong>
            <span> {connectionError}</span>
          </div>
        </div>
      )}


      {/* Main Content Card: Inventory & Screening Management */}
      <div className="dashboard-main-card">
        {/* Card Header & Controls Toolbar */}
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <h2 className="section-title">Inventario de Proveedores</h2>
            <span className="section-subtitle">
              Administración de empresas y ejecución de debida diligencia automatizada
            </span>
          </div>

          <div className="toolbar-right">
            {/* Search Input */}
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-control input-search"
                placeholder="Buscar por Razón Social, RUC o Representante..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!isAuthenticated}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Country Filter */}
            <div className="country-filter-wrap">
              <Filter size={16} className="filter-icon" />
              <select
                className="select-control select-country"
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!isAuthenticated}
                aria-label="Filtrar por país"
              >
                <option value="ALL">Todos los Países</option>
                {uniqueCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={loadSuppliers}
              title="Refrescar lista desde la base de datos"
              disabled={loading || !isAuthenticated}
            >
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
              <span>Actualizar</span>
            </button>

            {/* Add New Supplier Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenCreate}
            >
              <Plus size={16} />
              <span>Nuevo Proveedor</span>
            </button>
          </div>
        </div>

        {/* Table Component */}
        <SupplierTable
          suppliers={paginatedSuppliers}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onScreen={handleOpenScreening}
          loading={loading}
        />

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modales SPA */}
      {/* 1. Modal Crear / Editar Proveedor */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
        isSaving={isSaving}
      />

      {/* 2. Modal Ver Ficha de Proveedor */}
      <SupplierDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailSupplier(null);
        }}
        supplier={detailSupplier}
        onEdit={handleOpenEdit}
        onScreen={handleOpenScreening}
      />

      {/* 3. Modal Confirmar Eliminación */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleConfirmDelete}
        supplier={deletingSupplier}
        isDeleting={isDeleting}
      />

      {/* 4. Modal de Cruce con Listas de Alto Riesgo (Screening SMV / SECOP / INTERPOL) */}
      <ScreeningModal
        isOpen={isScreeningOpen}
        onClose={() => {
          setIsScreeningOpen(false);
          setScreeningSupplier(null);
        }}
        supplier={screeningSupplier}
      />
    </div>
  );
};

export default Dashboard;
