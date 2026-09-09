import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('zendabot_token');
      const savedUser = localStorage.getItem('zendabot_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Erro ao restaurar sessão de autenticação:', err);
      localStorage.removeItem('zendabot_token');
      localStorage.removeItem('zendabot_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('zendabot_token', data.token);
    localStorage.setItem('zendabot_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('zendabot_token', data.token);
    localStorage.setItem('zendabot_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('zendabot_token');
    localStorage.removeItem('zendabot_user');
  };

  const tenantId = user?.id || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenantId,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
