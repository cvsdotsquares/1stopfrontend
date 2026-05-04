// lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth-related error codes returned by the backend `authenticateToken`
// middleware. We treat any of these as "session is dead, log out" — even when
// the status code is 403 (older backend builds returned 403 for expired
// tokens; new builds return 401). Keep this list in sync with
// 1stopbackend/src/middleware/auth.js.
const AUTH_ERROR_CODES = new Set(['NO_TOKEN', 'TOKEN_EXPIRED', 'INVALID_TOKEN']);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {

    // only run in browser
    if (typeof window !== "undefined") {

      const token =
        localStorage.getItem("auth_token");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

    }

    return config;
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const code = error.response?.data?.code as string | undefined;

    // Treat all 401s as session failures. Treat 403 as a session failure only
    // when the backend explicitly tags it with an auth error code, so that
    // genuine "authenticated but not allowed" 403s (admin-only endpoints,
    // unverified email, inactive account, etc.) don't accidentally log the
    // user out.
    const isSessionFailure =
      status === 401 || (status === 403 && !!code && AUTH_ERROR_CODES.has(code));

    if (isSessionFailure) {
      // Fully tear down the session so the header / persisted store stop
      // showing the user as logged in. logout() clears both `auth_token` and
      // the zustand-persist `auth-storage` blob.
      try {
        useAuthStore.getState().logout();
      } catch {
        // Defensive: if the store can't be reached for any reason, fall back
        // to a manual wipe.
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth-storage');
      }

      // Avoid a redirect loop when the failure happens on an auth screen
      // (e.g. wrong password on /auth/login should stay on /auth/login).
      const path = window.location.pathname || '';
      if (!path.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;