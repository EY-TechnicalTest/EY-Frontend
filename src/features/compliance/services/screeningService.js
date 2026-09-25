import apiClient from '../../../api/apiClient';

export const screeningService = {
  async checkMultiSources(entityName, sources = ['SMV', 'SECOP', 'INTERPOL'], representativeName = null) {
    return await apiClient.post('/api/screening/check', {
      entityName,
      sources,
      representativeName,
    });
  },

  async searchSmv(entityName) {
    return await apiClient.post('/api/screening/smv', { entityName });
  },

  async searchSecop(entityName) {
    return await apiClient.post('/api/screening/secop', { entityName });
  },

  async searchInterpol(familyName, forename) {
    return await apiClient.post('/api/screening/interpol', { familyName, forename });
  },
};

export default screeningService;
