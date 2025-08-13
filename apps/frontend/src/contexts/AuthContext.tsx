import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setTokens } from '../services/api';

export type User = { id: string; email?: string; username: string; roles: string[] } | null;

type AuthContextType = {
  user: User;
  login: (identifier: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const init = async () => {
      const rt = localStorage.getItem('refreshToken');
      if (!rt) return;
      try {
        const { data: r } = await api.post('/auth/refresh', { refreshToken: rt });
        setTokens(r.accessToken, r.refreshToken);
        const { data: me } = await api.get('/auth/me');
        setUser(me.user);
      } catch {
        setTokens(null, null);
      }
    };
    init();
  }, []);

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const guestLoginFn = async () => {
    const { data } = await api.post('/auth/guest');
    setTokens(data.accessToken, data.refreshToken);
    setUser({ id: 'guest', username: 'Guest', roles: ['GUEST'] });
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    setTokens(null, null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, guestLogin: guestLoginFn, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};