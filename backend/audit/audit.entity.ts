export const AUDIT_COLLECTION = "audit_log";

/**
 * Acoes auditadas de nivel de sistema.
 *
 * O historico de conteudo vive em `endpoints/{id}/history`, junto do recurso. Estas
 * acoes nao pertencem a nenhum endpoint, por isso ficam numa colecao propria -- e
 * tambem para nao serem apagadas junto com um endpoint.
 */
export const AUDIT_ACTIONS = [
  "user_created",
  "user_updated",
  "user_role_changed",
  "user_enabled",
  "user_disabled",
  "user_deleted",
  "user_password_changed",
  "login_succeeded",
  "login_failed",
  "login_blocked",
  "legacy_account_migrated",
  "first_admin_created",
  "endpoint_deleted",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];
