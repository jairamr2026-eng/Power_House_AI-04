
 // Handles Supabase Auth in production and mock authentication only when explicitly enabled.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  login as apiLogin,
  getAccessStatus,
} from '../api/mockApi';

import {
  USE_MOCK,
  API_BASE_URL,
} from '../api/config';

import {
  requireSupabase,
  supabase,
} from '../lib/supabase';

const AuthContext = createContext(null);

const TOKEN_KEY = 'carbonshield_token';
const COMPANION_TOKEN_KEY = 'cs_supabase_access_token';
const EMPLOYEE_SESSION_KEY = 'carbonshield_employee_session_id';
const USER_KEY = 'carbonshield_user';

async function startEmployeeSession(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const memberships = await fetch(
      `${API_BASE_URL}/organizations/me`,
      { headers }
    );

    if (!memberships.ok) return;

    const organizations = await memberships.json();
    const organizationId = organizations[0]?.organizations?.id;

    if (!organizationId) return;

    const response = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        organization_id: organizationId,
      }),
    });

    if (response.ok) {
      const session = await response.json();
      if (session.id) {
        localStorage.setItem(EMPLOYEE_SESSION_KEY, session.id);
      }
    }
  } catch (err) {
    // Session tracking is best-effort and must not block login.
    console.error('Unable to start employee session:', err);
  }
}

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
    const nextUser = {
      id: session.user.id,
      email: session.user.email || '',
      name:
        session.user.user_metadata?.full_name ||
        session.user.email ||
        'Employee',
    };

    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(COMPANION_TOKEN_KEY, session.access_token);

    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    if (USE_MOCK || !supabase) return undefined;

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setAuthenticatedSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthenticatedSession(session);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      // Production authentication through Supabase.
      if (!USE_MOCK) {
        const client = requireSupabase();

        const {
          data,
          error: authError,
        } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError || !data.session) {
          throw new Error(
            authError?.message || 'Unable to sign in.'
          );
        }

        const authenticatedUser = setAuthenticatedSession(data.session);

        try {
          const accessStatus = await getAccessStatus(false);

          if (!accessStatus.allowed) {
            await client.auth.signOut();
            setUser(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(COMPANION_TOKEN_KEY);

            return {
              outsideHours: true,
              accessInfo: accessStatus,
            };
          }
        } catch (statusError) {
          // Fail closed if access status cannot be verified.
          await client.auth.signOut();
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(COMPANION_TOKEN_KEY);
          throw statusError;
        }

        // Session tracking must not block a valid login.
        void startEmployeeSession(data.session.access_token);

        return {
          success: true,
          user: authenticatedUser,
        };
      }

      // Demo/mock authentication only when explicitly enabled.
      const res = await apiLogin(email, password);

      setUser(res.user);

      return {
        success: true,
        user: res.user,
      };
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem(EMPLOYEE_SESSION_KEY);
    const accessToken = localStorage.getItem(TOKEN_KEY);

    if (!USE_MOCK && sessionId && accessToken) {
      await fetch(`${API_BASE_URL}/sessions/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      }).catch(() => undefined);
    }

    if (!USE_MOCK && supabase) {
      await supabase.auth.signOut();
    }

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
