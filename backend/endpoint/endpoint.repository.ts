import { db } from "@/backend/config/config";
import { ENDPOINT_COLLECTION } from "@/backend/endpoint/endpoint.entity";
import type { EndpointPayload, EndpointUpdatePayload } from "@/backend/endpoint/endpoint.model";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

export class EndpointRepository {
  async createEndpoint({ title, router, campos, fixedValuesEnabled, cacheTtlSeconds, accessMode, accessPassword }: EndpointPayload) {
    try {
      const docRef = await addDoc(collection(db, ENDPOINT_COLLECTION), {
        title,
        router,
        campos,
        fixedValuesEnabled: fixedValuesEnabled ?? false,
        cacheTtlSeconds: cacheTtlSeconds ?? 300,
        accessMode: accessMode ?? "public",
        accessPassword: accessMode === "password" ? accessPassword || "" : "",
        createdAt: new Date(),
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Erro ao salvar endpoint:", error);
      return { success: false, error };
    }
  }

  async getEndpoints() {
    try {
      const endpointRef = collection(db, ENDPOINT_COLLECTION);
      const querySnapshot = await getDocs(endpointRef);
      const endpoints = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      return { success: true, data: endpoints };
    } catch (error) {
      console.error("Erro ao listar endpoints:", error);
      return { success: false, error };
    }
  }

  async deleteEndpointById(endpointId: string) {
    try {
      const endpointRef = doc(db, ENDPOINT_COLLECTION, endpointId);
      await deleteDoc(endpointRef);
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar o endpoint:", error);
      return { success: false, error };
    }
  }

  async updateEndpointById(endpointId: string, payload: EndpointUpdatePayload) {
    try {
      const endpointRef = doc(db, ENDPOINT_COLLECTION, endpointId);
      await updateDoc(endpointRef, {
        ...payload,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar o endpoint:", error);
      return { success: false, error };
    }
  }
}

export const endpointRepository = new EndpointRepository();
