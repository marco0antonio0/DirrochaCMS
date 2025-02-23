import { db } from "@/config/config";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export class SessaoRepository {
  
  async createSessao({ email, token }: { email: string; token: string }) {
    try {
      const userRef = collection(db, "sessao_collections");
      const docRef = await addDoc(userRef, { email, token, createdAt: new Date(), updatedAt: new Date() });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      return { success: false, error };
    }
  }

  async updateSessao({ email, token }: { email: string; token: string }) {
    try {
      const sessaoRef = collection(db, "sessao_collections");
      const q = query(sessaoRef, where("email", "==", email));
      const sessaoSnap = await getDocs(q);

      if (sessaoSnap.empty) {
        return { success: false, error: "Sessão não encontrada" };
      }

      const docRef = sessaoSnap.docs[0].ref;
      await updateDoc(docRef, { token, updatedAt: new Date() });

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      return { success: false, error };
    }
  }

  async getSessaoByEmail(email: string) {
    try {
      const sessaoRef = collection(db, "sessao_collections");
      const q = query(sessaoRef, where("email", "==", email));
      const sessaoSnap = await getDocs(q);

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
      const sessaoRef = collection(db, "sessao_collections");
      const q = query(sessaoRef, where("email", "==", email));
      const sessaoSnap = await getDocs(q);

      if (sessaoSnap.empty) {
        return { success: false, error: "Sessão não encontrada" };
      }

      const docRef = sessaoSnap.docs[0].ref;
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar sessão:", error);
      return { success: false, error };
    }
  }
}
