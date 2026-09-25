// Servicio oficial en tiempo real contra la API pública de INTERPOL Red Notices
// Endpoint: https://ws-public.interpol.int/notices/v1/red (Con soporte CORS universal: Access-Control-Allow-Origin: *)

const COUNTRY_MAP = {
  PE: 'Perú',
  CO: 'Colombia',
  AR: 'Argentina',
  CL: 'Chile',
  EC: 'Ecuador',
  BO: 'Bolivia',
  BR: 'Brasil',
  VE: 'Venezuela',
  UY: 'Uruguay',
  PY: 'Paraguay',
  MX: 'México',
  US: 'Estados Unidos',
  ES: 'España',
  FR: 'Francia',
  IT: 'Italia',
  DE: 'Alemania',
  GB: 'Reino Unido',
  PA: 'Panamá',
  CR: 'Costa Rica',
  GT: 'Guatemala',
  HN: 'Honduras',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  DO: 'República Dominicana',
};

const mapCountry = (code) => {
  if (!code) return 'No especificado';
  const upper = code.trim().toUpperCase();
  return COUNTRY_MAP[upper] || upper;
};

/**
 * Consulta en tiempo real la base de datos de Notificaciones Rojas de INTERPOL
 * para cualquier persona física, sin nombres predefinidos ni hardcoding.
 *
 * @param {Object} params - { familyName, forename, nationality }
 * @returns {Promise<Array>} Lista de coincidencias oficiales con cargos, país y detalles.
 */
export const searchInterpolLive = async ({ familyName = '', forename = '', nationality = '' } = {}) => {
  const cleanFamily = (familyName || '').trim();
  const cleanFore = (forename || '').trim();

  if (!cleanFamily && !cleanFore) {
    return [];
  }

  const searchCandidates = [];

  const familyParts = cleanFamily.split(/\s+/).filter(Boolean);
  const foreParts = cleanFore.split(/\s+/).filter(Boolean);

  if (cleanFamily && cleanFore) {
    searchCandidates.push({ name: cleanFamily, forename: cleanFore });
  }

  // nombres compuestos
  if (cleanFamily && foreParts.length > 1) {
    searchCandidates.push({ name: cleanFamily, forename: foreParts[0] });
  }

  // apellidos compuestos 
  if (familyParts.length > 1 && cleanFore) {
    searchCandidates.push({ name: familyParts[0], forename: cleanFore });
    if (foreParts.length > 1) {
      searchCandidates.push({ name: familyParts[0], forename: foreParts[0] });
    }
  }

  if (cleanFamily) {
    searchCandidates.push({ name: cleanFamily });
    if (familyParts.length > 1) {
      searchCandidates.push({ name: familyParts[0] });
    }
  }

  if (!cleanFamily && cleanFore) {
    searchCandidates.push({ forename: cleanFore });
  }

  const seenIds = new Set();
  const results = [];

  for (const candidate of searchCandidates) {
    try {
      const params = new URLSearchParams();
      if (candidate.name) params.set('name', candidate.name);
      if (candidate.forename) params.set('forename', candidate.forename);
      if (nationality) params.set('nationality', nationality);
      params.set('resultPerPage', '20');

      const url = `https://ws-public.interpol.int/notices/v1/red?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const notices = data?._embedded?.notices || [];

      for (const notice of notices) {
        if (!notice.entity_id || seenIds.has(notice.entity_id)) continue;

        // Validar que la coincidencia sea relevante con el nombre buscado
        const noticeName = (notice.name || '').toUpperCase();
        const noticeFore = (notice.forename || '').toUpperCase();
        const searchFamUpper = cleanFamily.toUpperCase();
        const searchForeUpper = cleanFore.toUpperCase();

        const familyMatches =
          !searchFamUpper ||
          searchFamUpper.split(/\s+/).some((p) => noticeName.includes(p)) ||
          noticeName.split(/\s+/).some((p) => searchFamUpper.includes(p));

        const foreMatches =
          !searchForeUpper ||
          searchForeUpper.split(/\s+/).some((p) => noticeFore.includes(p)) ||
          noticeFore.split(/\s+/).some((p) => searchForeUpper.includes(p));

        if (!familyMatches || !foreMatches) {
          continue; 
        }

        seenIds.add(notice.entity_id);

        let charges = 'Notificación Roja de captura internacional emitida por mandato judicial.';
        let issuingCountry = 'Autoridades Judiciales Internacionales';
        let sex = notice.sex_id;

        let age = null;
        if (notice.date_of_birth) {
          const birthYear = parseInt(notice.date_of_birth.substring(0, 4), 10);
          if (!isNaN(birthYear)) {
            age = new Date().getFullYear() - birthYear;
          }
        }

        if (notice._links?.self?.href) {
          try {
            const detailRes = await fetch(notice._links.self.href, {
              headers: { Accept: 'application/json' },
            });
            if (detailRes.ok) {
              const detail = await detailRes.json();
              sex = detail.sex_id || sex;
              if (detail.arrest_warrants && detail.arrest_warrants.length > 0) {
                const warrant = detail.arrest_warrants[0];
                charges = warrant.charge || charges;
                if (warrant.issuing_country_id) {
                  issuingCountry = `Interpol / País requirente: ${mapCountry(warrant.issuing_country_id)}`;
                }
              }
            }
          } catch (detailErr) {
          }
        }

        // Mapeo de nacionalidad
        const natCodes = notice.nationalities || [];
        const natNames = natCodes.map((c) => mapCountry(c)).join(', ') || 'No especificada';

        results.push({
          familyName: notice.name || '-',
          forename: notice.forename || '-',
          nationality: natNames,
          gender: sex === 'F' ? 'Femenino' : sex === 'M' ? 'Masculino' : 'No especificado',
          age: age,
          wantedBy: issuingCountry,
          charges: charges,
          detailUrl: 'https://www.interpol.int/How-we-work/Notices/Red-Notices/View-Red-Notices',
        });
      }

      if (results.length > 0) {
        break;
      }
    } catch (err) {
      console.warn('[InterpolLive] Error al consultar API oficial:', err.message);
    }
  }

  return results;
};

export default searchInterpolLive;
