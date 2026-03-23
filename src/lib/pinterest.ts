/**
 * Pinterest API integration (v5)
 *
 * OAuth 2.0 flow:
 *   1. User clicks "Save to Pinterest" → redirect to Pinterest authorize URL
 *   2. Pinterest redirects back with ?code=… to /pinterest/callback/
 *   3. Callback page exchanges code for access_token via our backend proxy
 *   4. Token stored in localStorage; user picks a board; pin is created
 *
 * All Pinterest API calls go through our backend proxy at api.colorarchive.me
 * to avoid CORS issues (Pinterest API does not support browser-origin requests).
 */

const PINTEREST_APP_ID = "1555251";
const REDIRECT_URI = "https://colorarchive.me/pinterest/callback/";
const API_PROXY = "https://api.colorarchive.me/pinterest";

const SCOPES = "boards:read,pins:read,pins:write,boards:write";
const LS_KEY = "colorarchive-pinterest-token";
const LS_RETURN_KEY = "colorarchive-pinterest-return";

/* ── Auth helpers ──────────────────────────────────────────── */

export function getPinterestAuthUrl(state?: string): string {
  const s = state ?? crypto.randomUUID();
  return (
    `https://www.pinterest.com/oauth/?` +
    `client_id=${PINTEREST_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&state=${encodeURIComponent(s)}`
  );
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(LS_KEY, token);
  window.dispatchEvent(new CustomEvent("pinterest-token-change"));
}

export function clearToken(): void {
  localStorage.removeItem(LS_KEY);
  window.dispatchEvent(new CustomEvent("pinterest-token-change"));
}

/** Save the current path so we can return after OAuth. */
export function setReturnPath(path: string): void {
  localStorage.setItem(LS_RETURN_KEY, path);
}

/** Get and clear the saved return path. */
export function consumeReturnPath(): string {
  const path = localStorage.getItem(LS_RETURN_KEY) || "/";
  localStorage.removeItem(LS_RETURN_KEY);
  return path;
}

export function subscribeToPinterestToken(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener("pinterest-token-change", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === LS_KEY) cb();
  });
  return () => {
    window.removeEventListener("pinterest-token-change", handler);
  };
}

/** Exchange OAuth authorization code for an access token via backend proxy. */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(`${API_PROXY}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} — ${text}`);
  }
  const data: { access_token: string } = await res.json();
  return data.access_token;
}

/* ── API helpers (via backend proxy) ───────────────────────── */

interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy: string;
}

interface PinterestBoardsResponse {
  items: PinterestBoard[];
  bookmark?: string;
}

export async function fetchBoards(token: string): Promise<PinterestBoard[]> {
  const res = await fetch(`${API_PROXY}/boards`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error("Pinterest session expired. Please reconnect.");
    }
    throw new Error(`Failed to fetch boards: ${res.status}`);
  }
  const data: PinterestBoardsResponse = await res.json();
  return data.items;
}

interface CreatePinParams {
  token: string;
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  altText?: string;
}

export async function createPin(params: CreatePinParams): Promise<{ id: string }> {
  const body: Record<string, unknown> = {
    board_id: params.boardId,
    title: params.title,
    description: params.description,
    link: params.link,
    media_source: {
      source_type: "image_url",
      url: params.imageUrl,
    },
  };
  if (params.altText) {
    body.alt_text = params.altText;
  }

  const res = await fetch(`${API_PROXY}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create pin: ${res.status} — ${text}`);
  }
  return res.json();
}
