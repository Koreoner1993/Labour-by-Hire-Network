const TOKEN_KEY = 'lbh_token';
const NAME_KEY = 'lbh_name';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, name?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (name) localStorage.setItem(NAME_KEY, name);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getStoredName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(NAME_KEY);
}

export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function isTokenValid(token: string): boolean {
  return !isTokenExpired(token);
}
