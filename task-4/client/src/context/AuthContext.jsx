import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setAuthToken, AUTH_STORAGE_KEY } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(AUTH_STORAGE_KEY));

  const setToken = useCallback((t) => {
    if (t) {
      localStorage.setItem(AUTH_STORAGE_KEY, t);
      setAuthToken(t);
      setTokenState(t);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken(null);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await authApi.me();
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setToken]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      isSuperadmin: user?.role === "superadmin",
    }),
    [token, user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
