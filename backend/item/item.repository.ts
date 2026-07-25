import { db } from "@/backend/config/config";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import { ITEM_SUBCOLLECTION } from "@/backend/item/item.entity";
import type { Actor } from "@/backend/common/actor";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

export class ItemRepository {
  async deleteItemById({ itemId, endpointId }: { itemId: string; endpointId: string }) {
    try {
      const itemRef = doc(db, `${ENDPOINT_COLLECTION}/${endpointId}/${ITEM_SUBCOLLECTION}`, itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        return { success: false, error: "O item não foi encontrado." };
      }

      const deletedItem = { id: itemSnap.id, ...itemSnap.data() };
      await deleteDoc(itemRef);
      return { success: true, data: deletedItem };
    } catch (error) {
      console.error("Erro ao deletar o item:", error);
      return { success: false, error };
    }
  }

  async createItemForEndpoint(endpointId: string, items: any[], actor?: Actor) {
    try {
      const endpointRef = doc(db, ENDPOINT_COLLECTION, endpointId);
      const endpointSnap = await getDoc(endpointRef);

      if (!endpointSnap.exists()) {
        return { success: false, error: "O endpoint não foi encontrado." };
      }

      const formattedData = this.toFormattedData(items);
      const itemRef = collection(db, `${ENDPOINT_COLLECTION}/${endpointId}/${ITEM_SUBCOLLECTION}`);
      const docRef = await addDoc(itemRef, {
        endpointId,
        formattedData,
        ...(actor ? { createdBy: actor } : {}),
        createdAt: new Date(),
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Erro ao criar novo item no endpoint:", error);
      return { success: false, error };
    }
  }

  async getItemsByEndpoint(endpointId: string) {
    try {
      const itemsRef = collection(db, `${ENDPOINT_COLLECTION}/${endpointId}/${ITEM_SUBCOLLECTION}`);
      const itemsQuery = query(itemsRef, where("endpointId", "==", endpointId));
      const querySnapshot = await getDocs(itemsQuery);
      const items = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      return { success: true, data: items };
    } catch (error) {
      console.error("Erro ao buscar itens do endpoint:", error);
      return { success: false, error };
    }
  }

  async updateItemForEndpoint({ itemId, endpointId, items }: { itemId: string; endpointId: string; items: any[] }, actor?: Actor) {
    try {
      const itemRef = doc(db, `${ENDPOINT_COLLECTION}/${endpointId}/${ITEM_SUBCOLLECTION}`, itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        return { success: false, error: "O item não foi encontrado." };
      }

      const existingData = itemSnap.data()?.formattedData || {};
      const formattedData = {
        ...existingData,
        ...this.toFormattedData(items),
      };

      await updateDoc(itemRef, {
        formattedData,
        ...(actor ? { updatedBy: actor } : {}),
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return { success: false, error };
    }
  }

  private toFormattedData(items: any[]) {
    return items.reduce<Record<string, unknown>>((acc, item) => {
      acc[item.title] = item.value;
      return acc;
    }, {});
  }
}

export const itemRepository = new ItemRepository();
