import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/backend/config/admin";

/**
 * Rate limiting com janela fixa, persistido no Firestore.
 *
 * Firestore (e nao memoria) porque em ambiente serverless cada instancia tem seu
 * proprio processo: um contador em memoria seria contornavel simplesmente batendo
 * varias vezes ate cair numa instancia nova.
 *
 * A chave e hasheada: nao guardamos e-mail nem IP em texto puro so para contar.
 */

const RATE_LIMIT_COLLECTION = "rate_limits";

export interface RateLimitResult {
  allowed: boolean;
  /** Quantas tentativas ainda restam na janela. */
  remaining: number;
  /** Segundos até a janela reabrir; use no header Retry-After. */
  retryAfterSeconds: number;
}

const hashKey = (key: string) => createHash("sha256").update(key).digest("hex").slice(0, 32);

/**
 * Consome uma tentativa para `key`.
 *
 * Contagem e feita numa transacao para que rajadas paralelas nao escapem do limite.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const ref = adminDb.collection(RATE_LIMIT_COLLECTION).doc(hashKey(key));
  const agora = Date.now();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const dados = snap.data();

      const inicioJanela = typeof dados?.windowStart === "number" ? dados.windowStart : 0;
      const janelaExpirou = agora - inicioJanela >= windowSeconds * 1000;

      const contagem = janelaExpirou ? 0 : Number(dados?.count ?? 0);
      const inicio = janelaExpirou ? agora : inicioJanela;

      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((inicio + windowSeconds * 1000 - agora) / 1000),
      );

      if (contagem >= limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      tx.set(
        ref,
        {
          windowStart: inicio,
          count: contagem + 1,
          // `expiresAt` permite configurar uma politica de TTL no Firestore para
          // limpar estes documentos automaticamente.
          expiresAt: new Date(inicio + windowSeconds * 1000),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return {
        allowed: true,
        remaining: Math.max(0, limit - (contagem + 1)),
        retryAfterSeconds,
      };
    });
  } catch (error) {
    // Fail-open deliberado: se o Firestore oscilar, e melhor aceitar a requisicao do
    // que derrubar o login inteiro. O limite e defesa contra abuso, nao a fronteira
    // de autorizacao (essa e o withAuth).
    console.error("Rate limit indisponivel, liberando requisicao:", error);
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Zera o contador — usado depois de um login bem-sucedido. */
export async function resetRateLimit(key: string) {
  try {
    await adminDb.collection(RATE_LIMIT_COLLECTION).doc(hashKey(key)).delete();
  } catch (error) {
    console.error("Erro ao limpar rate limit:", error);
  }
}

/**
 * IP do cliente.
 *
 * Atras de proxy (Vercel, nginx) o IP real vem em `x-forwarded-for`. Usamos o PRIMEIRO
 * valor da lista, que e o do cliente; os seguintes sao dos proxies.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") || "desconhecido";
}
