const TOKEN_KEY = 'lbh_token';
const NAME_KEY = 'lbh_name';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, name: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(NAME_KEY, name);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getStoredName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(NAME_KEY);
}
