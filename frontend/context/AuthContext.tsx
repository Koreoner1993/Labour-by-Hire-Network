'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getToken, setToken, clearToken, getStoredName } from '@/lib/auth';
import { api } from '@/lib/api';
import type { Worker, AuthResponse } from '@/lib/types';

interface AuthContextValue {
  token: string | null;
  worker: Worker | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, workerData: Worker) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = getToken();
    if (!t) { setIsLoading(false); return; }
    try {
      const data = await api<{ worker: Worker }>('GET', '/auth/profile', undefined, t);
      setTokenState(t);
      setWorker(data.worker);
    } catch {
      clearToken();
      setTokenState(null);
      setWorker(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await api<AuthResponse>('POST', '/auth/login', { email, password });
    setToken(data.token, `${data.worker.first_name} ${data.worker.last_name}`);
    setTokenState(data.token);
    setWorker(data.worker);
  };

  const loginWithToken = (tok: string, workerData: Worker) => {
    setToken(tok, `${workerData.first_name} ${workerData.last_name}`);
    setTokenState(tok);
    setWorker(workerData);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setWorker(null);
  };

  return (
    <AuthContext.Provider value={{ token, worker, isLoading, login, loginWithToken, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
