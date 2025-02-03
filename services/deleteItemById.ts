import { firebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";

/**
 * Deleta um item pelo ID no Firestore.
 * @param itemId ID do item a ser deletado.
 * @returns {Promise<{ success: boolean; error?: any }>}
 */

// 🔹 Inicializa o Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const deleteItemById = async (itemId: string) => {
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
