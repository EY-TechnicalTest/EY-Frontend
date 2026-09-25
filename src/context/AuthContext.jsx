/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../features/auth/authService';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mantiene la sesión activa si el token es válido al refrescar la página
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState(null);

  const login = useCallback(async (username, password) => {
    const res = await authService.login(username, password);
    setToken(res.token);
    setUser({ username: res.username || username, role: 'Compliance Officer' });
    setIsAuthModalOpen(false);
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const handleQuickDemoLogin = useCallback(async () => {
    try {
      await login('admin', 'admin123');
    } catch (e) {
      console.warn('Auto-login demo skipped:', e.message);
    }
  }, [login]);

  useEffect(() => {
    apiClient.setRateLimitListener((msg) => {
      setRateLimitMessage(msg);
      setTimeout(() => setRateLimitMessage(null), 12000);
    });

    apiClient.setUnauthorizedListener(() => {
      logout();
    });
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        handleQuickDemoLogin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        rateLimitMessage,
        clearRateLimitMessage: () => setRateLimitMessage(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
