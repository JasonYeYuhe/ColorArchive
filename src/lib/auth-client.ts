"use client";

import { API_URL } from "@/src/lib/api-config";
export { API_URL };

export interface AuthUser {
  id: number;
  email: string;
  created_at: string;
}

export interface UserPreferences {
  favorites: string[];
  palette: string[];
}

export type UserTier = "anonymous" | "free" | "pro";

export interface AuthSession {
  user: AuthUser | null;
  auth: {
    googleEnabled: boolean;
    analyticsAccess: boolean;
    tier: UserTier;
  };
}

export interface AccountOrder {
  orderId: string;
  product: string;
  amount: number;
  currency: string;
  created_at: string;
  packId: string | null;
  downloadUrl: string | null;
  receiptUrl: string | null;
  packUrl: string | null;
  attribution: {
    source: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    landingPath: string | null;
  };
}

export interface AdminOrder {
  orderId: string;
  email: string;
  product: string;
  amount: number;
  currency: string;
  created_at: string;
  packId: string | null;
  packUrl: string | null;
  downloadUrl: string | null;
  receiptUrl: string | null;
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

export async function fetchSession(): Promise<AuthSession> {
  const response = await fetch(`${API_URL}/auth/session`, {
    credentials: "include",
  });

  return parseResponse<AuthSession>(response);
}

export async function requestMagicLink(email: string, next?: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/request-link`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, next }),
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

export async function fetchOrders(): Promise<{ orders: AccountOrder[] }> {
  const response = await fetch(`${API_URL}/me/orders`, {
    credentials: "include",
  });

  return parseResponse<{ orders: AccountOrder[] }>(response);
}

export async function resendOrderEmail(orderId: string): Promise<void> {
  const response = await fetch(`${API_URL}/me/orders/${encodeURIComponent(orderId)}/resend`, {
    method: "POST",
    credentials: "include",
  });

  await parseResponse<{ ok: true }>(response);
}

export async function fetchAdminOrders(params?: {
  email?: string;
  product?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: AdminOrder[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params?.email) qs.set("email", params.email);
  if (params?.product) qs.set("product", params.product);
  if (params?.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params?.dateTo) qs.set("dateTo", params.dateTo);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : "";
  const response = await fetch(`${API_URL}/admin/orders${query}`, {
    credentials: "include",
  });

  return parseResponse<{ orders: AdminOrder[]; total: number; page: number; limit: number }>(response);
}

/* ------------------------------------------------------------------ */
/*  Projects API                                                       */
/* ------------------------------------------------------------------ */

export interface Project {
  id: number;
  name: string;
  tags: string[];
  palette: string[];
  notes: string;
  shareId: string | null;
  hasCritique: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedProject {
  name: string;
  tags: string[];
  palette: string[];
  notes: string;
  critique: CritiqueResult | null;
  created_at: string;
  updated_at: string;
}

export interface CritiqueResult {
  score: string;
  harmony_type: string;
  contrast_issues: { pair: string; ratio: number; wcag_level: string }[];
  suggestions: { index: number; current_hex: string; replacement_hex: string; replacement_name: string; reason: string }[];
  cultural_notes: string;
  overall_assessment: string;
}

export interface UsageStats {
  tier: UserTier;
  ai: { used: number; limit: number | null };
  projects: { count: number; limit: number | null };
  favorites: { count: number };
}

export async function fetchUsage(): Promise<UsageStats> {
  const response = await fetch(`${API_URL}/me/usage`, {
    credentials: "include",
  });
  return parseResponse<UsageStats>(response);
}

export async function fetchProjects(): Promise<{ projects: Project[] }> {
  const response = await fetch(`${API_URL}/projects`, {
    credentials: "include",
  });
  return parseResponse<{ projects: Project[] }>(response);
}

export async function createProject(data: {
  name: string;
  tags?: string[];
  palette?: string[];
  notes?: string;
}): Promise<{ id: number; ok: true }> {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<{ id: number; ok: true }>(response);
}

export async function updateProject(
  id: number,
  data: Partial<{ name: string; tags: string[]; palette: string[]; notes: string; critique: CritiqueResult }>
): Promise<{ ok: true }> {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<{ ok: true }>(response);
}

export async function deleteProject(id: number): Promise<{ ok: true }> {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseResponse<{ ok: true }>(response);
}

export async function shareProject(id: number): Promise<{ shareId: string }> {
  const response = await fetch(`${API_URL}/projects/${id}/share`, {
    method: "POST",
    credentials: "include",
  });
  return parseResponse<{ shareId: string }>(response);
}

export async function fetchSharedProject(shareId: string): Promise<SharedProject> {
  const response = await fetch(`${API_URL}/projects/shared/${encodeURIComponent(shareId)}`);
  return parseResponse<SharedProject>(response);
}

export async function resendAdminOrderEmail(orderId: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(orderId)}/resend`, {
    method: "POST",
    credentials: "include",
  });

  await parseResponse<{ ok: true }>(response);
}

export interface AutopilotPinEntry {
  at: string;
  type: "color" | "collection" | "guide" | string;
  slug: string;
  title: string;
  link: string;
  pinId?: string;
  dryRun: boolean;
}

export interface AutopilotCommerceOrder {
  order_id: string;
  email: string;
  product: string;
  amount: number;
  currency: string;
  created_at: string;
  is_test?: number;
}

export interface AutopilotStatus {
  generated_at: string;
  include_test: boolean;
  test_rows_hidden: number;
  pinterest: {
    connected: boolean;
    username: string | null;
    expires_at: number | null;
    updated_at: string | null;
    last_pin_at: string | null;
    sandbox: boolean;
    pins_today: number;
    pins_last_7d: number;
    recent_pins: AutopilotPinEntry[];
  };
  commerce: {
    pro_users_total: number;
    new_pro_last_7d: number;
    orders_last_7d: number;
    recent_orders: AutopilotCommerceOrder[];
  };
}

export async function fetchAdminAutopilotStatus(
  options: { includeTest?: boolean } = {},
): Promise<AutopilotStatus> {
  const qs = options.includeTest ? "?includeTest=true" : "";
  const response = await fetch(`${API_URL}/admin/autopilot-status${qs}`, {
    credentials: "include",
  });
  return parseResponse<AutopilotStatus>(response);
}
