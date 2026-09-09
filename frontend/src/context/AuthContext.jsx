import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './authContextDef.js';
import { TOKEN_STORAGE_KEY } from '../api/client.js';
import { loginApi, getMeApi } from '../api/auth.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  // Validate session against backend /api/v1/auth/me on mount or token change
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    getMeApi()
      .then((profile) => {
        if (isMounted) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Listen for unauthorized 401 events broadcast by the Axios response interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * Log in with credentials and load verified user profile via /auth/me
   */
  const login = useCallback(async ({ email, password }) => {
    const loginResult = await loginApi({ email, password });
    const receivedToken = loginResult.token;

    // Persist JWT token
    localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
    setToken(receivedToken);

    // Retrieve verified authenticated user from /api/v1/auth/me
    const verifiedUser = await getMeApi();
    setUser(verifiedUser);

    return verifiedUser;
  }, []);

  /**
   * Log out and purge all client credentials
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      role: user?.role || null,
      isRecruiter: user?.role === 'recruiter',
      isInterviewer: user?.role === 'interviewer',
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
