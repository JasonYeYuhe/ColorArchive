/**
 * Pinterest API integration (v5)
 *
 * OAuth 2.0 flow:
 *   1. User clicks "Save to Pinterest" → redirect to Pinterest authorize URL
 *   2. Pinterest redirects back with ?code=… to /pinterest/callback/
 *   3. Callback page exchanges code for access_token via our proxy (or direct if CORS allows)
 *   4. Token stored in localStorage; user picks a board; pin is created
 *
 * All logic is client-side — no backend required for the static site.
 */

const PINTEREST_APP_ID = "1555251";
const REDIRECT_URI = "https://colorarchive.me/pinterest/callback/";

const SCOPES = "boards:read,pins:read,pins:write,boards:write";
const LS_KEY = "colorarchive-pinterest-token";

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

/* ── API helpers ───────────────────────────────────────────── */

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
  const res = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
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

  const res = await fetch("https://api.pinterest.com/v5/pins", {
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
