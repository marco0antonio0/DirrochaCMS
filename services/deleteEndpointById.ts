import {  db, IsStartedfirebaseConfig } from "@/config/config";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";

/**
 * Deleta um item pelo ID no Firestore.
 * @param itemId ID do item a ser deletado.
 * @returns {Promise<{ success: boolean; error?: any }>}
 */


export const deleteEndpointIdById = async (endpointId: string) => {
  if(!IsStartedfirebaseConfig) return null
    const toastId = toast.loading("Deletando endpoint ...",{duration:4000});
    try {
    const itemRef = doc(db, "endpoints", endpointId);
    await deleteDoc(itemRef);

    // console.log(`Item com ID ${endpointId} deletado com sucesso.`);
    toast.success("Endpoint deletado com sucesso",{duration:4000})
    toast.dismiss(toastId)
    return { success: true };
  } catch (error) {
    toast.error("Erro ao deleta o endpoint ",{duration:4000})
    toast.dismiss(toastId)
    console.error("Erro ao deletar o item:", error);
    return { success: false, error };
  }
};
