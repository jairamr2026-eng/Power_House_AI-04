// src/context/AuthContext.jsx
// Handles Supabase Auth in production and mock authentication only when explicitly enabled.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getAccessStatus } from '../api/mockApi';
import { USE_MOCK } from '../api/config';
import { API_BASE_URL } from '../api/config';
import { requireSupabase, supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const TOKEN_KEY = 'carbonshield_token';
const COMPANION_TOKEN_KEY = 'cs_supabase_access_token';
const EMPLOYEE_SESSION_KEY = 'carbonshield_employee_session_id';

async function startEmployeeSession(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  const memberships = await fetch(`${API_BASE_URL}/organizations/me`, { headers });
  if (!memberships.ok) return;
  const organizations = await memberships.json();
  const organizationId = organizations[0]?.organizations?.id;
  if (!organizationId) return;
  const response = await fetch(`${API_BASE_URL}/sessions/start`, { method: 'POST', headers, body: JSON.stringify({ organization_id: organizationId }) });
  if (response.ok) localStorage.setItem(EMPLOYEE_SESSION_KEY, (await response.json()).id);
}
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

  const setAuthenticatedSession = (session) => {
    const nextUser = { id: session.user.id, email: session.user.email || '', name: session.user.user_metadata?.full_name || session.user.email || 'Employee' };
    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(COMPANION_TOKEN_KEY, session.access_token);
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    if (USE_MOCK || !supabase) return undefined;
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => { if (mounted && data.session) setAuthenticatedSession(data.session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setAuthenticatedSession(session);
      else setUser(null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(COMPANION_TOKEN_KEY);
    }
  }, [user]);

  /**
   * login:
   * 1. Calls login(email, password) -> returns token and sanitized user (no password).
   * 2. Checks access status with getAccessStatus(simulateAfterHours).
   * 3. If outside working hours, returns { outsideHours: true, accessInfo } without authenticating.
   */
  const login = async (email, password, simulateAfterHours = false) => {
    setLoading(true);
    setError('');

    try {
      if (!USE_MOCK) {
        const client = requireSupabase();
        const { data, error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (authError || !data.session) throw new Error(authError?.message || 'Unable to sign in.');
        const authenticatedUser = setAuthenticatedSession(data.session);
        const accessStatus = await getAccessStatus(false);
        if (!accessStatus.allowed) {
          await client.auth.signOut();
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(COMPANION_TOKEN_KEY);
          setLoading(false);
          return { outsideHours: true, accessInfo: accessStatus };
        }
        // Session tracking is best-effort: a missing organization must not block a valid Auth login.
        void startEmployeeSession(data.session.access_token);
        setLoading(false);
        return { success: true, user: authenticatedUser };
      }

      // Demo-only path.
      const res = await apiLogin(email, password);

      // 2. Validate official working hours
      const accessStatus = await getAccessStatus(simulateAfterHours);

      if (!accessStatus.allowed) {
        setLoading(false);
        // Clear token so user remains unauthenticated
        localStorage.removeItem(TOKEN_KEY);
        return {
          outsideHours: true,
          accessInfo: accessStatus,
        };
      }

      // 3. Set authenticated user
      setUser(res.user);
      setLoading(false);
      return { success: true, user: res.user };
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem(EMPLOYEE_SESSION_KEY);
    const accessToken = localStorage.getItem(TOKEN_KEY);
    if (!USE_MOCK && sessionId && accessToken) {
      await fetch(`${API_BASE_URL}/sessions/end`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId }) }).catch(() => undefined);
    }
    if (!USE_MOCK && supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COMPANION_TOKEN_KEY);
    localStorage.removeItem(EMPLOYEE_SESSION_KEY);
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
