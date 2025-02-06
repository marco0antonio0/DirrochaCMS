import { db, IsStartedfirebaseConfig } from "@/config/config";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";


// 🔹 Interface para tipagem dos itens
interface Item {
  title: string;
  type: string;
  value: any;
  mult: boolean;
}

// 🔹 Função para transformar os itens no formato { title: value }
const formatDataObject = (items: Item[]) => {
  return items.reduce((acc, item) => {
    acc[item.title] = item.value;
    return acc;
  }, {} as Record<string, any>);
};

// 🔹 Função para adicionar um novo item sem sobrescrever os anteriores
export const createItemForEndpoint = async (endpointId: string, items: Item[]) => {
  if(!IsStartedfirebaseConfig) return null
  try {
    const endpointRef = doc(db, "endpoints", endpointId);
    const endpointSnap = await getDoc(endpointRef);

    if (!endpointSnap.exists()) {
      console.error("O endpoint não existe.");
      return { success: false, error: "O endpoint não foi encontrado." };
    }
    const formattedData = formatDataObject(items); // 🔹 Converte lista em objeto `{ title: value }`
    await addDoc(collection(db, "itens"), {
        endpointId,
        formattedData,
        createdAt: new Date(),
      });
    // console.log("Novo item adicionado ao endpoint com sucesso.");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar novo item no endpoint:", error);
    return { success: false, error };
  }
};
