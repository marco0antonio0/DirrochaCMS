import { db } from '@/config/config';
import { doc, deleteDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export const itemRepository = {
  async deleteItemById({itemId, endpointId}:{itemId: string,endpointId: string}) {
    try {
      const itemRef = doc(db, 'endpoints/'+endpointId+'/itens', itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        return { success: false, error: 'O item não foi encontrado.' };
      }

      await deleteDoc(itemRef);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar o item:', error);
      return { success: false, error };
    }
  },
  async createItemForEndpoint(endpointId: string, items: any[]) {
    try {
      const endpointRef = doc(db, 'endpoints/', endpointId);
      const endpointSnap = await getDoc(endpointRef);
      if (!endpointSnap.exists()) {
        return { success: false, error: 'O endpoint não foi encontrado.' };
      }
      
      const formattedData = items.reduce((acc, item) => {
        acc[item.title] = item.value;
        return acc;
      }, {});
      const itemRef = collection(db, 'endpoints/'+endpointId+'/itens')
      await addDoc(itemRef, {
        endpointId,
        formattedData,
        createdAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar novo item no endpoint:', error);
      return { success: false, error };
    }
  },
  async getItemsByEndpoint(endpointId: string) {
    try {
      const itemsRef = collection(db, 'endpoints/'+endpointId+'/itens');
      const q = query(itemsRef, where('endpointId', '==', endpointId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: items };
    } catch (error) {
      console.error('Erro ao buscar itens do endpoint:', error);
      return { success: false, error };
    }
  },
  async updateItemForEndpoint({itemId,endpointId, items}:{itemId: string,endpointId: string, items: any[]}) {
    try {
      const itemRef = doc(db, 'endpoints/'+endpointId+'/itens', itemId);
      const itemSnap = await getDoc(itemRef);

      if (!itemSnap.exists()) {
        return { success: false, error: 'O item não foi encontrado.' };
      }

      const existingData = itemSnap.data()?.formattedData || {};
      const formattedData = {
        ...existingData,
        ...items.reduce((acc, item) => {
          acc[item.title] = item.value;
          return acc;
        }, {}),
      };

      await updateDoc(itemRef, {
        formattedData,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { success: false, error };
    }
  },
};