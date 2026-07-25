import "server-only";
import { adminDb } from "@/backend/config/admin";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import { ITEM_SUBCOLLECTION } from "@/backend/item/item.entity";
import type { Actor } from "@/backend/common/actor";

const itemsRef = (endpointId: string) =>
  adminDb.collection(ENDPOINT_COLLECTION).doc(endpointId).collection(ITEM_SUBCOLLECTION);

export class ItemRepository {
  async deleteItemById({ itemId, endpointId }: { itemId: string; endpointId: string }) {
    try {
      const ref = itemsRef(endpointId).doc(itemId);
      const snap = await ref.get();

      if (!snap.exists) {
        return { success: false as const, error: "O item nao foi encontrado." };
      }

      // Captura antes de apagar, para o historico poder descrever o que saiu.
      const deletedItem = { id: snap.id, ...snap.data() };
      await ref.delete();

      return { success: true as const, data: deletedItem };
    } catch (error) {
      console.error("Erro ao deletar o item:", error);
      return { success: false as const, error };
    }
  }

  async createItemForEndpoint(endpointId: string, items: any[], actor?: Actor) {
    try {
      const endpointSnap = await adminDb.collection(ENDPOINT_COLLECTION).doc(endpointId).get();
      if (!endpointSnap.exists) {
        return { success: false as const, error: "O endpoint nao foi encontrado." };
      }

      const docRef = await itemsRef(endpointId).add({
        endpointId,
        formattedData: this.toFormattedData(items),
        ...(actor ? { createdBy: actor } : {}),
        createdAt: new Date(),
      });

      return { success: true as const, id: docRef.id };
    } catch (error) {
      console.error("Erro ao criar novo item no endpoint:", error);
      return { success: false as const, error };
    }
  }

  async getItemsByEndpoint(endpointId: string) {
    try {
      const snapshot = await itemsRef(endpointId).get();
      return {
        success: true as const,
        data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      };
    } catch (error) {
      console.error("Erro ao buscar itens do endpoint:", error);
      return { success: false as const, error, data: [] as any[] };
    }
  }

  async updateItemForEndpoint(
    { itemId, endpointId, items }: { itemId: string; endpointId: string; items: any[] },
    actor?: Actor,
  ) {
    try {
      const ref = itemsRef(endpointId).doc(itemId);
      const snap = await ref.get();

      if (!snap.exists) {
        return { success: false as const, error: "O item nao foi encontrado." };
      }

      const existingData = snap.data()?.formattedData || {};

      await ref.update({
        formattedData: { ...existingData, ...this.toFormattedData(items) },
        ...(actor ? { updatedBy: actor } : {}),
        updatedAt: new Date(),
      });

      return { success: true as const };
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return { success: false as const, error };
    }
  }

  /**
   * Os nomes de campo ja foram validados contra o schema em `itemValidation.ts`. A
   * blindagem aqui e defesa em profundidade: `Object.create(null)` nao tem prototipo,
   * portanto uma chave como `__proto__` viraria uma propriedade comum em vez de
   * alterar o objeto silenciosamente.
   */
  private toFormattedData(items: Array<{ title: string; value: unknown }>) {
    const destino = Object.create(null) as Record<string, unknown>;
    for (const item of items) {
      destino[item.title] = item.value;
    }
    // Volta a ser um objeto comum para o serializador do Firestore.
    return { ...destino };
  }
}

export const itemRepository = new ItemRepository();
