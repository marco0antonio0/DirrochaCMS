import { adminApi } from "@/app/services/adminApi";

/**
 * Existe sessao valida?
 *
 * O cookie e HttpOnly, portanto nao ha como inspecionar o token no browser: a resposta
 * vem do servidor, que verifica assinatura, revogacao e se a conta esta ativa.
 */
export async function checkAuth() {
  try {
    await adminApi.auth.me();
    return true;
  } catch {
    return false;
  }
}
