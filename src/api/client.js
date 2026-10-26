// src/api/client.js
// Fetch wrapper sending JSON and Bearer token from localStorage.
// Never stores or logs passwords.

import { API_BASE_URL } from './config';

/**
 * apiClient handles REST requests with automated JSON parsing,
 * token authorization header injection, and standardized error classification.
 */
export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem('carbonshield_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('carbonshield_token');
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.detail || errorData.message || 'Unauthorized (401). Please sign in again.');
      err.status = 401;
      throw err;
    }

    if (response.status >= 500) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.detail || errorData.message || 'Server error (500). Please try again shortly.');
      err.status = response.status;
      throw err;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      throw err;
    }

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkErr = new Error('Network failure: Unable to reach the backend server at ' + API_BASE_URL);
      networkErr.status = 0;
      throw networkErr;
    }
    throw err;
  }
}
