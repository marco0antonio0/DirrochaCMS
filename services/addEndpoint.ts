import { db, firebaseConfig, IsStartedfirebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";


// 🔹 Função para adicionar um novo endpoint ao Firestore
export const addEndpoint = async (title: string, router: string, campos: string[]) => {
  if(!IsStartedfirebaseConfig) return null
  try {
    const docRef = await addDoc(collection(db, "endpoints"), {
      title,
      router,
      campos, 
      createdAt: new Date(),
    });

    // console.log("Documento salvo com ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao salvar endpoint:", error);
    return { success: false, error };
  }
};
