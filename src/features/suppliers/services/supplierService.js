import apiClient from '../../../api/apiClient';

export const supplierService = {
  async getAllSuppliers() {
    return await apiClient.get('/api/suppliers');
  },

  async getSupplierById(id) {
    return await apiClient.get(`/api/suppliers/${id}`);
  },

  async createSupplier(supplierData) {
    return await apiClient.post('/api/suppliers', supplierData);
  },

  async updateSupplier(id, supplierData) {
    return await apiClient.put(`/api/suppliers/${id}`, supplierData);
  },

  async deleteSupplier(id) {
    return await apiClient.delete(`/api/suppliers/${id}`);
  },

  async screenSupplier(id, sources = ['SMV', 'SECOP', 'INTERPOL']) {
    return await apiClient.post(`/api/suppliers/${id}/screening`, { sources });
  },
};

export default supplierService;
