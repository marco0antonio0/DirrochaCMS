import "server-only";
import { adminDb } from "@/backend/config/admin";
import { AUTH_COLLECTIONS } from "@/backend/auth/auth.entity";

/**
 * Acesso ao administrador legado (`users/default`).
 *
 * Existe apenas para migrar o acesso antigo (senha unica compartilhada, identidade
 * nao verificada) para o modelo por usuario em `users_collections`. Depois que
 * `migratedAt` esta marcado, este documento deixa de ser caminho de autenticacao.
 */

const legacyDocRef = () =>
  adminDb.collection(AUTH_COLLECTIONS.legacyUsers).doc(AUTH_COLLECTIONS.legacyDefaultUser);

export interface LegacyUser {
  name: string;
  password: string;
  migratedAt?: unknown;
}

export class AuthRepository {
  async getLegacyUser(): Promise<LegacyUser | null> {
    try {
      const doc = await legacyDocRef().get();
      if (!doc.exists) return null;
      return doc.data() as LegacyUser;
    } catch (error) {
      console.error("Erro ao obter usuario legado:", error);
      return null;
    }
  }

  /** O acesso legado ainda pode autenticar? */
  async isLegacyLoginAvailable() {
    const legacy = await this.getLegacyUser();
    return !!legacy && !legacy.migratedAt;
  }

  async markLegacyAsMigrated(targetUserId: string) {
    await legacyDocRef().set(
      { migratedAt: new Date(), migratedToUserId: targetUserId },
      { merge: true },
    );
  }
}

export const authRepository = new AuthRepository();
