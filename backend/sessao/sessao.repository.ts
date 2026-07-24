import { db } from "@/backend/config/config";
import { SESSAO_COLLECTION } from "@/backend/sessao/sessao.entity";
import type { SessaoPayload } from "@/backend/sessao/sessao.model";
import { addDoc, collection, deleteDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

export class SessaoRepository {
  async createSessao({ email, token }: SessaoPayload) {
    try {
      const sessaoRef = collection(db, SESSAO_COLLECTION);
      const docRef = await addDoc(sessaoRef, {
        email,
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return { success: false, error };
    }
  }

  async updateSessao({ email, token }: SessaoPayload) {
    try {
      const sessaoSnap = await this.findSessaoSnapshot(email);

      if (sessaoSnap.empty) {
        return { success: false, error: "Sessão não encontrada" };
      }

      await updateDoc(sessaoSnap.docs[0].ref, { token, updatedAt: new Date() });
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return { success: false, error };
    }
  }

  async getSessaoByEmail(email: string) {
    try {
      const sessaoSnap = await this.findSessaoSnapshot(email);

      if (sessaoSnap.empty) {
        return { success: false, error: "Sessão não encontrada" };
      }

      return { success: true, data: sessaoSnap.docs[0].data() };
    } catch (error) {
      console.error("Erro ao buscar sessão:", error);
      return { success: false, error };
    }
  }

  async deleteSessao(email: string) {
    try {
      const sessaoSnap = await this.findSessaoSnapshot(email);

      if (sessaoSnap.empty) {
        return { success: false, error: "Sessão não encontrada" };
      }

      await deleteDoc(sessaoSnap.docs[0].ref);
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
      return { success: false, error };
    }
  }

  private findSessaoSnapshot(email: string) {
    const sessaoRef = collection(db, SESSAO_COLLECTION);
    const sessaoQuery = query(sessaoRef, where("email", "==", email));
    return getDocs(sessaoQuery);
  }
}

export const sessaoRepository = new SessaoRepository();
