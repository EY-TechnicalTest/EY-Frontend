import { useState, useEffect } from 'react';
import {
  X,
  Building,
  Save,
  UserPlus,
  Trash2,
  AlertCircle,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

const COUNTRY_OPTIONS = [
  'Perú',
  'Colombia',
  'México',
  'Chile',
  'Argentina',
  'Brasil',
  'Ecuador',
  'Bolivia',
  'Uruguay',
  'Paraguay',
  'Panamá',
  'Costa Rica',
  'Estados Unidos',
  'España',
  'Reino Unido',
  'Canadá',
  'Otro',
];

const INITIAL_FORM_STATE = {
  legalName: '',
  tradeName: '',
  taxId: '',
  phoneNumber: '',
  email: '',
  website: '',
  physicalAddress: '',
  country: 'Perú',
  annualRevenue: '',
  representatives: [
    {
      forename: '',
      familyName: '',
      email: '',
      documentNumber: '',
    },
  ],
};

export const SupplierModal = ({ isOpen, onClose, onSave, supplier = null, isSaving = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (supplier) {
      setFormData({
        legalName: supplier.legalName || '',
        tradeName: supplier.tradeName || '',
        taxId: supplier.taxId || '',
        phoneNumber: supplier.phoneNumber || '',
        email: supplier.email || '',
        website: supplier.website || '',
        physicalAddress: supplier.physicalAddress || '',
        country: supplier.country || 'Perú',
        annualRevenue: supplier.annualRevenue !== undefined ? String(supplier.annualRevenue) : '',
        representatives:
          supplier.representatives && supplier.representatives.length > 0
            ? supplier.representatives.map((r) => ({
                forename: r.forename || '',
                familyName: r.familyName || '',
                email: r.email || '',
                documentNumber: r.documentNumber || '',
              }))
            : [{ forename: '', familyName: '', email: '', documentNumber: '' }],
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setErrors({});
    setTouched({});
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const validateField = (field, value) => {
    switch (field) {
      case 'legalName':
        if (!value || !value.trim()) return 'La razón social es obligatoria.';
        if (value.length > 200) return 'La razón social no puede exceder 200 caracteres.';
        return '';

      case 'tradeName':
        if (!value || !value.trim()) return 'El nombre comercial es obligatorio.';
        if (value.length > 200) return 'El nombre comercial no puede exceder 200 caracteres.';
        return '';

      case 'taxId':
        if (!value || !value.trim()) return 'La identificación tributaria es obligatoria.';
        if (!/^\d{11}$/.test(value.trim())) {
          return 'Debe contener exactamente 11 dígitos numéricos (ej. RUC / NIT).';
        }
        return '';

      case 'phoneNumber':
        if (!value || !value.trim()) return 'El número telefónico es obligatorio.';
        if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(value.trim())) {
          return 'Formato de teléfono inválido (ej. +51 1 315-0800 o 987654321).';
        }
        return '';

      case 'email':
        if (!value || !value.trim()) return 'El correo electrónico es obligatorio.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Ingresa un correo electrónico con formato válido (ej. contacto@empresa.com).';
        }
        return '';

      case 'website':
        if (!value || !value.trim()) return 'El sitio web es obligatorio.';
        if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*/i.test(value.trim())) {
          return 'Ingresa una URL válida (ej. https://www.empresa.com).';
        }
        return '';

      case 'physicalAddress':
        if (!value || !value.trim()) return 'La dirección física es obligatoria.';
        if (value.length > 300) return 'La dirección no puede exceder 300 caracteres.';
        return '';

      case 'country':
        if (!value || !value.trim()) return 'Debes seleccionar un país.';
        return '';

      case 'annualRevenue': {
        if (value === '' || value === null || value === undefined) {
          return 'La facturación anual es obligatoria.';
        }
        const num = Number(value);
        if (isNaN(num) || num < 0) {
          return 'La facturación debe ser un número mayor o igual a 0.';
        }
        return '';
      }

      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleRepresentativeChange = (index, field, value) => {
    const updated = [...formData.representatives];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, representatives: updated }));
  };

  const addRepresentative = () => {
    setFormData((prev) => ({
      ...prev,
      representatives: [
        ...prev.representatives,
        { forename: '', familyName: '', email: '', documentNumber: '' },
      ],
    }));
  };

  const removeRepresentative = (index) => {
    setFormData((prev) => ({
      ...prev,
      representatives: prev.representatives.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = {};
    const fieldsToValidate = [
      'legalName',
      'tradeName',
      'taxId',
      'phoneNumber',
      'email',
      'website',
      'physicalAddress',
      'country',
      'annualRevenue',
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });

    // Validar representante legal si se colocó algún valor
    formData.representatives.forEach((rep, idx) => {
      if (rep.forename || rep.familyName || rep.email || rep.documentNumber) {
        if (!rep.forename.trim()) {
          newErrors[`rep_${idx}_forename`] = 'El nombre del representante es obligatorio.';
        }
        if (!rep.familyName.trim()) {
          newErrors[`rep_${idx}_familyName`] = 'El apellido del representante es obligatorio.';
        }
        if (rep.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email.trim())) {
          newErrors[`rep_${idx}_email`] = 'El correo del representante no es válido.';
        }
      }
    });

    setErrors(newErrors);
    setTouched({
      legalName: true,
      tradeName: true,
      taxId: true,
      phoneNumber: true,
      email: true,
      website: true,
      physicalAddress: true,
      country: true,
      annualRevenue: true,
    });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    let formattedWebsite = formData.website.trim();
    if (!/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    // Filtrar representantes vacíos
    const validRepresentatives = formData.representatives
      .filter((r) => r.forename.trim() && r.familyName.trim())
      .map((r) => ({
        forename: r.forename.trim(),
        familyName: r.familyName.trim(),
        email: r.email ? r.email.trim() : null,
        documentNumber: r.documentNumber ? r.documentNumber.trim() : null,
      }));

    const payload = {
      legalName: formData.legalName.trim(),
      tradeName: formData.tradeName.trim(),
      taxId: formData.taxId.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      website: formattedWebsite,
      physicalAddress: formData.physicalAddress.trim(),
      country: formData.country.trim(),
      annualRevenue: Number(formData.annualRevenue) || 0,
      representatives: validRepresentatives,
    };

    onSave(payload);
  };

  const revenuePreview = formData.annualRevenue
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(Number(formData.annualRevenue) || 0)
    : '$ 0.00';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Building size={22} className="text-ey-yellow" />
            </div>
            <div>
              <h2 className="modal-title">
                {supplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h2>
              <p className="modal-subtitle">
                {supplier
                  ? `Actualizando datos para ID #${supplier.id} - ${supplier.legalName}`
                  : 'Ingresa los datos para debida diligencia según requerimientos corporativos'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section-title">Información Corporativa y Tributaria</div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="legalName" className="form-label required">
                Razón Social (Alfanumérico)
              </label>
              <input
                id="legalName"
                type="text"
                className={`input-control ${errors.legalName ? 'input-error' : ''}`}
                placeholder="Ej. ALICORP S.A.A."
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                onBlur={() => handleBlur('legalName')}
                maxLength={200}
                required
              />
              {errors.legalName && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.legalName}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tradeName" className="form-label required">
                Nombre Comercial (Alfanumérico)
              </label>
              <input
                id="tradeName"
                type="text"
                className={`input-control ${errors.tradeName ? 'input-error' : ''}`}
                placeholder="Ej. ALICORP"
                value={formData.tradeName}
                onChange={(e) => handleChange('tradeName', e.target.value)}
                onBlur={() => handleBlur('tradeName')}
                maxLength={200}
                required
              />
              {errors.tradeName && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.tradeName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="taxId" className="form-label required">
                Identificación Tributaria (11 dígitos)
              </label>
              <input
                id="taxId"
                type="text"
                className={`input-control ${errors.taxId ? 'input-error' : ''}`}
                placeholder="20100055237"
                value={formData.taxId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  handleChange('taxId', val);
                }}
                onBlur={() => handleBlur('taxId')}
                maxLength={11}
                required
              />
              {errors.taxId ? (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.taxId}</span>
                </div>
              ) : (
                <span className="field-hint">Debe contener 11 dígitos numéricos exactos</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label required">
                Número Telefónico
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="phoneNumber"
                  type="tel"
                  className={`input-control ${errors.phoneNumber ? 'input-error' : ''}`}
                  placeholder="+51 1 315-0800"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  onBlur={() => handleBlur('phoneNumber')}
                  required
                />
              </div>
              {errors.phoneNumber && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label required">
                Correo Electrónico
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className={`input-control ${errors.email ? 'input-error' : ''}`}
                  placeholder="contacto@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                />
              </div>
              {errors.email && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-grid-3">
            {/* Sitio Web */}
            <div className="form-group">
              <label htmlFor="website" className="form-label required">
                Sitio Web (Enlace)
              </label>
              <div className="input-with-icon">
                <Globe size={16} className="input-icon" />
                <input
                  id="website"
                  type="text"
                  className={`input-control ${errors.website ? 'input-error' : ''}`}
                  placeholder="https://www.empresa.com"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  onBlur={() => handleBlur('website')}
                  required
                />
              </div>
              {errors.website && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.website}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="country" className="form-label required">
                País (Desplegable)
              </label>
              <select
                id="country"
                className={`select-control ${errors.country ? 'input-error' : ''}`}
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
                required
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.country && (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.country}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="annualRevenue" className="form-label required">
                Facturación Anual ($ USD)
              </label>
              <div className="input-with-icon">
                <DollarSign size={16} className="input-icon" />
                <input
                  id="annualRevenue"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-control ${errors.annualRevenue ? 'input-error' : ''}`}
                  placeholder="1500000"
                  value={formData.annualRevenue}
                  onChange={(e) => handleChange('annualRevenue', e.target.value)}
                  onBlur={() => handleBlur('annualRevenue')}
                  required
                />
              </div>
              {errors.annualRevenue ? (
                <div className="field-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.annualRevenue}</span>
                </div>
              ) : (
                <div className="accounting-preview">
                  Formato contabilidad: <strong>{revenuePreview}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="physicalAddress" className="form-label required">
              Dirección Física (Alfanumérico)
            </label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                id="physicalAddress"
                type="text"
                className={`input-control ${errors.physicalAddress ? 'input-error' : ''}`}
                placeholder="Av. Argentina 4793, Callao, Lima"
                value={formData.physicalAddress}
                onChange={(e) => handleChange('physicalAddress', e.target.value)}
                onBlur={() => handleBlur('physicalAddress')}
                maxLength={300}
                required
              />
            </div>
            {errors.physicalAddress && (
              <div className="field-error-msg">
                <AlertCircle size={13} />
                <span>{errors.physicalAddress}</span>
              </div>
            )}
          </div>

          <div className="form-divider"></div>
          <div className="representatives-section-header">
            <div>
              <div className="form-section-title">Representante Legal (Opcional para Screening)</div>
              <p className="form-section-subtitle">
                Utilizado para cruce en listas de personas físicas como INTERPOL (Red Notices).
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addRepresentative}
            >
              <UserPlus size={14} />
              <span>Añadir Representante</span>
            </button>
          </div>

          {formData.representatives.map((rep, idx) => (
            <div key={idx} className="representative-card-edit">
              <div className="rep-card-header">
                <span>Representante #{idx + 1}</span>
                {formData.representatives.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-rep"
                    onClick={() => removeRepresentative(idx)}
                    title="Quitar representante"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="form-grid-4">
                <div className="form-group">
                  <label className="form-label">Nombres</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Alfredo"
                    value={rep.forename}
                    onChange={(e) => handleRepresentativeChange(idx, 'forename', e.target.value)}
                  />
                  {errors[`rep_${idx}_forename`] && (
                    <div className="field-error-msg">
                      <AlertCircle size={12} />
                      <span>{errors[`rep_${idx}_forename`]}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Apellidos</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Perez"
                    value={rep.familyName}
                    onChange={(e) => handleRepresentativeChange(idx, 'familyName', e.target.value)}
                  />
                  {errors[`rep_${idx}_familyName`] && (
                    <div className="field-error-msg">
                      <AlertCircle size={12} />
                      <span>{errors[`rep_${idx}_familyName`]}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="aperez@alicorp.com.pe"
                    value={rep.email}
                    onChange={(e) => handleRepresentativeChange(idx, 'email', e.target.value)}
                  />
                  {errors[`rep_${idx}_email`] && (
                    <div className="field-error-msg">
                      <AlertCircle size={12} />
                      <span>{errors[`rep_${idx}_email`]}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">N° Documento</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="09876543"
                    value={rep.documentNumber}
                    onChange={(e) => handleRepresentativeChange(idx, 'documentNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{supplier ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
