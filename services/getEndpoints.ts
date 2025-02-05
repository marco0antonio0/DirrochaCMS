import { firebaseConfig, IsStartedfirebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// 🔹 Função para listar os endpoints do Firestore
export const getEndpoints = async () => {
  if(!IsStartedfirebaseConfig) return null
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app); 
  try {
    const querySnapshot = await getDocs(collection(db, "endpoints"));
    const endpoints = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: endpoints };
  } catch (error) {
    console.error("Erro ao listar endpoints:", error);
    return { success: false, error };
  }
};
