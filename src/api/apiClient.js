// Cliente HTTP centralizado para la comunicación con el backend REST de EY (.NET Core)
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5261';

class ApiClient {
  constructor(baseUrl = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.onRateLimitCallback = null;
    this.onUnauthorizedCallback = null;
    this.lastRateLimitNoticeTime = 0;
    this.lastUnauthorizedNoticeTime = 0;
  }

  setRateLimitListener(callback) {
    this.onRateLimitCallback = callback;
  }

  setUnauthorizedListener(callback) {
    this.onUnauthorizedCallback = callback;
  }

  getToken() {
    return localStorage.getItem('ey_compliance_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('ey_compliance_token', token);
    } else {
      localStorage.removeItem('ey_compliance_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Manejo de Rate Limit (HTTP 429) - 20 llamadas por minuto
      if (response.status === 429) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: 'Has excedido el límite máximo de 20 llamadas por minuto. Por favor, espera antes de realizar más solicitudes.',
          };
        }

        const now = Date.now();
        // Throttle para evitar saturar la interfaz con notificaciones repetidas
        if (this.onRateLimitCallback && now - this.lastRateLimitNoticeTime > 8000) {
          this.lastRateLimitNoticeTime = now;
          this.onRateLimitCallback(errorData.message || 'Límite de 20 llamadas por minuto excedido.');
        }

        const error = new Error(errorData.message || 'Rate limit excedido (429)');
        error.status = 429;
        error.data = errorData;
        throw error;
      }

      // Manejo de No Autorizado (HTTP 401)
      if (response.status === 401) {
        const now = Date.now();
        if (this.onUnauthorizedCallback && now - this.lastUnauthorizedNoticeTime > 8000) {
          this.lastUnauthorizedNoticeTime = now;
          this.onUnauthorizedCallback();
        }
        const error = new Error('Sesión no autorizada o token expirado. Por favor, inicia sesión.');
        error.status = 401;
        throw error;
      }

      // No Content
      if (response.status === 204) {
        return null;
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMessage = `Error del servidor (${response.status})`;

        if (typeof data === 'object' && data !== null) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.title) {
            errorMessage = data.title;
          } else if (data.errors) {
            // Manejo de errores de validación de ModelState de ASP.NET
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors.join(' ');
          }
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const connError = new Error(
          `No se pudo conectar con el servidor backend en ${this.baseUrl}. Asegúrate de que el API .NET esté en ejecución.`
        );
        connError.status = 0;
        throw connError;
      }
      throw err;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  put(endpoint, body, headers = {}) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
