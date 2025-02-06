import { firebaseConfig, IsStartedfirebaseConfig } from "@/config/config";
import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import toast from "react-hot-toast";

/**
 * Deleta um item pelo ID no Firestore.
 * @param itemId ID do item a ser deletado.
 * @returns {Promise<{ success: boolean; error?: any }>}
 */



export const deleteItemById = async (itemId: string) => {
  const toastId = toast.loading("Deletando item do endpoint ...",{duration:4000})
  if(!IsStartedfirebaseConfig) return null
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app); 
  try {
    const itemRef = doc(db, "itens", itemId);
    await deleteDoc(itemRef);

    // console.log(`Item com ID ${itemId} deletado com sucesso.`);
    toast.success("Item do endpoint deletado com sucesso",{duration:4000})
    toast.dismiss(toastId)
    return { success: true };
  } catch (error) {
    toast.dismiss(toastId)
    toast.error("Error ao deletar o item do endpoint ",{duration:4000})
    console.error("Erro ao deletar o item:", error);
    return { success: false, error };
  }
};
