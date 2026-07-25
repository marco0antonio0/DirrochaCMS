import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { deriveKey } from "@/backend/common/keys";

/**
 * Senha de acesso dos endpoints privados.
 *
 * Usa HMAC-SHA256, nao bcrypt, de proposito: isto e um segredo de maquina compartilhado
 * com quem consome a API, verificado na rota publica `/api/[router]` a cada request.
 * bcrypt custaria ~60-100ms por chamada e viraria vetor de exaustao de CPU. bcrypt
 * continua sendo usado para senhas humanas de login, onde o custo e desejavel.
 *
 * A chave e derivada do SECRET_KEY via HKDF, e nao o SECRET_KEY em si: assim o segredo
 * que assina sessoes e o que autentica senhas de endpoint sao criptograficamente
 * independentes.
 */

export const hashEndpointPassword = (password: string) =>
  createHmac("sha256", deriveKey("endpointPassword")).update(password).digest("hex");

export function verifyEndpointPassword(
  provided: string,
  stored: { accessPasswordHash?: string; accessPassword?: string },
) {
  if (!provided) return false;

  if (stored.accessPasswordHash) {
    const a = Buffer.from(hashEndpointPassword(provided), "hex");
    const b = Buffer.from(stored.accessPasswordHash, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }

  // Compatibilidade com documentos ainda nao migrados. Comparacao em tempo constante
  // mesmo aqui; remover junto com o campo `accessPassword` apos a migracao.
  if (stored.accessPassword) {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(stored.accessPassword, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  }

  return false;
}
