import { db } from "@/config/config";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

export const userRepository = {
    async findUserByEmail(email: string) {
      const usersRef = collection(db, 'users_collections');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : snapshot.docs[0].data();
    },
    async findUsers() {
      const querySnapshot = await getDocs(collection(db, 'users_collections'));
      const endpoints = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return endpoints
    },
  
    async createUser(userData: any) {
      const userRef = collection(db, 'users_collections');
      const docRef = await addDoc(userRef, userData);
      return docRef.id;
    },

    async setAuthVisibility(status: { login: boolean; register: boolean, logout:boolean }) {
      const settingsRef = doc(db, 'configurations', 'auth_settings');
      await setDoc(settingsRef, { 
          loginEnabled: status.login, 
          registerEnabled: status.register,
          logoutEnabled: status.logout
      });
  },

  async getAuthVisibility() {
      const settingsRef = doc(db, 'configurations', 'auth_settings');
      const settingsDoc = await getDoc(settingsRef);
      if (settingsDoc.exists()) {
          return {
              loginEnabled: settingsDoc.data().loginEnabled ?? false,
              registerEnabled: settingsDoc.data().registerEnabled ?? false
          };
      }
      return { loginEnabled: false, registerEnabled: false };
  },
  async deleteUserByEmail(email: string) {
    try {
      const usersRef = collection(db, 'users_collections');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      const userDoc = snapshot.docs[0];
      const idUser = userDoc.id;
      if (!userDoc) return { success: false, error: "Usuário não encontrado" };
      const userDocRef = doc(db, "users_collections", idUser);
      await deleteDoc(userDocRef);
      return { success: true };
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        return { success: false, error: "Erro ao deletar usuário" };
    }
},
    
  };