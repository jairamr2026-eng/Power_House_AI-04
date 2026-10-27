// src/context/AuthContext.jsx
// Handles employee mock authentication.
// Stores only a fake token in localStorage, NEVER passwords.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/mockApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'carbonshield_token';
const USER_KEY = 'carbonshield_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      return token && stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const res = await apiLogin(email, password);
      setUser(res.user);
      setLoading(false);
      return { success: true, user: res.user };
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    error,
    setError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
