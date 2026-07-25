import "server-only";
import { hkdfSync } from "node:crypto";

/**
 * Derivacao de subchaves a partir do SECRET_KEY.
 *
 * Usar o mesmo segredo diretamente para propositos diferentes (assinar sessao e
 * autenticar senha de endpoint) e ma pratica: uma fraqueza descoberta em um uso passa a
 * afetar o outro. Com HKDF cada finalidade recebe uma chave independente, derivada por
 * um rotulo -- e nenhuma delas permite recuperar as outras.
 *
 * A derivacao e deterministica, portanto nao exige nada novo no ambiente.
 */

const PURPOSES = {
  endpointPassword: "dirrochacms:endpoint-password:v1",
} as const;

export type KeyPurpose = keyof typeof PURPOSES;

function getMasterSecret() {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error("SECRET_KEY ausente: nao e possivel derivar chaves.");
  return secret;
}

const cache = new Map<KeyPurpose, Buffer>();

export function deriveKey(purpose: KeyPurpose): Buffer {
  const cached = cache.get(purpose);
  if (cached) return cached;

  // Sem salt: o rotulo (`info`) e o que separa os propositos, e precisa ser estavel
  // entre reinicios para que os valores ja gravados continuem verificaveis.
  const derived = Buffer.from(hkdfSync("sha256", getMasterSecret(), "", PURPOSES[purpose], 32));
  cache.set(purpose, derived);
  return derived;
}
