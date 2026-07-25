/**
 * Cliente HTTP do painel.
 *
 * Unico caminho do browser para os dados: o acesso ao Firestore acontece apenas no
 * servidor, via Admin SDK. A sessao viaja num cookie HttpOnly, por isso todas as
 * chamadas usam `credentials: "same-origin"` e nao existe header de token.
 */

const BASE = "/api/admin";

export type AdminUserRole = "admin" | "editor" | "viewer";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  disabled: boolean;
  role: AdminUserRole;
  /** Derivado do papel pelo servidor; a UI nao recalcula a tabela de permissoes. */
  canManageUsers: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined;

  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error || `Falha na requisicao (${response.status})`, response.status);
  }

  return payload as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const adminApi = {
  auth: {
    setupState: () => request<{ needsSetup: boolean; configured: boolean }>("/auth/setup"),
    createFirstAdmin: (body: { name: string; email: string; password: string; altcha: string }) =>
      request<{ user: AdminUser }>("/auth/setup", { method: "POST", body: json(body) }),
    login: (body: { email: string; password: string; altcha: string }) =>
      request<{ user: AdminUser; migratedTo?: string }>("/auth/login", {
        method: "POST",
        body: json(body),
      }),
    logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: AdminUser }>("/auth/me"),
  },

  users: {
    list: () => request<{ data: AdminUser[] }>("/users"),
    create: (body: { name: string; email: string; password: string; role?: AdminUserRole }) =>
      request<{ id: string }>("/users", { method: "POST", body: json(body) }),
    update: (
      userId: string,
      body: Partial<{
        name: string;
        email: string;
        password: string;
        disabled: boolean;
        role: AdminUserRole;
      }>,
    ) => request<{ success: boolean }>(`/users/${userId}`, { method: "PATCH", body: json(body) }),
    remove: (userId: string) =>
      request<{ success: boolean }>(`/users/${userId}`, { method: "DELETE" }),
  },

  endpoints: {
    list: () => request<{ data: any[] }>("/endpoints"),
    create: (body: { title: string; router: string; campos: any[] }) =>
      request<{ id: string }>("/endpoints", { method: "POST", body: json(body) }),
    update: (endpointId: string, body: Record<string, unknown>) =>
      request<{ success: boolean }>(`/endpoints/${endpointId}`, {
        method: "PATCH",
        body: json(body),
      }),
    remove: (endpointId: string) =>
      request<{ success: boolean }>(`/endpoints/${endpointId}`, { method: "DELETE" }),
    refreshCache: (endpointId: string) =>
      request<{ success: boolean; cacheRefreshedAt: string }>(
        `/endpoints/${endpointId}/cache-refresh`,
        { method: "POST" },
      ),
    history: (endpointId: string) =>
      request<{ data: any[] }>(`/endpoints/${endpointId}/history`),
  },

  items: {
    list: (endpointId: string) => request<{ data: any[] }>(`/endpoints/${endpointId}/items`),
    create: (endpointId: string, items: any[]) =>
      request<{ id: string }>(`/endpoints/${endpointId}/items`, {
        method: "POST",
        body: json({ items }),
      }),
    update: (endpointId: string, itemId: string, items: any[]) =>
      request<{ success: boolean }>(`/endpoints/${endpointId}/items/${itemId}`, {
        method: "PATCH",
        body: json({ items }),
      }),
    remove: (endpointId: string, itemId: string) =>
      request<{ success: boolean }>(`/endpoints/${endpointId}/items/${itemId}`, {
        method: "DELETE",
      }),
  },
};
