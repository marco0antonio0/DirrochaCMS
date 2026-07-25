export const USER_COLLECTION = "users_collections";
export const CONFIGURATION_COLLECTION = "configurations";
export const AUTH_SETTINGS_DOC = "auth_settings";

/**
 * Papeis do painel.
 *
 * - `admin`  : tudo, incluindo gerenciar contas.
 * - `editor` : cria, edita e exclui conteudo (endpoints e registros).
 * - `viewer` : somente leitura.
 */
export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = "editor";

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Leitor",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Acesso total, incluindo gerenciar contas do painel.",
  editor: "Cria, edita e exclui endpoints e registros. Nao gerencia contas.",
  viewer: "Somente leitura. Nao altera nada.",
};

export interface RoleCapabilities {
  /** Ler endpoints, registros e historico. */
  read: boolean;
  /** Criar e editar endpoints e registros. */
  write: boolean;
  /** Excluir endpoints e registros. */
  delete: boolean;
  /** Criar, editar e excluir contas do painel. */
  manageUsers: boolean;
}

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapabilities> = {
  admin: { read: true, write: true, delete: true, manageUsers: true },
  editor: { read: true, write: true, delete: true, manageUsers: false },
  viewer: { read: true, write: false, delete: false, manageUsers: false },
};

export const capabilitiesForRole = (role: UserRole): RoleCapabilities =>
  ROLE_CAPABILITIES[role] ?? ROLE_CAPABILITIES.viewer;

/**
 * Resolve o papel de um documento de usuario.
 *
 * Contas criadas antes dos papeis nao tem o campo `role`; nesse caso derivamos do
 * antigo `canManageUsers` para preservar exatamente o acesso que a conta ja tinha
 * (`true` -> admin, ausente/false -> editor).
 */
export function resolveUserRole(data: { role?: unknown; canManageUsers?: unknown }): UserRole {
  if (isUserRole(data.role)) return data.role;
  return data.canManageUsers === true ? "admin" : DEFAULT_USER_ROLE;
}
