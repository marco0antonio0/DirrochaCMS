import { db } from "@/backend/config/config";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import { HISTORY_SUBCOLLECTION } from "@/backend/history/history.entity";
import type { HistoryEntryPayload } from "@/backend/history/history.model";
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";

export class HistoryRepository {
  async addEntry(endpointId: string, payload: HistoryEntryPayload) {
    try {
      const historyRef = collection(db, `${ENDPOINT_COLLECTION}/${endpointId}/${HISTORY_SUBCOLLECTION}`);
      await addDoc(historyRef, {
        ...payload,
        createdAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao registrar histórico do endpoint:", error);
      return { success: false, error };
    }
  }

  async listEntries(endpointId: string, max = 200) {
    try {
      const historyRef = collection(db, `${ENDPOINT_COLLECTION}/${endpointId}/${HISTORY_SUBCOLLECTION}`);
      const historyQuery = query(historyRef, orderBy("createdAt", "desc"), limit(max));
      const querySnapshot = await getDocs(historyQuery);
      const entries = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      return { success: true, data: entries };
    } catch (error) {
      console.error("Erro ao buscar histórico do endpoint:", error);
      return { success: false, error, data: [] };
    }
  }
}

export const historyRepository = new HistoryRepository();
