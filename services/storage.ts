import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { db, firebaseConfig, IsStartedfirebaseConfig } from "@/config/config";

export const getData = async () => {
  if(!IsStartedfirebaseConfig) return null
  try {
    const docRef = doc(db, "users", "default"); // "default" pode ser qualquer ID padrão
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }
    var data = docSnap.data();
    return data;
  } catch (error) {
    console.error("Erro ao obter dados:", error);
    return null;
  }
};

export const saveData = async (data: { name: string; password: string }) => {
  if(!IsStartedfirebaseConfig) return null
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app); 
  try {
    const docRef = doc(db, "users", "default"); 
    await setDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    return { success: false, error };
  }
};
