import { db } from "@/config/config";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

export const userRepository = {
    async findUserByEmail(email: string) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : snapshot.docs[0].data();
    },
  
    async createUser(userData: any) {
      const userRef = collection(db, 'users');
      const docRef = await addDoc(userRef, userData);
      return docRef.id;
    },
  };