import { db, IsStartedfirebaseConfig } from "@/config/config";
import { doc, updateDoc, getDoc } from "firebase/firestore";


// 🔹 Interface para tipagem dos itens
interface Item {
  title: string;
  type: string;
  value: any;
}

// 🔹 Função para transformar os itens no formato { title: value }
const formatDataObject = (items: Item[]) => {
  return items.reduce((acc, item) => {
    acc[item.title] = item.value;
    return acc;
  }, {} as Record<string, any>);
};
export const updateItemForEndpoint = async (itemId: string, items: Item[]) => {
  if(!IsStartedfirebaseConfig) return null

  try {
    const itemRef = doc(db, "itens", itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      console.error("O item não existe.");
      return { success: false, error: "O item não foi encontrado." };
    }

    // Obtém os dados atuais do Firestore
    const existingData = itemSnap.data()?.formattedData || {};

    // Mescla os novos valores com os existentes
    const formattedData = {
      ...existingData, // 🔹 Mantém os dados antigos
      ...formatDataObject(items), // 🔹 Sobrescreve apenas os valores atualizados
    };

    // console.log("Dados mesclados:", formattedData);

    await updateDoc(itemRef, {
      formattedData,
      updatedAt: new Date(),
    });

    // console.log("Item atualizado com sucesso.");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return { success: false, error };
  }
};
