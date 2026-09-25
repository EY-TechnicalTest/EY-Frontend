import { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Layers,
  Building,
  User,
  CheckCircle2,
  Search,
  ArrowLeft,
  Globe,
  FileText,
  AlertOctagon,
} from 'lucide-react';
import supplierService from '../../suppliers/services/supplierService';

const AVAILABLE_SOURCES = [
  {
    id: 'SMV',
    label: 'SMV (Perú)',
    badge: 'Superintendencia del Mercado de Valores',
    description: 'Búsqueda de sanciones firmes, resoluciones y multas en el mercado bursátil peruano.',
    icon: FileText,
  },
  {
    id: 'SECOP',
    label: 'SECOP I (Colombia)',
    badge: 'Contratación Estatal - Datos Abiertos',
    description: 'Historial de multas, sanciones e inhabilidades registradas para contratar con el Estado.',
    icon: Building,
  },
  {
    id: 'INTERPOL',
    label: 'INTERPOL',
    badge: 'Red Notices (The Most Wanted)',
    description: 'Búsqueda de notificaciones rojas de captura internacional sobre la entidad y sus representantes.',
    icon: Globe,
  },
];

export const ScreeningModal = ({ isOpen, onClose, supplier }) => {
  // Step 1: Selección de Fuentes, Step 2: Analizando en Vivo, Step 3: Resultados
  const [step, setStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState(['SMV', 'SECOP', 'INTERPOL']);
  const [loading, setLoading] = useState(false);
  const [screeningData, setScreeningData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Inicialización limpia al abrir el modal (NUNCA auto-ejecuta scraping)
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setScreeningData(null);
      setErrorMessage('');
      setLoading(false);
      setActiveTab('ALL');
      setSelectedSources(['SMV', 'SECOP', 'INTERPOL']);
    }
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const handleSourceToggle = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      if (selectedSources.length === 1) {
        setErrorMessage('Se debe seleccionar por lo menos 1 fuente para el cruce.');
        return;
      }
      setSelectedSources(selectedSources.filter((s) => s !== sourceId));
    } else {
      if (selectedSources.length >= 3) {
        setErrorMessage('El número máximo de fuentes permitidas es 3.');
        return;
      }
      setSelectedSources([...selectedSources, sourceId]);
    }
    setErrorMessage('');
  };

  const handleStartScreening = async () => {
    if (!supplier) return;

    if (selectedSources.length < 1 || selectedSources.length > 3) {
      setErrorMessage('Debes seleccionar entre 1 y 3 fuentes para realizar el cruce.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setStep(2); // Pasa a pantalla de análisis

    try {
      const response = await supplierService.screenSupplier(supplier.id, selectedSources);
      setScreeningData(response);
      setActiveTab('ALL');
      setStep(3); // Pasa a pantalla de resultados
    } catch (err) {
      setErrorMessage(
        err.message || 'Error al conectar con los servicios de screening de listas de alto riesgo.'
      );
      setStep(1); // Regresa a paso 1 con el mensaje de error
    } finally {
      setLoading(false);
    }
  };

  const totalHits = screeningData?.totalHits ?? 0;
  const results = screeningData?.screeningResults;
  const smvSanctions = results?.smv?.sanctions || [];
  const secopPenalties = results?.secop || [];
  const interpolPersons = results?.interpol || [];
  const sourceErrors = results?.errors || {};

  const representativeName =
    supplier.representatives && supplier.representatives.length > 0
      ? supplier.representatives[0].fullName ||
        `${supplier.representatives[0].forename || ''} ${supplier.representatives[0].familyName || ''}`.trim()
      : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              className={`modal-icon-badge ${
                step === 3 && totalHits > 0 ? 'modal-icon-badge-danger' : 'modal-icon-badge-screening'
              }`}
            >
              {step === 3 && totalHits > 0 ? (
                <ShieldAlert size={22} className="text-danger" />
              ) : (
                <ShieldCheck size={22} className="text-ey-yellow" />
              )}
            </div>
            <div>
              <div className="modal-header-top-row">
                <h2 className="modal-title">
                  {step === 1 && 'Cruce con Listas de Alto Riesgo'}
                  {step === 2 && 'Analizando Fuentes en Tiempo Real...'}
                  {step === 3 && `Resultados de Cruce: ${supplier.legalName}`}
                </h2>
                <span className="live-badge">
                  {step === 2 ? 'En Ejecución' : 'Modo Seguro'}
                </span>
              </div>
              <p className="modal-subtitle">
                Proveedor: <strong>{supplier.legalName}</strong> (RUC/NIT: <strong>{supplier.taxId}</strong>)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body screening-modal-body">
          {/* Error Banner */}
          {errorMessage && (
            <div className="alert-banner alert-banner-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ===============================================================
              PASO 1: SELECCIÓN DE FUENTES & RESUMEN DEL PROVEEDOR (StepSelect)
              =============================================================== */}
          {step === 1 && (
            <div className="screening-step-select">
              {/* Tarjeta resumen del proveedor */}
              <div className="screening-supplier-summary-card">
                <div className="summary-col">
                  <span className="summary-label">Razón Social:</span>
                  <div className="summary-val font-semibold">{supplier.legalName}</div>
                  {supplier.tradeName && supplier.tradeName !== supplier.legalName && (
                    <div className="summary-sub text-muted">Comercial: {supplier.tradeName}</div>
                  )}
                </div>
                <div className="summary-col">
                  <span className="summary-label">Identificación Tributaria:</span>
                  <div className="summary-val">{supplier.taxId}</div>
                  <div className="summary-sub text-muted">País: {supplier.country}</div>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Representante Legal:</span>
                  <div className="summary-val">{representativeName || 'No registrado'}</div>
                  <div className="summary-sub text-muted">
                    {representativeName ? 'Sujeto a verificación Interpol' : '-'}
                  </div>
                </div>
              </div>

              {/* Selector de Fuentes a Analizar */}
              <div className="screening-sources-picker">
                <div className="sources-picker-header">
                  <div>
                    <h3 className="sources-picker-title">Fuentes de Consulta Disponibles</h3>
                    <p className="sources-picker-subtitle">
                      Selecciona entre 1 y 3 fuentes oficiales para contrastar información en tiempo real.
                    </p>
                  </div>
                  <span className="sources-count-badge">
                    {selectedSources.length} de {AVAILABLE_SOURCES.length} seleccionadas
                  </span>
                </div>

                <div className="sources-cards-grid">
                  {AVAILABLE_SOURCES.map((source) => {
                    const isSelected = selectedSources.includes(source.id);
                    const SourceIcon = source.icon;
                    return (
                      <div
                        key={source.id}
                        className={`source-select-card ${isSelected ? 'source-select-card-active' : ''}`}
                        onClick={() => handleSourceToggle(source.id)}
                      >
                        <div className="source-card-top">
                          <div className="source-card-title-wrap">
                            <SourceIcon size={20} className="source-card-icon" />
                            <span className="source-card-name">{source.label}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Manejado por onClick del card
                            className="source-checkbox"
                          />
                        </div>
                        <span className="source-card-badge">{source.badge}</span>
                        <p className="source-card-desc">{source.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===============================================================
              PASO 2: ANÁLISIS EN CURSO (StepAnalyzing)
              =============================================================== */}
          {step === 2 && (
            <div className="screening-loading-state">
              <div className="screening-spinner-wrap">
                <div className="spinner-large"></div>
              </div>
              <h3>Consultando Fuentes en Tiempo Real...</h3>
              <p>
                Analizando antecedentes en SMV, SECOP I e INTERPOL de forma silenciosa en segundo plano.
              </p>
              <div className="loading-sources-list">
                {selectedSources.map((s) => (
                  <span key={s} className="loading-source-chip">
                    • {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ===============================================================
              PASO 3: RESULTADOS DEL CRUCE (StepResults)
              =============================================================== */}
          {step === 3 && screeningData && (
            <div className="screening-step-results">
              {/* Minimalist Risk Alert Banner */}
              <div
                className={`screening-alert-minimal ${
                  totalHits > 0 ? 'alert-minimal-danger' : 'alert-minimal-success'
                }`}
              >
                {totalHits > 0 ? (
                  <AlertOctagon size={18} className="text-danger flex-shrink-0" />
                ) : (
                  <ShieldCheck size={18} className="text-success flex-shrink-0" />
                )}
                <div className="alert-minimal-content">
                  <span className="alert-minimal-text">
                    {totalHits > 0
                      ? `Alerta de Riesgo: ${totalHits} coincidencia(s) detectada(s) en las fuentes analizadas.`
                      : 'Proveedor sin registros negativos en las fuentes seleccionadas.'}
                  </span>
                  <span className="alert-minimal-badge">
                    {totalHits > 0 ? `${totalHits} Coincidencias` : 'Perfil Limpio'}
                  </span>
                </div>
              </div>

              {/* Advertencias de fuentes secundarias */}
              {Object.keys(sourceErrors).length > 0 && (
                <div className="alert-banner alert-banner-warning" style={{ marginBottom: '1rem' }}>
                  <AlertTriangle size={16} />
                  <span>
                    Avisos en consulta:{' '}
                    {Object.entries(sourceErrors)
                      .map(([src, err]) => `[${src}: ${err}]`)
                      .join(', ')}
                  </span>
                </div>
              )}

              {/* Tabs de Navegación de Resultados (en memoria, no re-ejecutan scraping) */}
              <div className="screening-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'ALL' ? 'tab-btn-active' : ''}`}
                  onClick={() => setActiveTab('ALL')}
                >
                  <Layers size={15} />
                  <span>Todas las Fuentes</span>
                  <span className="tab-counter">{totalHits}</span>
                </button>

                {selectedSources.includes('SMV') && (
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'SMV' ? 'tab-btn-active' : ''}`}
                    onClick={() => setActiveTab('SMV')}
                  >
                    <span>SMV (Perú)</span>
                    <span
                      className={`tab-counter ${smvSanctions.length > 0 ? 'counter-danger' : ''}`}
                    >
                      {smvSanctions.length}
                    </span>
                  </button>
                )}

                {selectedSources.includes('SECOP') && (
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'SECOP' ? 'tab-btn-active' : ''}`}
                    onClick={() => setActiveTab('SECOP')}
                  >
                    <span>SECOP I (Colombia)</span>
                    <span
                      className={`tab-counter ${secopPenalties.length > 0 ? 'counter-danger' : ''}`}
                    >
                      {secopPenalties.length}
                    </span>
                  </button>
                )}

                {selectedSources.includes('INTERPOL') && (
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'INTERPOL' ? 'tab-btn-active' : ''}`}
                    onClick={() => setActiveTab('INTERPOL')}
                  >
                    <span>INTERPOL</span>
                    <span
                      className={`tab-counter ${interpolPersons.length > 0 ? 'counter-danger' : ''}`}
                    >
                      {interpolPersons.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Tablas de Resultados */}
              <div className="screening-tables-wrapper">
                {/* 1. SMV Sanciones */}
                {(activeTab === 'ALL' || activeTab === 'SMV') && selectedSources.includes('SMV') && (
                  <div className="screening-source-section">
                    <div className="source-section-header">
                      <div className="source-title-group">
                        <span className="source-tag">SMV</span>
                        <h4>Superintendencia del Mercado de Valores (Perú)</h4>
                      </div>
                      <span
                        className={`hits-chip ${smvSanctions.length > 0 ? 'hits-danger' : 'hits-clean'}`}
                      >
                        {smvSanctions.length} {smvSanctions.length === 1 ? 'Sanción' : 'Sanciones'}
                      </span>
                    </div>

                    {smvSanctions.length === 0 ? (
                      <div className="no-hits-box">
                        <CheckCircle2 size={18} className="text-success" />
                        <span>Sin sanciones registradas en el Registro de Sanciones de la SMV.</span>
                      </div>
                    ) : (
                      <div className="table-responsive-wrapper table-nested">
                        <table className="ey-data-table">
                          <thead>
                            <tr>
                              <th>N° Resolución</th>
                              <th>Fecha</th>
                              <th>Descripción de la Sanción</th>
                              <th>Tipo</th>
                              <th>Monto</th>
                              <th>Apelación</th>
                              <th className="text-center">Resolución Oficial</th>
                            </tr>
                          </thead>
                          <tbody>
                            {smvSanctions.map((s, idx) => (
                              <tr key={idx}>
                                <td>
                                  <span className="font-semibold">
                                    {s.resolutionNumber || s.resolutiveNumber || '-'}
                                  </span>
                                </td>
                                <td>{s.resolutionDate || s.resolutiveDate || '-'}</td>
                                <td className="cell-wrap-text">{s.description || '-'}</td>
                                <td>
                                  <span className="sanction-type-badge">{s.type || 'Sanción'}</span>
                                </td>
                                <td className="font-semibold text-danger">{s.amount || '-'}</td>
                                <td>{s.hasAppeal || 'No'}</td>
                                <td className="text-center">
                                  {s.resolutionUrl ? (
                                    <a
                                      href={s.resolutionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-pdf-badge"
                                      title="Ver documento oficial en SMV"
                                    >
                                      <span>Ver PDF</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SECOP I Multas y Sanciones */}
                {(activeTab === 'ALL' || activeTab === 'SECOP') && selectedSources.includes('SECOP') && (
                  <div className="screening-source-section">
                    <div className="source-section-header">
                      <div className="source-title-group">
                        <span className="source-tag source-tag-secop">SECOP I</span>
                        <h4>Multas y Sanciones Estatales - SECOP I (Colombia)</h4>
                      </div>
                      <span
                        className={`hits-chip ${secopPenalties.length > 0 ? 'hits-danger' : 'hits-clean'}`}
                      >
                        {secopPenalties.length} {secopPenalties.length === 1 ? 'Sanción' : 'Sanciones'}
                      </span>
                    </div>

                    {secopPenalties.length === 0 ? (
                      <div className="no-hits-box">
                        <CheckCircle2 size={18} className="text-success" />
                        <span>Sin multas o sanciones registradas en SECOP I Datos Abiertos.</span>
                      </div>
                    ) : (
                      <div className="table-responsive-wrapper table-nested">
                        <table className="ey-data-table">
                          <thead>
                            <tr>
                              <th>Entidad Estatal Sancionadora</th>
                              <th>Contratista Sancionado</th>
                              <th>Doc / NIT</th>
                              <th>N° Resolución</th>
                              <th>Valor Sanción</th>
                              <th>Fecha Firmeza</th>
                              <th>Municipio</th>
                              <th className="text-center">Detalle Proceso</th>
                            </tr>
                          </thead>
                          <tbody>
                            {secopPenalties.map((p, idx) => (
                              <tr key={idx}>
                                <td className="cell-wrap-text font-semibold">
                                  {p.nombreEntidad || '-'}
                                </td>
                                <td className="cell-wrap-text">{p.nombreContratista || '-'}</td>
                                <td>{p.documentoContratista || p.nitEntidad || '-'}</td>
                                <td>{p.numeroResolucion || '-'}</td>
                                <td className="font-semibold text-danger">{p.valorSancion || '-'}</td>
                                <td>{p.fechaFirmeza || p.fechaPublicacion || '-'}</td>
                                <td>{p.municipio || p.nivel || '-'}</td>
                                <td className="text-center">
                                  {p.rutaProceso ? (
                                    <a
                                      href={p.rutaProceso}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-link-action"
                                      title="Ver proceso en SECOP Datos Abiertos"
                                    >
                                      <span>Ver Proceso</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. INTERPOL Notificaciones Rojas */}
                {(activeTab === 'ALL' || activeTab === 'INTERPOL') && selectedSources.includes('INTERPOL') && (
                  <div className="screening-source-section">
                    <div className="source-section-header">
                      <div className="source-title-group">
                        <span className="source-tag source-tag-interpol">INTERPOL</span>
                        <h4>Notificaciones Rojas de Búsqueda Internacional (Red Notices)</h4>
                      </div>
                      <span
                        className={`hits-chip ${interpolPersons.length > 0 ? 'hits-danger' : 'hits-clean'}`}
                      >
                        {interpolPersons.length}{' '}
                        {interpolPersons.length === 1 ? 'Requisitoria' : 'Requisitorias'}
                      </span>
                    </div>

                    {interpolPersons.length === 0 ? (
                      <div className="no-hits-box">
                        <CheckCircle2 size={18} className="text-success" />
                        <span>
                          Sin notificaciones rojas encontradas en Interpol para esta entidad o sus
                          representantes.
                        </span>
                      </div>
                    ) : (
                      <div className="table-responsive-wrapper table-nested">
                        <table className="ey-data-table">
                          <thead>
                            <tr>
                              <th>Apellidos</th>
                              <th>Nombres</th>
                              <th>Nacionalidad</th>
                              <th>Género</th>
                              <th>Edad</th>
                              <th>Buscado Por</th>
                              <th>Cargos / Delitos</th>
                              <th className="text-center">Ficha Interpol</th>
                            </tr>
                          </thead>
                          <tbody>
                            {interpolPersons.map((ip, idx) => (
                              <tr key={idx}>
                                <td className="font-semibold text-danger">{ip.familyName || '-'}</td>
                                <td>{ip.forename || '-'}</td>
                                <td>{ip.nationality || '-'}</td>
                                <td>{ip.gender || '-'}</td>
                                <td>{ip.age !== null && ip.age !== undefined ? ip.age : '-'}</td>
                                <td>{ip.wantedBy || '-'}</td>
                                <td className="cell-wrap-text">{ip.charges || '-'}</td>
                                <td className="text-center">
                                  {ip.detailUrl ? (
                                    <a
                                      href={ip.detailUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-link-action"
                                      title="Ver ficha oficial en Interpol.int"
                                    >
                                      <span>Ver Ficha</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="screening-footer-info">
            <span className="compliance-stamp">
              EY Compliance Engine v1.0 • Debida diligencia automatizada
            </span>
          </div>

          <div className="footer-action-buttons">
            {step === 1 && (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartScreening}
                  disabled={selectedSources.length === 0}
                >
                  <Search size={16} />
                  <span>Iniciar Cruce de Información</span>
                </button>
              </>
            )}

            {step === 2 && (
              <button type="button" className="btn btn-secondary" disabled>
                Analizando...
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ArrowLeft size={15} />
                  <span>Volver a Configurar Fuentes</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningModal;
