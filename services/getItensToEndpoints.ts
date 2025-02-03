import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();

// 🔹 Função para buscar itens de um endpoint específico
export const getItemsByEndpoint = async (endpointId: string) => {
  try {
    const itemsRef = collection(db, "itens"); // 🔹 Coleção "itens"
    const q = query(itemsRef, where("endpointId", "==", endpointId)); // 🔹 Filtra apenas os itens do endpoint
    const querySnapshot = await getDocs(q);

    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: items };
  } catch (error) {
    console.error("Erro ao buscar itens do endpoint:", error);
    return { success: false, error };
  }
};
