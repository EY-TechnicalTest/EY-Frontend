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

  isTokenExpired(token) {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.exp) return false;
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  },

  getCurrentUser() {
    const token = apiClient.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }
    try {
      const savedUser = localStorage.getItem('ey_compliance_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    const token = apiClient.getToken();
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },
};

export default authService;
