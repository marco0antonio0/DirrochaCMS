import { db } from "@/backend/config/config";
import { USER_COLLECTION } from "@/backend/user/user.entity";
import type { UserPayload, UserUpdatePayload } from "@/backend/user/user.model";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

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
    const docRef = await addDoc(userRef, {
      ...userData,
      disabled: userData.disabled ?? false,
      canManageUsers: userData.canManageUsers ?? false,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  async updateUserById(userId: string, payload: UserUpdatePayload) {
    const userDocRef = doc(db, USER_COLLECTION, userId);
    await updateDoc(userDocRef, {
      ...payload,
      updatedAt: new Date(),
    });
    return { success: true };
  }

  async deleteUserById(userId: string) {
    try {
      const userDocRef = doc(db, USER_COLLECTION, userId);
      await deleteDoc(userDocRef);
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return { success: false, error: "Erro ao deletar usuário" };
    }
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
