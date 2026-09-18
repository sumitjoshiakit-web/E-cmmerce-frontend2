import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage('auth_user', null));

  useEffect(() => {
    saveToStorage('auth_user', user);
  }, [user]);

  const loginAsGuest = useCallback((customName = 'Guest') => {
    setUser({ id: 'user_' + Date.now(), name: customName || 'Guest', role: 'customer' });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
