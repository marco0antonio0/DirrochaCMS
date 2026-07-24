import { db, IsStartedfirebaseConfig } from "@/backend/config/config";
import { AUTH_COLLECTIONS } from "@/backend/auth/auth.entity";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class AuthRepository {
  async getLegacyUser() {
    if (!IsStartedfirebaseConfig) return null;

    try {
      const docRef = doc(db, AUTH_COLLECTIONS.legacyUsers, AUTH_COLLECTIONS.legacyDefaultUser);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data();
    } catch (error) {
      console.error("Erro ao obter dados:", error);
      return null;
    }
  }

  async saveLegacyUser(data: { name: string; password: string }) {
    if (!IsStartedfirebaseConfig) return null;

    try {
      const docRef = doc(db, AUTH_COLLECTIONS.legacyUsers, AUTH_COLLECTIONS.legacyDefaultUser);
      await setDoc(docRef, data);
      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      return { success: false, error };
    }
  }
}

export const authRepository = new AuthRepository();
export const getData = () => authRepository.getLegacyUser();
export const saveData = (data: { name: string; password: string }) => authRepository.saveLegacyUser(data);
