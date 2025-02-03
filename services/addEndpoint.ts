import { firebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// 🔹 Inicializa o Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Função para adicionar um novo endpoint ao Firestore
export const addEndpoint = async (title: string, router: string, campos: string[]) => {
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
