import { firebaseConfig, IsStartedfirebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";

/**
 * Deleta um item pelo ID no Firestore.
 * @param itemId ID do item a ser deletado.
 * @returns {Promise<{ success: boolean; error?: any }>}
 */



export const deleteItemById = async (itemId: string) => {
  if(!IsStartedfirebaseConfig) return null
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app); 
  try {
    const itemRef = doc(db, "itens", itemId);
    await deleteDoc(itemRef);

    // console.log(`Item com ID ${itemId} deletado com sucesso.`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar o item:", error);
    return { success: false, error };
  }
};
