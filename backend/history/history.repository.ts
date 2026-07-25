import "server-only";
import { adminDb } from "@/backend/config/admin";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import { HISTORY_SUBCOLLECTION } from "@/backend/history/history.entity";
import type { HistoryEntryPayload } from "@/backend/history/history.model";

const historyRef = (endpointId: string) =>
  adminDb.collection(ENDPOINT_COLLECTION).doc(endpointId).collection(HISTORY_SUBCOLLECTION);

export class HistoryRepository {
  async addEntry(endpointId: string, payload: HistoryEntryPayload) {
    try {
      await historyRef(endpointId).add({
        ...payload,
        // Entradas anteriores gravavam `actor.id` com o e-mail (o id verificado nao
        // existia ainda). O marcador permite distinguir os formatos depois.
        schema: 2,
        createdAt: new Date(),
      });

      return { success: true as const };
    } catch (error) {
      console.error("Erro ao registrar historico do endpoint:", error);
      return { success: false as const, error };
    }
  }

  async listEntries(endpointId: string, max = 200) {
    try {
      const snapshot = await historyRef(endpointId).orderBy("createdAt", "desc").limit(max).get();
      return {
        success: true as const,
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    } catch (error) {
      console.error("Erro ao buscar historico do endpoint:", error);
      return { success: false as const, error, data: [] as any[] };
    }
  }
}

export const historyRepository = new HistoryRepository();
