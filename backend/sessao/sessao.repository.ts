import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { adminDb } from "@/backend/config/admin";
import { SESSAO_COLLECTION } from "@/backend/sessao/sessao.entity";
import { SESSION_MAX_AGE_SECONDS } from "@/backend/common/tokens";

/**
 * Sessoes.
 *
 * Diferencas em relacao ao modelo anterior:
 * - um documento por login (id aleatorio `sid`), em vez de um por e-mail. Permite
 *   varios dispositivos ao mesmo tempo sem que um login derrube o outro.
 * - guarda apenas o SHA-256 do token. Um vazamento da colecao nao entrega token vivo.
 */

const sessoesRef = () => adminDb.collection(SESSAO_COLLECTION);

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const safeEqualHex = (a: string, b: string) => {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

export class SessaoRepository {
  /** Cria a sessao e devolve o `sid`, que vai dentro do token. */
  async createSessao({ userId, email }: { userId: string; email: string }) {
    const sid = randomBytes(18).toString("hex");
    const agora = new Date();

    await sessoesRef().doc(sid).set({
      userId,
      email,
      createdAt: agora,
      updatedAt: agora,
      // Espelha a validade do token. Permite configurar uma politica de TTL no
      // Firestore para apagar o documento automaticamente, e serve de base para a
      // limpeza abaixo.
      expiresAt: new Date(agora.getTime() + SESSION_MAX_AGE_SECONDS * 1000),
    });

    // Oportunistico: aproveita o login para remover sessoes vencidas do usuario, em vez
    // de exigir um cron so para isso.
    void this.deleteExpiredSessoesByUserId(userId).catch(() => {});

    return sid;
  }

  /**
   * Remove sessoes ja vencidas do usuario.
   *
   * Sem isso os documentos acumulam para sempre. Nao e questao de acesso -- um token
   * expirado ja falha na verificacao de assinatura -- mas de custo e ruido.
   */
  async deleteExpiredSessoesByUserId(userId: string) {
    const snapshot = await sessoesRef()
      .where("userId", "==", userId)
      .where("expiresAt", "<", new Date())
      .limit(50)
      .get();

    if (snapshot.empty) return { success: true as const, removed: 0 };

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { success: true as const, removed: snapshot.size };
  }

  /** Grava o hash do token apos assinado (o token carrega o proprio `sid`). */
  async attachTokenHash(sid: string, token: string) {
    await sessoesRef().doc(sid).update({
      tokenHash: hashToken(token),
      updatedAt: new Date(),
    });
  }

  /** A sessao existe e o token apresentado e o mesmo que a originou? */
  async isSessionValid(sid: string, token: string) {
    const doc = await sessoesRef().doc(sid).get();
    if (!doc.exists) return false;

    const stored = doc.data()?.tokenHash;
    if (typeof stored !== "string") return false;

    return safeEqualHex(stored, hashToken(token));
  }

  async deleteSessao(sid: string) {
    await sessoesRef().doc(sid).delete();
    return { success: true as const };
  }

  /** Usado ao desativar/excluir usuario: revoga todas as sessoes dele. */
  async deleteSessoesByUserId(userId: string) {
    const snapshot = await sessoesRef().where("userId", "==", userId).get();
    if (snapshot.empty) return { success: true as const, removed: 0 };

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { success: true as const, removed: snapshot.size };
  }
}

export const sessaoRepository = new SessaoRepository();
