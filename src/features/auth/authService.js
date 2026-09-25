import apiClient from '../../api/apiClient';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/api/auth/login', { username, password });
    if (response && response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem('ey_compliance_user', JSON.stringify({
        username: response.username || username,
        role: 'Compliance Officer',
      }));
    }
    return response;
  },

  logout() {
    apiClient.setToken(null);
    localStorage.removeItem('ey_compliance_user');
  },

  getCurrentUser() {
    try {
      const savedUser = localStorage.getItem('ey_compliance_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return apiClient.getToken();
  },

  isAuthenticated() {
    return Boolean(apiClient.getToken());
  },
};

export default authService;
