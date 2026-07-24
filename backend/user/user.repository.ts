import { db } from "@/backend/config/config";
import { AUTH_SETTINGS_DOC, CONFIGURATION_COLLECTION, USER_COLLECTION } from "@/backend/user/user.entity";
import type { AuthVisibilitySettings, UserPayload } from "@/backend/user/user.model";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

export class UserRepository {
  async findUserByEmail(email: string) {
    const usersRef = collection(db, USER_COLLECTION);
    const usersQuery = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  }

  async findUsers() {
    const querySnapshot = await getDocs(collection(db, USER_COLLECTION));
    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  }

  async createUser(userData: UserPayload) {
    const userRef = collection(db, USER_COLLECTION);
    const docRef = await addDoc(userRef, userData);
    return docRef.id;
  }

  async setAuthVisibility(status: AuthVisibilitySettings) {
    const settingsRef = doc(db, CONFIGURATION_COLLECTION, AUTH_SETTINGS_DOC);
    await setDoc(settingsRef, {
      loginEnabled: status.login,
      registerEnabled: status.register,
      logoutEnabled: status.logout,
    });
  }

  async getAuthVisibility() {
    const settingsRef = doc(db, CONFIGURATION_COLLECTION, AUTH_SETTINGS_DOC);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        loginEnabled: settingsDoc.data().loginEnabled ?? false,
        registerEnabled: settingsDoc.data().registerEnabled ?? false,
        logoutEnabled: settingsDoc.data().logoutEnabled ?? false,
      };
    }

    return { loginEnabled: false, registerEnabled: false, logoutEnabled: false };
  }

  async deleteUserByEmail(email: string) {
    try {
      const usersRef = collection(db, USER_COLLECTION);
      const usersQuery = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(usersQuery);
      const userDoc = snapshot.docs[0];

      if (!userDoc) return { success: false, error: "Usuário não encontrado" };

      const userDocRef = doc(db, USER_COLLECTION, userDoc.id);
      await deleteDoc(userDocRef);

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return { success: false, error: "Erro ao deletar usuário" };
    }
  }
}

export const userRepository = new UserRepository();
