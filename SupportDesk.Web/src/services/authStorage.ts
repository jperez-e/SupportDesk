import type { LoginResponse } from "./authService";

const AUTH_KEY = "supportdesk_auth";

export function saveAuth(auth: LoginResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function getAuth(): LoginResponse | null {
  const storedAuth = localStorage.getItem(AUTH_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth) as LoginResponse;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function removeAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}