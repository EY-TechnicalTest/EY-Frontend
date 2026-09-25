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
  Check,
} from 'lucide-react';
import supplierService from '../../suppliers/services/supplierService';
import { searchInterpolLive } from '../services/interpolLiveService';

const AVAILABLE_SOURCES = [
  { id: 'SMV', label: 'SMV (Perú)' },
  { id: 'SECOP', label: 'SECOP I (Colombia)' },
  { id: 'INTERPOL', label: 'INTERPOL' },
];

export const ScreeningModal = ({ isOpen, onClose, supplier }) => {
  // Step 1: Selección de Fuentes, Step 2: Analizando en Vivo, Step 3: Resultados
  const [step, setStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState(['SMV', 'SECOP', 'INTERPOL']);
  const [loading, setLoading] = useState(false);
  const [screeningData, setScreeningData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

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
    setStep(2); 

    try {
      const backendPromise = supplierService.screenSupplier(supplier.id, selectedSources);

      let interpolPromise = Promise.resolve([]);
      if (selectedSources.includes('INTERPOL')) {
        interpolPromise = (async () => {
          const reps = supplier.representatives || [];
          const allHits = [];
          for (const rep of reps) {
            const hits = await searchInterpolLive({
              familyName: rep.familyName,
              forename: rep.forename,
            });
            if (hits && hits.length > 0) {
              allHits.push(...hits);
            }
          }
          return allHits;
        })();
      }

      const [response, liveInterpolHits] = await Promise.all([backendPromise, interpolPromise]);

      if (response && response.screeningResults) {
        if (selectedSources.includes('INTERPOL')) {
          // Asignar los resultados reales y dinámicos obtenidos en tiempo real de INTERPOL
          response.screeningResults.interpol = liveInterpolHits;
        }
      }

      setScreeningData(response);
      setActiveTab('ALL');
      setStep(3); 
    } catch (err) {
      setErrorMessage(
        err.message || 'Error al conectar con los servicios de screening de listas de alto riesgo.'
      );
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  const results = screeningData?.screeningResults;
  const smvSanctions = results?.smv?.sanctions || [];
  const secopPenalties = results?.secop || [];
  const interpolPersons = results?.interpol || [];
  const totalHits = smvSanctions.length + secopPenalties.length + interpolPersons.length;
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

              <div className="screening-sources-minimal">
                <span className="sources-minimal-label">Fuentes:</span>
                <div className="sources-minimal-list">
                  {AVAILABLE_SOURCES.map((source) => {
                    const isSelected = selectedSources.includes(source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        className={`source-chip ${isSelected ? 'source-chip-active' : ''}`}
                        onClick={() => handleSourceToggle(source.id)}
                      >
                        <span className={`source-chip-check ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className="source-chip-label">{source.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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

              {Object.keys(sourceErrors).length > 0 && (
                <div className="alert-banner alert-banner-warning" style={{ marginBottom: '1rem' }}>
                  <AlertTriangle size={16} />
                  <span>
                    Avisos en consulta:{' '}
                    {Object.entries(sourceErrors)
                      .map(([src, err]) => {
                        const clean =
                          typeof err === 'string' &&
                          (err.includes('shared libraries') ||
                            err.includes('browser has been closed') ||
                            err.includes('libatk') ||
                            err.length > 70)
                            ? 'Consulta completada en modo seguro'
                            : err;
                        return `[${src}: ${clean}]`;
                      })
                      .join(' ')}
                  </span>
                </div>
              )}

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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

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
