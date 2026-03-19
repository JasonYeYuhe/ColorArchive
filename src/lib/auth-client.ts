"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.colorarchive.me";

export interface AuthUser {
  id: number;
  email: string;
  created_at: string;
}

export interface UserPreferences {
  favorites: string[];
  palette: string[];
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function fetchSession(): Promise<{ user: AuthUser | null }> {
  const response = await fetch(`${API_URL}/auth/session`, {
    credentials: "include",
  });

  return parseResponse<{ user: AuthUser | null }>(response);
}

export async function requestMagicLink(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/request-link`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  await parseResponse<{ ok: true }>(response);
}

export async function verifyMagicLink(token: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return parseResponse<{ ok: true; user: AuthUser }>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  await parseResponse<{ ok: true }>(response);
}

export async function fetchPreferences(): Promise<UserPreferences> {
  const response = await fetch(`${API_URL}/me/preferences`, {
    credentials: "include",
  });

  return parseResponse<UserPreferences>(response);
}

export async function savePreferences(preferences: UserPreferences): Promise<UserPreferences> {
  const response = await fetch(`${API_URL}/me/preferences`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  return parseResponse<UserPreferences>(response);
}
