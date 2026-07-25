import "server-only";
import { adminDb } from "@/backend/config/admin";
import { AUDIT_COLLECTION, type AuditAction } from "@/backend/audit/audit.entity";
import type { Actor } from "@/backend/common/actor";

export interface AuditEntry {
  action: AuditAction;
  /** Quem executou. Ausente em tentativas de login (ainda nao ha identidade). */
  actor?: Actor | null;
  /** Conta afetada, quando a acao incide sobre outro usuario. */
  target?: { id?: string; email?: string } | null;
  summary: string;
  /** Contexto extra (papel anterior/novo, IP, motivo). Nunca inclua senha. */
  metadata?: Record<string, unknown>;
}

export class AuditService {
  /**
   * Grava uma entrada de auditoria.
   *
   * Nunca lanca: falhar a auditoria nao pode impedir a operacao auditada. Os erros vao
   * para o log do servidor.
   */
  async record(entry: AuditEntry) {
    try {
      await adminDb.collection(AUDIT_COLLECTION).add({
        action: entry.action,
        actor: entry.actor ?? null,
        target: entry.target ?? null,
        summary: entry.summary,
        metadata: entry.metadata ?? {},
        createdAt: new Date(),
      });
      return { success: true as const };
    } catch (error) {
      console.error("Erro ao gravar auditoria:", error);
      return { success: false as const, error };
    }
  }

  async list(max = 200) {
    try {
      const snapshot = await adminDb
        .collection(AUDIT_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(max)
        .get();

      return {
        success: true as const,
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    } catch (error) {
      console.error("Erro ao listar auditoria:", error);
      return { success: false as const, error, data: [] as any[] };
    }
  }
}

export const auditService = new AuditService();
